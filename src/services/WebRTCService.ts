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
  onPeerStream?: (peerId: string, stream: MediaStream) => void;
  onPeerLeave?: (peerId: string) => void;
  onConnectionStateChange: (state: RTCIceConnectionState | RTCPeerConnectionState) => void;
  onMessage?: (message: RoomChatMessage) => void;
  onLiveCaption?: (caption: { senderId: string; letter: string; text: string }) => void;
  onSignalingStatus?: (status: { rtdbConnected: boolean; error?: string }) => void;
  onPeerCountChange?: (count: number) => void;
  onRoomFull?: () => void;
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

interface MeshPeer {
  peerId: string;
  pc: RTCPeerConnection;
  stream: MediaStream;
  queuedCandidates: RTCIceCandidateInit[];
  processedCandidates: Set<string>;
  hasOffered?: boolean;
  hasAnswered?: boolean;
}

export class WebRTCService {
  private meshPeers: Map<string, MeshPeer> = new Map();
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private unsubscribers: (() => void)[] = [];
  private currentRoomId: string | null = null;
  private clientId: string = `peer_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
  private fastApiPollTimer: number | null = null;
  private lastFastApiSignalTime: number = 0;
  private callbacks: WebRTCCallback | null = null;
  private isCleanedUp: boolean = false;
  private initializedPairs: Set<string> = new Set();

  private isFastApiAvailable: boolean = false;
  private hasCheckedFastApi: boolean = false;

  private getFastApiUrl(): string {
    const custom = import.meta.env.VITE_AI_API_BASE_URL;
    if (typeof window === 'undefined') return custom || '';

    const hostname = window.location.hostname || '';
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    const isLanIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);

    if (!isLocal && !isLanIp) {
      if (custom && !custom.includes('localhost') && !custom.includes('127.0.0.1')) {
        return custom;
      }
      return '';
    }

    if (custom) return custom;
    const rawHost = hostname || '127.0.0.1';
    const host = rawHost === 'localhost' ? '127.0.0.1' : rawHost;
    return `http://${host}:8000`;
  }

  private async postFastApiSignal(signalType: string, payload: any) {
    if (this.hasCheckedFastApi && !this.isFastApiAvailable) return;
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
      this.isFastApiAvailable = true;
      this.hasCheckedFastApi = true;
    } catch {
      this.isFastApiAvailable = false;
      this.hasCheckedFastApi = true;
    }
  }

  /**
   * Creates or retrieves a dedicated RTCPeerConnection for a remote peer in the mesh.
   */
  private getOrCreatePeer(remoteId: string): MeshPeer {
    let peer = this.meshPeers.get(remoteId);
    if (peer) return peer;

    const pc = new RTCPeerConnection(RTC_CONFIG);
    const stream = new MediaStream();

    peer = {
      peerId: remoteId,
      pc,
      stream,
      queuedCandidates: [],
      processedCandidates: new Set(),
    };
    this.meshPeers.set(remoteId, peer);

    if (!this.peerConnection) {
      this.peerConnection = pc;
    }

    // Add local tracks to this peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        try {
          pc.addTrack(track, this.localStream!);
        } catch (e) {
          console.warn(`[WebRTC mesh] addTrack to peer ${remoteId} warning:`, e);
        }
      });
    }

    // Handle remote tracks from this peer
    pc.ontrack = (event) => {
      let remoteStr = peer!.stream;
      if (event.streams && event.streams[0]) {
        remoteStr = event.streams[0];
        peer!.stream = remoteStr;
      } else {
        remoteStr.addTrack(event.track);
      }
      this.remoteStream = remoteStr;
      this.callbacks?.onRemoteStream?.(remoteStr);
      this.callbacks?.onPeerStream?.(remoteId, remoteStr);
    };

    pc.oniceconnectionstatechange = () => {
      this.callbacks?.onConnectionStateChange?.(pc.iceConnectionState);
    };

    pc.onconnectionstatechange = () => {
      this.callbacks?.onConnectionStateChange?.(pc.connectionState);
    };

    const pairKey = [this.clientId, remoteId].sort().join('_to_');

    pc.onicecandidate = (event) => {
      if (!event.candidate || !this.currentRoomId) return;
      const candidateJson = event.candidate.toJSON();

      // 1. BroadcastChannel (local sync)
      try {
        this.broadcastChannel?.postMessage({
          type: 'mesh-candidate',
          from: this.clientId,
          to: remoteId,
          candidate: candidateJson,
        });
      } catch {}

      // 2. Firebase RTDB
      if (rtdb) {
        try {
          const candRef = push(ref(rtdb, `rooms/${this.currentRoomId}/mesh/${pairKey}/candidates/${this.clientId}`));
          set(candRef, candidateJson).catch(() => {});
        } catch {}
      }
    };

    return peer;
  }

  private async addOrQueuePeerCandidate(peer: MeshPeer, candidate: RTCIceCandidateInit) {
    if (!candidate || !candidate.candidate) return;
    const candKey = `${candidate.candidate}_${candidate.sdpMid}_${candidate.sdpMLineIndex}`;
    if (peer.processedCandidates.has(candKey)) return;
    peer.processedCandidates.add(candKey);

    if (peer.pc.remoteDescription && peer.pc.remoteDescription.type) {
      try {
        await peer.pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn(`[WebRTC mesh] addIceCandidate for ${peer.peerId} error:`, err);
      }
    } else {
      peer.queuedCandidates.push(candidate);
    }
  }

  private async flushPeerCandidates(peer: MeshPeer) {
    while (peer.queuedCandidates.length > 0) {
      const c = peer.queuedCandidates.shift();
      if (c) {
        try {
          await peer.pc.addIceCandidate(new RTCIceCandidate(c));
        } catch {}
      }
    }
  }

  /**
   * Initializes real WebRTC peer connection using Firebase Realtime Database
   * as the primary multi-user signaling mesh, with BroadcastChannel local tab sync.
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

    // 1. Setup Local BroadcastChannel for instant local multi-tab mesh signaling
    this.setupBroadcastSignaling(this.currentRoomId);

    // 2. Setup Local FastAPI signaling hub
    this.setupFastApiSignaling(this.currentRoomId);

    // 3. Setup Firebase Realtime Database multi-peer mesh signaling
    await this.setupRealtimeDatabaseSignaling(this.currentRoomId);
  }

  /**
   * Layer 1: BroadcastChannel Signaling (instant for multi-tab mesh testing)
   */
  private setupBroadcastSignaling(roomId: string) {
    try {
      const channel = new BroadcastChannel(`signmate_room_${roomId}`);
      this.broadcastChannel = channel;

      channel.onmessage = async (event) => {
        const data = event.data;
        if (!data || data.senderId === this.clientId || data.from === this.clientId) return;

        try {
          if (data.type === 'peer-join') {
            // Re-announce presence
            channel.postMessage({
              type: 'peer-announce',
              senderId: this.clientId,
            });
          } else if (data.type === 'peer-announce') {
            const remoteId = data.senderId;
            if (remoteId && remoteId !== this.clientId) {
              const isInitiator = this.clientId < remoteId;
              if (isInitiator) {
                const peer = this.getOrCreatePeer(remoteId);
                if (!peer.hasOffered && peer.pc.signalingState === 'stable') {
                  peer.hasOffered = true;
                  const offer = await peer.pc.createOffer();
                  await peer.pc.setLocalDescription(offer);
                  channel.postMessage({
                    type: 'mesh-offer',
                    from: this.clientId,
                    to: remoteId,
                    offer,
                  });
                }
              }
            }
          } else if (data.type === 'mesh-offer' && data.to === this.clientId) {
            const remoteId = data.from;
            const peer = this.getOrCreatePeer(remoteId);
            if (!peer.hasAnswered && peer.pc.signalingState === 'stable') {
              peer.hasAnswered = true;
              await peer.pc.setRemoteDescription(new RTCSessionDescription(data.offer));
              await this.flushPeerCandidates(peer);
              const answer = await peer.pc.createAnswer();
              await peer.pc.setLocalDescription(answer);
              channel.postMessage({
                type: 'mesh-answer',
                from: this.clientId,
                to: remoteId,
                answer,
              });
            }
          } else if (data.type === 'mesh-answer' && data.to === this.clientId) {
            const remoteId = data.from;
            const peer = this.getOrCreatePeer(remoteId);
            if (peer.pc.signalingState === 'have-local-offer') {
              await peer.pc.setRemoteDescription(new RTCSessionDescription(data.answer));
              await this.flushPeerCandidates(peer);
            }
          } else if (data.type === 'mesh-candidate' && data.to === this.clientId) {
            const remoteId = data.from;
            const peer = this.getOrCreatePeer(remoteId);
            await this.addOrQueuePeerCandidate(peer, data.candidate);
          } else if (data.type === 'chat-message') {
            this.callbacks?.onMessage?.(data.message);
          } else if (data.type === 'live-caption') {
            this.callbacks?.onLiveCaption?.(data);
          }
        } catch (err) {
          console.warn('[BroadcastChannel mesh error]:', err);
        }
      };

      // Announce arrival to other open tabs
      channel.postMessage({
        type: 'peer-join',
        senderId: this.clientId,
      });
    } catch {
      // BroadcastChannel unsupported
    }
  }

  /**
   * Layer 2: FastAPI WebRTC Signaling Hub (LAN fallback)
   */
  private setupFastApiSignaling(roomId: string) {
    const baseUrl = this.getFastApiUrl();
    if (!baseUrl) return;

    this.lastFastApiSignalTime = Date.now() / 1000 - 30;
    let failCount = 0;

    const poll = async () => {
      if (this.isCleanedUp) return;
      if (failCount >= 3 && Date.now() % 8000 > 1200) return;

      try {
        const res = await fetch(
          `${baseUrl}/api/v1/webrtc/${roomId}/signals?sender_id=${encodeURIComponent(
            this.clientId
          )}&since=${this.lastFastApiSignalTime}`,
          { signal: AbortSignal.timeout(1000) }
        );
        if (res.ok) {
          failCount = 0;
          const data = await res.json();
          if (data && Array.isArray(data.signals)) {
            for (const sig of data.signals) {
              if (sig.timestamp > this.lastFastApiSignalTime) {
                this.lastFastApiSignalTime = sig.timestamp;
              }
              if (sig.sender_id === this.clientId) continue;

              const remoteId = sig.sender_id;
              const peer = this.getOrCreatePeer(remoteId);

              if (sig.signal_type === 'offer' && !peer.hasAnswered && peer.pc.signalingState === 'stable') {
                peer.hasAnswered = true;
                await peer.pc.setRemoteDescription(new RTCSessionDescription(sig.payload));
                await this.flushPeerCandidates(peer);
                const answer = await peer.pc.createAnswer();
                await peer.pc.setLocalDescription(answer);
                this.postFastApiSignal('answer', { type: answer.type, sdp: answer.sdp });
              } else if (sig.signal_type === 'answer' && peer.pc.signalingState === 'have-local-offer') {
                await peer.pc.setRemoteDescription(new RTCSessionDescription(sig.payload));
                await this.flushPeerCandidates(peer);
              } else if (sig.signal_type === 'candidate' && sig.payload) {
                await this.addOrQueuePeerCandidate(peer, sig.payload);
              }
            }
          }
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }

      if (failCount >= 2) {
        if (this.fastApiPollTimer !== null) {
          window.clearInterval(this.fastApiPollTimer);
          this.fastApiPollTimer = null;
        }
        this.isFastApiAvailable = false;
        this.hasCheckedFastApi = true;
      }
    };

    this.fastApiPollTimer = window.setInterval(poll, 1500);
  }

  /**
   * Layer 3: Firebase Realtime Database Full-Mesh Signaling (Up to 4 participants)
   */
  private async setupRealtimeDatabaseSignaling(roomId: string) {
    const db = rtdb;
    if (!db) {
      console.warn('[WebRTC] Firebase Realtime Database is not configured.');
      this.callbacks?.onSignalingStatus?.({
        rtdbConnected: false,
        error: 'Realtime Database instance not found.',
      });
      return;
    }

    try {
      const roomPath = `rooms/${roomId}`;
      const myPeerRef = ref(db, `${roomPath}/peers/${this.clientId}`);
      const peersRef = ref(db, `${roomPath}/peers`);
      const messagesRef = ref(db, `${roomPath}/messages`);

      // 1. Fetch current peers in this room
      const peersSnapshot = await get(peersRef).catch(() => null);
      const existingPeers = peersSnapshot && peersSnapshot.exists() ? peersSnapshot.val() : {};
      const activePeerIds = Object.keys(existingPeers).filter((id) => id !== this.clientId);

      // Max 4 participants
      if (activePeerIds.length >= 4) {
        console.warn(`[WebRTC] Room ${roomId} is full (max 4 participants).`);
        this.callbacks?.onRoomFull?.();
        return;
      }

      // Purge stale data if room was empty
      if (activePeerIds.length === 0) {
        await remove(ref(db, `${roomPath}/mesh`)).catch(() => {});
        await remove(ref(db, `${roomPath}/offer`)).catch(() => {});
        await remove(ref(db, `${roomPath}/answer`)).catch(() => {});
      }

      // 2. Register local peer presence with onDisconnect auto-removal
      await set(myPeerRef, {
        id: this.clientId,
        joinedAt: Date.now(),
      }).catch((err) => {
        console.warn('[WebRTC RTDB] Peer presence registration failed:', err);
      });

      try {
        onDisconnect(myPeerRef).remove();
      } catch {}

      this.callbacks?.onSignalingStatus?.({ rtdbConnected: true });

      // 3. Listen for peers joining/leaving & automatically manage mesh connections
      const unsubPeers = onValue(
        peersRef,
        async (snapshot) => {
          if (this.isCleanedUp) return;
          const peers = snapshot.val() || {};
          const peerList = Object.keys(peers);
          this.callbacks?.onPeerCountChange?.(peerList.length);

          // Remove any peers that left
          for (const [existingId, peerEntry] of Array.from(this.meshPeers.entries())) {
            if (!peers[existingId]) {
              try {
                peerEntry.pc.close();
              } catch {}
              this.meshPeers.delete(existingId);
              const pairKey = [this.clientId, existingId].sort().join('_to_');
              this.initializedPairs.delete(pairKey);
              this.callbacks?.onPeerLeave?.(existingId);
            }
          }

          // Connect to all other peers
          for (const remoteId of peerList) {
            if (remoteId === this.clientId) continue;

            const pairKey = [this.clientId, remoteId].sort().join('_to_');
            if (this.initializedPairs.has(pairKey)) continue;
            this.initializedPairs.add(pairKey);

            const isInitiator = this.clientId < remoteId;

            if (isInitiator) {
              const peer = this.getOrCreatePeer(remoteId);
              if (!peer.hasOffered && peer.pc.signalingState === 'stable') {
                try {
                  peer.hasOffered = true;
                  const offer = await peer.pc.createOffer();
                  await peer.pc.setLocalDescription(offer);

                  // Send to RTDB mesh
                  const offerRef = ref(db, `${roomPath}/mesh/${pairKey}/offer`);
                  await set(offerRef, {
                    sdpInit: { type: offer.type, sdp: offer.sdp },
                    senderId: this.clientId,
                    timestamp: Date.now(),
                  });
                  onDisconnect(offerRef).remove();

                  // BroadcastChannel sync
                  this.broadcastChannel?.postMessage({
                    type: 'mesh-offer',
                    from: this.clientId,
                    to: remoteId,
                    offer,
                  });
                } catch (err) {
                  console.warn(`[WebRTC mesh] Offer generation to ${remoteId} failed:`, err);
                }
              }

              // Listen for answer from remoteId
              const answerRef = ref(db, `${roomPath}/mesh/${pairKey}/answer`);
              const unsubAns = onValue(answerRef, async (ansSnap) => {
                const ansData = ansSnap.val();
                if (ansData && ansData.senderId === remoteId && ansData.sdpInit) {
                  if (peer.pc.signalingState === 'have-local-offer') {
                    try {
                      await peer.pc.setRemoteDescription(new RTCSessionDescription(ansData.sdpInit));
                      await this.flushPeerCandidates(peer);
                    } catch (err) {
                      console.warn(`[WebRTC mesh] Set answer from ${remoteId} failed:`, err);
                    }
                  }
                }
              });
              this.unsubscribers.push(unsubAns);
            } else {
              // Callee: listen for offer from remoteId
              const offerRef = ref(db, `${roomPath}/mesh/${pairKey}/offer`);
              const unsubOff = onValue(offerRef, async (offSnap) => {
                const offData = offSnap.val();
                if (offData && offData.senderId === remoteId && offData.sdpInit) {
                  const peer = this.getOrCreatePeer(remoteId);
                  if (!peer.hasAnswered && peer.pc.signalingState === 'stable') {
                    try {
                      peer.hasAnswered = true;
                      await peer.pc.setRemoteDescription(new RTCSessionDescription(offData.sdpInit));
                      await this.flushPeerCandidates(peer);

                      const answer = await peer.pc.createAnswer();
                      await peer.pc.setLocalDescription(answer);

                      const answerRef = ref(db, `${roomPath}/mesh/${pairKey}/answer`);
                      await set(answerRef, {
                        sdpInit: { type: answer.type, sdp: answer.sdp },
                        senderId: this.clientId,
                        timestamp: Date.now(),
                      });
                      onDisconnect(answerRef).remove();

                      this.broadcastChannel?.postMessage({
                        type: 'mesh-answer',
                        from: this.clientId,
                        to: remoteId,
                        answer,
                      });
                    } catch (err) {
                      console.warn(`[WebRTC mesh] Answer generation for ${remoteId} failed:`, err);
                    }
                  }
                }
              });
              this.unsubscribers.push(unsubOff);
            }

            // Listen for candidates from remoteId
            const remoteCandRef = ref(db, `${roomPath}/mesh/${pairKey}/candidates/${remoteId}`);
            const unsubCand = onChildAdded(remoteCandRef, (cSnap) => {
              const cand = cSnap.val();
              if (cand) {
                const peer = this.getOrCreatePeer(remoteId);
                this.addOrQueuePeerCandidate(peer, cand);
              }
            });
            this.unsubscribers.push(unsubCand);
          }
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

      // 4. Listen to synchronized chat messages
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

      // 5. Listen to live partner caption stream
      const liveCaptionRef = ref(db, `${roomPath}/liveCaption`);
      const unsubLiveCaption = onValue(liveCaptionRef, (snapshot) => {
        const cap = snapshot.val();
        if (cap && cap.senderId !== this.clientId && Date.now() - (cap.timestamp || 0) < 30000) {
          this.callbacks?.onLiveCaption?.({
            senderId: cap.senderId,
            letter: cap.letter || '',
            text: cap.text || '',
          });
        }
      });
      this.unsubscribers.push(unsubLiveCaption);
    } catch (err: unknown) {
      const errorObj = err as Error;
      console.warn('[WebRTC Realtime Database Signaling exception]', errorObj);
      this.callbacks?.onSignalingStatus?.({
        rtdbConnected: false,
        error: errorObj.message,
      });
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

    // 1. BroadcastChannel
    try {
      this.broadcastChannel?.postMessage({
        type: 'chat-message',
        message: msg,
      });
    } catch {}

    // 2. Firebase RTDB
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
   * Broadcasts real-time live sign caption stream (as hands sign each letter/word).
   */
  public async sendLiveCaption(letter: string, text: string): Promise<void> {
    if (!this.currentRoomId) return;

    // 1. BroadcastChannel
    try {
      this.broadcastChannel?.postMessage({
        type: 'live-caption',
        senderId: this.clientId,
        letter,
        text,
      });
    } catch {}

    // 2. Firebase RTDB
    if (rtdb) {
      try {
        const liveRef = ref(rtdb, `rooms/${this.currentRoomId}/liveCaption`);
        await set(liveRef, {
          senderId: this.clientId,
          letter,
          text,
          timestamp: Date.now(),
        });
      } catch {}
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
      } catch {}
    });
    this.unsubscribers = [];

    // Remove peer registration from RTDB
    if (rtdb && this.currentRoomId && this.clientId) {
      try {
        const myPeerRef = ref(rtdb, `rooms/${this.currentRoomId}/peers/${this.clientId}`);
        remove(myPeerRef).catch(() => {});
      } catch {}
    }

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.close();
      } catch {}
      this.broadcastChannel = null;
    }

    // Close all mesh connections
    this.meshPeers.forEach((peer) => {
      try {
        peer.pc.close();
      } catch {}
    });
    this.meshPeers.clear();
    this.initializedPairs.clear();

    if (this.peerConnection) {
      try {
        this.peerConnection.close();
      } catch {}
      this.peerConnection = null;
    }

    this.localStream = null;
    this.remoteStream = null;
    this.currentRoomId = null;
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
