import {
  ref,
  set,
  get,
  push,
  onValue,
  onChildAdded,
  remove,
  onDisconnect,
} from 'firebase/database';
import { rtdb } from '../firebase/config';

export interface RoomChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  type?: 'chat' | 'sign' | 'speech';
}

export interface WebRTCCallback {
  onRemoteStream: (stream: MediaStream) => void;
  onConnectionStateChange: (state: RTCIceConnectionState | RTCPeerConnectionState) => void;
  onMessage?: (message: RoomChatMessage) => void;
  onSignalingStatus?: (status: { rtdbConnected: boolean; error?: string }) => void;
  onPeerCountChange?: (count: number) => void;
}

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
    { urls: 'stun:stun.services.mozilla.com' },
  ],
  iceCandidatePoolSize: 10,
};

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private unsubscribers: (() => void)[] = [];
  private currentRoomId: string | null = null;
  private clientId: string = `peer_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
  private queuedCandidates: RTCIceCandidateInit[] = [];
  private processedCandidates: Set<string> = new Set();
  private myLocalCandidates: RTCIceCandidateInit[] = [];
  private fastApiPollTimer: number | null = null;
  private lastFastApiSignalTime: number = 0;
  private hasAnswered: boolean = false;
  private hasOffered: boolean = false;
  private callbacks: WebRTCCallback | null = null;
  private isCleanedUp: boolean = false;

  private getFastApiUrl(): string {
    const custom = import.meta.env.VITE_AI_API_BASE_URL;
    if (custom) return custom;
    if (typeof window === 'undefined') return '';
    const host = window.location.hostname || 'localhost';
    return `http://${host}:8000`;
  }

  private async postFastApiSignal(signalType: string, payload: any) {
    const baseUrl = this.getFastApiUrl();
    if (!baseUrl || !this.currentRoomId) return;
    try {
      await fetch(`${baseUrl}/api/v1/webrtc/${this.currentRoomId}/signal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: this.clientId,
          signal_type: signalType,
          payload,
        }),
        signal: AbortSignal.timeout(1000),
      });
    } catch {
      // Offline or ignored
    }
  }

  /**
   * Initializes real WebRTC peer connection using Firebase Realtime Database
   * as the primary ultra-low-latency signaling engine, with seamless
   * BroadcastChannel local tab sync.
   */
  public async initCall(
    roomId: string,
    localStream: MediaStream,
    callbacks: WebRTCCallback
  ): Promise<void> {
    this.cleanup();
    this.isCleanedUp = false;
    this.currentRoomId = roomId.trim().toUpperCase();
    this.localStream = localStream;
    this.remoteStream = new MediaStream();
    this.callbacks = callbacks;
    this.hasAnswered = false;
    this.hasOffered = false;
    this.queuedCandidates = [];
    this.processedCandidates.clear();

    // 1. Create Peer Connection
    const pc = new RTCPeerConnection(RTC_CONFIG);
    this.peerConnection = pc;

    // 2. Add local audio/video tracks
    localStream.getTracks().forEach((track) => {
      try {
        pc.addTrack(track, localStream);
      } catch (e) {
        console.warn('[WebRTC] addTrack warning:', e);
      }
    });

    // 3. Handle incoming remote tracks
    pc.ontrack = (event) => {
      let stream: MediaStream;
      if (event.streams && event.streams[0]) {
        stream = event.streams[0];
      } else {
        if (!this.remoteStream) {
          this.remoteStream = new MediaStream();
        }
        this.remoteStream.addTrack(event.track);
        stream = this.remoteStream;
      }
      this.remoteStream = stream;
      callbacks.onRemoteStream(stream);
    };

    // 4. Connection State monitors
    pc.oniceconnectionstatechange = () => {
      callbacks.onConnectionStateChange(pc.iceConnectionState);
    };

    pc.onconnectionstatechange = () => {
      callbacks.onConnectionStateChange(pc.connectionState);
    };

    // 5. ICE candidate generator
    pc.onicecandidate = (event) => {
      if (!event.candidate || !this.currentRoomId) return;
      const candidateJson = event.candidate.toJSON();
      this.myLocalCandidates.push(candidateJson);

      // (a) BroadcastChannel (zero-latency local tab connection)
      try {
        this.broadcastChannel?.postMessage({
          type: 'ice-candidate',
          senderId: this.clientId,
          candidate: candidateJson,
        });
      } catch {
        // ignore
      }

      // (b) Firebase Realtime Database candidate store
      if (rtdb) {
        try {
          const candRef = push(ref(rtdb, `rooms/${this.currentRoomId}/candidates/${this.clientId}`));
          set(candRef, candidateJson).catch(() => {});
        } catch {
          // graceful fallback
        }
      }

      // (c) Local FastAPI Signaling Hub (LAN & Offline fallback)
      this.postFastApiSignal('candidate', candidateJson);
    };

    // 6. Setup Local BroadcastChannel Signaling with greeting handshake
    this.setupBroadcastSignaling(this.currentRoomId, pc);

    // 7. Setup Local FastAPI WebRTC Signaling Hub (cross-device LAN coordination)
    this.setupFastApiSignaling(this.currentRoomId, pc);

    // 8. Setup Firebase Realtime Database Signaling
    await this.setupRealtimeDatabaseSignaling(this.currentRoomId, pc);

    // Safety fallback: if after 1.8s no offer exists, initiate one
    window.setTimeout(() => {
      if (!this.isCleanedUp && this.peerConnection === pc && !this.hasOffered && !this.hasAnswered) {
        this.initiateOffer(pc);
      }
    }, 1800);
  }

  /**
   * Safely adds or queues an ICE candidate depending on signaling state.
   */
  private async addOrQueueCandidate(pc: RTCPeerConnection, candidate: RTCIceCandidateInit) {
    if (!candidate || !candidate.candidate) return;

    const candKey = `${candidate.candidate}_${candidate.sdpMid}_${candidate.sdpMLineIndex}`;
    if (this.processedCandidates.has(candKey)) return;
    this.processedCandidates.add(candKey);

    if (pc.remoteDescription && pc.remoteDescription.type) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn('[WebRTC] addIceCandidate caught:', err);
      }
    } else {
      this.queuedCandidates.push(candidate);
    }
  }

  /**
   * Flushes queued candidates once remote description is set.
   */
  private async flushQueuedCandidates(pc: RTCPeerConnection) {
    while (this.queuedCandidates.length > 0) {
      const c = this.queuedCandidates.shift();
      if (c) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(c));
        } catch {
          // ignore
        }
      }
    }
  }

  /**
   * Layer 1: BroadcastChannel Signaling (instant for tabs/windows on the same computer)
   */
  private setupBroadcastSignaling(roomId: string, pc: RTCPeerConnection) {
    try {
      const channel = new BroadcastChannel(`signmate_room_${roomId}`);
      this.broadcastChannel = channel;

      channel.onmessage = async (event) => {
        const data = event.data;
        if (!data || data.senderId === this.clientId) return;

        try {
          if (data.type === 'peer-join') {
            // Re-announce offer to newly joined peer
            if (pc.localDescription && pc.localDescription.type === 'offer') {
              channel.postMessage({
                type: 'offer',
                senderId: this.clientId,
                offer: { type: pc.localDescription.type, sdp: pc.localDescription.sdp },
              });
            }
            // Send all gathered ICE candidates
            this.myLocalCandidates.forEach((cand) => {
              channel.postMessage({
                type: 'ice-candidate',
                senderId: this.clientId,
                candidate: cand,
              });
            });
          } else if (data.type === 'offer' && !this.hasAnswered && pc.signalingState === 'stable') {
            await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
            await this.flushQueuedCandidates(pc);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            this.hasAnswered = true;
            channel.postMessage({
              type: 'answer',
              senderId: this.clientId,
              answer: { type: answer.type, sdp: answer.sdp },
            });

            // Re-send our gathered candidates to callee
            this.myLocalCandidates.forEach((cand) => {
              channel.postMessage({
                type: 'ice-candidate',
                senderId: this.clientId,
                candidate: cand,
              });
            });

            // Mirror answer to RTDB
            if (rtdb && this.currentRoomId) {
              set(ref(rtdb, `rooms/${this.currentRoomId}/answer`), {
                sdpInit: { type: answer.type, sdp: answer.sdp },
                senderId: this.clientId,
                timestamp: Date.now(),
              }).catch(() => {});
            }

            // Mirror answer to FastAPI
            this.postFastApiSignal('answer', { type: answer.type, sdp: answer.sdp });
          } else if (data.type === 'answer' && pc.signalingState === 'have-local-offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
            await this.flushQueuedCandidates(pc);
          } else if (data.type === 'ice-candidate' && data.candidate) {
            await this.addOrQueueCandidate(pc, data.candidate);
          } else if (data.type === 'chat-message' && data.message) {
            this.callbacks?.onMessage?.(data.message);
          }
        } catch (err) {
          console.warn('[WebRTC BroadcastChannel Error]', err);
        }
      };

      // Announce arrival to any peers already present in the room
      channel.postMessage({
        type: 'peer-join',
        senderId: this.clientId,
      });
    } catch {
      // BroadcastChannel unsupported
    }
  }

  /**
   * Layer 2: FastAPI WebRTC Signaling Hub (Guaranteed fallback across devices on local network)
   */
  private setupFastApiSignaling(roomId: string, pc: RTCPeerConnection) {
    const baseUrl = this.getFastApiUrl();
    if (!baseUrl) return;

    this.lastFastApiSignalTime = Date.now() / 1000 - 30;

    const poll = async () => {
      if (this.isCleanedUp || this.peerConnection !== pc) return;
      try {
        const res = await fetch(
          `${baseUrl}/api/v1/webrtc/${roomId}/signals?sender_id=${encodeURIComponent(
            this.clientId
          )}&since=${this.lastFastApiSignalTime}`,
          { signal: AbortSignal.timeout(1000) }
        );
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.signals)) {
            for (const sig of data.signals) {
              if (sig.timestamp > this.lastFastApiSignalTime) {
                this.lastFastApiSignalTime = sig.timestamp;
              }
              if (sig.sender_id === this.clientId) continue;

              if (sig.signal_type === 'offer' && !this.hasAnswered && pc.signalingState === 'stable') {
                await pc.setRemoteDescription(new RTCSessionDescription(sig.payload));
                await this.flushQueuedCandidates(pc);
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                this.hasAnswered = true;
                this.postFastApiSignal('answer', { type: answer.type, sdp: answer.sdp });
              } else if (sig.signal_type === 'answer' && pc.signalingState === 'have-local-offer') {
                await pc.setRemoteDescription(new RTCSessionDescription(sig.payload));
                await this.flushQueuedCandidates(pc);
              } else if (sig.signal_type === 'candidate' && sig.payload) {
                await this.addOrQueueCandidate(pc, sig.payload);
              }
            }
          }
        }
      } catch {
        // FastAPI poll network error (handled silently)
      }
    };

    this.fastApiPollTimer = window.setInterval(poll, 1000);
  }

  /**
   * Layer 2: Firebase Realtime Database Signaling (real-time global peer connections)
   */
  private async setupRealtimeDatabaseSignaling(roomId: string, pc: RTCPeerConnection) {
    const db = rtdb;
    if (!db) {
      console.warn('[WebRTC] Firebase Realtime Database is not configured. Falling back to local signaling.');
      this.callbacks?.onSignalingStatus?.({
        rtdbConnected: false,
        error: 'Realtime Database instance not found.',
      });
      this.initiateOffer(pc);
      return;
    }

    try {
      const roomPath = `rooms/${roomId}`;
      const myPeerRef = ref(db, `${roomPath}/peers/${this.clientId}`);
      const peersRef = ref(db, `${roomPath}/peers`);
      const offerRef = ref(db, `${roomPath}/offer`);
      const answerRef = ref(db, `${roomPath}/answer`);
      const candidatesRef = ref(db, `${roomPath}/candidates`);
      const messagesRef = ref(db, `${roomPath}/messages`);

      // 1. Register local peer presence with onDisconnect auto-removal
      await set(myPeerRef, {
        id: this.clientId,
        joinedAt: Date.now(),
      }).catch((err) => {
        console.warn('[WebRTC RTDB] Peer presence registration failed:', err);
        this.callbacks?.onSignalingStatus?.({
          rtdbConnected: false,
          error: err.message,
        });
      });

      try {
        onDisconnect(myPeerRef).remove();
      } catch {
        // ignore
      }

      this.callbacks?.onSignalingStatus?.({ rtdbConnected: true });

      // 2. Track peer count changes
      const unsubPeers = onValue(
        peersRef,
        (snapshot) => {
          const peers = snapshot.val() || {};
          const count = Object.keys(peers).length;
          this.callbacks?.onPeerCountChange?.(count);
        },
        (err) => {
          console.warn('[WebRTC RTDB] peersRef listener error:', err);
          this.callbacks?.onSignalingStatus?.({
            rtdbConnected: false,
            error: err.message,
          });
        }
      );
      this.unsubscribers.push(unsubPeers);

      // 3. Listen to synchronized chat/sign/voice messages
      const unsubMessages = onChildAdded(
        messagesRef,
        (snapshot) => {
          const msg = snapshot.val() as RoomChatMessage;
          if (msg && msg.senderId !== this.clientId) {
            this.callbacks?.onMessage?.(msg);
          }
        },
        (err) => {
          console.warn('[WebRTC RTDB] messagesRef listener error:', err);
        }
      );
      this.unsubscribers.push(unsubMessages);

      // 4. Check existing offer in Realtime Database
      const offerSnapshot = await get(offerRef).catch(() => null);
      const offerData = offerSnapshot && offerSnapshot.exists() ? offerSnapshot.val() : null;

      const isRecentOffer =
        offerData &&
        offerData.senderId !== this.clientId &&
        offerData.timestamp &&
        Date.now() - offerData.timestamp < 180000;

      if (isRecentOffer && offerData.sdpInit && pc.signalingState === 'stable') {
        // === CALLEE ROLE: Join existing offer ===
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(offerData.sdpInit));
          await this.flushQueuedCandidates(pc);

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          this.hasAnswered = true;

          await set(answerRef, {
            sdpInit: { type: answer.type, sdp: answer.sdp },
            senderId: this.clientId,
            timestamp: Date.now(),
          });

          // Broadcast answer locally
          this.broadcastChannel?.postMessage({
            type: 'answer',
            senderId: this.clientId,
            answer,
          });
        } catch (err) {
          console.warn('[WebRTC RTDB] Failed to answer offer:', err);
        }
      } else {
        // === CALLER ROLE: Create initial offer ===
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        this.hasOffered = true;

        await set(offerRef, {
          sdpInit: { type: offer.type, sdp: offer.sdp },
          senderId: this.clientId,
          timestamp: Date.now(),
        }).catch((err) => {
          console.warn('[WebRTC RTDB] Offer set error:', err);
        });

        // Broadcast offer locally
        this.broadcastChannel?.postMessage({
          type: 'offer',
          senderId: this.clientId,
          offer,
        });

        // Mirror offer to FastAPI
        this.postFastApiSignal('offer', { type: offer.type, sdp: offer.sdp });

        // Listen for callee answer in RTDB
        const unsubAnswer = onValue(
          answerRef,
          async (snapshot) => {
            const ansData = snapshot.val();
            if (ansData && ansData.senderId !== this.clientId && ansData.sdpInit) {
              if (pc.signalingState === 'have-local-offer') {
                try {
                  await pc.setRemoteDescription(new RTCSessionDescription(ansData.sdpInit));
                  await this.flushQueuedCandidates(pc);
                } catch (err) {
                  console.warn('[WebRTC RTDB] Set remote answer error:', err);
                }
              }
            }
          },
          (err) => {
            console.warn('[WebRTC RTDB] answerRef listener error:', err);
          }
        );
        this.unsubscribers.push(unsubAnswer);
      }

      // 5. Watch for incoming offers (if both peers joined simultaneously or offer updated)
      const unsubOffer = onValue(
        offerRef,
        async (snapshot) => {
          const off = snapshot.val();
          if (!off || off.senderId === this.clientId || !off.sdpInit) return;
          if (this.hasAnswered || pc.signalingState !== 'stable') return;

          try {
            await pc.setRemoteDescription(new RTCSessionDescription(off.sdpInit));
            await this.flushQueuedCandidates(pc);

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            this.hasAnswered = true;

            await set(answerRef, {
              sdpInit: { type: answer.type, sdp: answer.sdp },
              senderId: this.clientId,
              timestamp: Date.now(),
            });

            this.broadcastChannel?.postMessage({
              type: 'answer',
              senderId: this.clientId,
              answer,
            });
          } catch (err) {
            console.warn('[WebRTC RTDB] Dynamic offer set error:', err);
          }
        },
        (err) => {
          console.warn('[WebRTC RTDB] offerRef listener error:', err);
        }
      );
      this.unsubscribers.push(unsubOffer);

      // 6. Watch for incoming ICE candidates across peers in RTDB
      const unsubCandidatesGroup = onChildAdded(
        candidatesRef,
        (peerCandSnapshot) => {
          const peerId = peerCandSnapshot.key;
          if (!peerId || peerId === this.clientId) return;

          const peerCandRef = ref(db, `${roomPath}/candidates/${peerId}`);
          const unsubPeerCands = onChildAdded(
            peerCandRef,
            (cSnap) => {
              const c = cSnap.val();
              if (c) {
                this.addOrQueueCandidate(pc, c);
              }
            },
            (err) => {
              console.warn('[WebRTC RTDB] peerCandRef error:', err);
            }
          );
          this.unsubscribers.push(unsubPeerCands);
        },
        (err) => {
          console.warn('[WebRTC RTDB] candidatesRef error:', err);
        }
      );
      this.unsubscribers.push(unsubCandidatesGroup);
    } catch (err: unknown) {
      const errorObj = err as Error;
      console.warn('[WebRTC Realtime Database Signaling exception]', errorObj);
      this.callbacks?.onSignalingStatus?.({
        rtdbConnected: false,
        error: errorObj.message,
      });
      this.initiateOffer(pc);
    }
  }

  private async initiateOffer(pc: RTCPeerConnection) {
    if (pc.signalingState === 'stable' && !this.hasOffered && !this.hasAnswered) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        this.hasOffered = true;
        this.broadcastChannel?.postMessage({
          type: 'offer',
          senderId: this.clientId,
          offer,
        });

        if (rtdb && this.currentRoomId) {
          set(ref(rtdb, `rooms/${this.currentRoomId}/offer`), {
            sdpInit: { type: offer.type, sdp: offer.sdp },
            senderId: this.clientId,
            timestamp: Date.now(),
          }).catch(() => {});
        }

        // Mirror offer to FastAPI
        this.postFastApiSignal('offer', { type: offer.type, sdp: offer.sdp });
      } catch (e) {
        console.warn('[initiateOffer error]', e);
      }
    }
  }

  /**
   * Broadcasts a real-time message to room participants via Realtime Database and BroadcastChannel.
   */
  public async sendMessage(
    text: string,
    senderName: string,
    type: 'chat' | 'sign' | 'speech' = 'chat'
  ): Promise<void> {
    if (!this.currentRoomId || !text.trim()) return;

    const msg: RoomChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      senderId: this.clientId,
      senderName: senderName || 'User',
      text: text.trim(),
      timestamp: Date.now(),
      type,
    };

    // 1. Local BroadcastChannel
    try {
      this.broadcastChannel?.postMessage({
        type: 'chat-message',
        message: msg,
      });
    } catch {
      // ignore
    }

    // 2. Firebase Realtime Database
    if (rtdb) {
      try {
        const msgRef = push(ref(rtdb, `rooms/${this.currentRoomId}/messages`));
        await set(msgRef, msg);
      } catch (err) {
        console.warn('[WebRTC RTDB] Message sending error:', err);
      }
    }
  }

  /**
   * Comprehensive cleanup when leaving call or unmounting.
   */
  public cleanup() {
    this.isCleanedUp = true;

    if (this.fastApiPollTimer) {
      window.clearInterval(this.fastApiPollTimer);
      this.fastApiPollTimer = null;
    }

    // Unsubscribe all RTDB listeners
    this.unsubscribers.forEach((u) => {
      try {
        u();
      } catch {
        // ignore
      }
    });
    this.unsubscribers = [];

    // Remove peer registration from RTDB
    if (rtdb && this.currentRoomId && this.clientId) {
      try {
        const myPeerRef = ref(rtdb, `rooms/${this.currentRoomId}/peers/${this.clientId}`);
        remove(myPeerRef).catch(() => {});
      } catch {
        // ignore
      }
    }

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.close();
      } catch {
        // ignore
      }
      this.broadcastChannel = null;
    }

    if (this.peerConnection) {
      try {
        this.peerConnection.close();
      } catch {
        // ignore
      }
      this.peerConnection = null;
    }

    this.localStream = null;
    this.remoteStream = null;
    this.currentRoomId = null;
    this.hasAnswered = false;
    this.hasOffered = false;
    this.queuedCandidates = [];
    this.myLocalCandidates = [];
    this.processedCandidates.clear();
    this.callbacks = null;
  }

  public getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  public getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  public getCurrentRoomId(): string | null {
    return this.currentRoomId;
  }

  public getClientId(): string {
    return this.clientId;
  }
}

export const webRTCService = new WebRTCService();
