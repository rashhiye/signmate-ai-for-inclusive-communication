import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useMediaDevices } from '../hooks/useMediaDevices';
import { useSignAI } from '../hooks/useSignAI';
import { useToast } from '../hooks/useToast';
import { webRTCService } from '../services/WebRTCService';
import { handSignDetector, type HandDetectionResult } from '../ai/handSignDetector';
import { HandLandmarkOverlay } from '../components/ai/HandLandmarkOverlay';
import { normalizeRoomCode } from '../utils/roomCode';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  Share2,
  Settings,
  Send,
  Volume2,
  RotateCcw,
  Trash2,
  X,
  Plus,
  LogIn,
  CheckCircle2,
  VolumeX,
  Copy,
  Users,
  Space,
  Delete,
  Sparkles,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'system' | 'you' | 'partner';
  text: string;
  time: string;
}

export const RoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const currentRoomId = (roomId || 'X8LN7A').toUpperCase();

  // Local media stream hook
  const {
    localStream,
    isCameraEnabled,
    isMicEnabled,
    deviceError,
    startLocalMedia,
    stopLocalMedia,
    toggleCamera,
    toggleMicrophone,
  } = useMediaDevices();

  // Sign AI hook
  const {
    aiState,
    recognition,
    toggleAI,
    clearRecognized,
    speakRecognizedText,
    appendCharacter,
    deleteLastCharacter,
    addSpace,
    selectSuggestion,
  } = useSignAI();

  // WebRTC Real Remote Stream states
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [webRtcStatus, setWebRtcStatus] = useState<string>('disconnected');
  const [isPartnerConnected, setIsPartnerConnected] = useState(false);
  const [peerCount, setPeerCount] = useState<number>(1);
  const [rtdbConnected, setRtdbConnected] = useState<boolean>(true);
  const [partnerLiveCaption, setPartnerLiveCaption] = useState<string>('');
  const [partnerLiveLetter, setPartnerLiveLetter] = useState<string>('');
  const [isSelfLoopback, setIsSelfLoopback] = useState<boolean>(false);
  const recognizedTextRef = useRef<string>('');

  // Keep recognizedTextRef synchronized with recognition state
  useEffect(() => {
    recognizedTextRef.current = recognition.recognizedText;
  }, [recognition.recognizedText]);

  // Real-time Hand Detection state
  const [detectionResult, setDetectionResult] = useState<HandDetectionResult | null>(null);

  // Local UI states
  const [isDeafModeOpen, setIsDeafModeOpen] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isListeningSpeech, setIsListeningSpeech] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Video element references
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const partnerVideoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Clean initial messages
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return [
      {
        id: 'm1',
        sender: 'system',
        text: '👋 Welcome to SignMate. Live sign translations, voice subtitles, and chat will stream here in real-time.',
        time: now,
      },
    ];
  });

  // Start media stream on mount
  useEffect(() => {
    startLocalMedia();
    return () => {
      stopLocalMedia();
    };
  }, [startLocalMedia, stopLocalMedia]);

  // Attach local stream and trigger playback
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      if (localVideoRef.current.srcObject !== localStream) {
        localVideoRef.current.srcObject = localStream;
      }
      localVideoRef.current.play().catch((err) => {
        console.warn('[SignMate] localVideoRef playback caught:', err);
      });
    }
  }, [localStream, isCameraEnabled]);

  // Initialize Real WebRTC Peer Connection with Firebase Realtime Database
  useEffect(() => {
    if (!localStream) return;

    webRTCService.initCall(currentRoomId, localStream, {
      onRemoteStream: (stream) => {
        setRemoteStream(stream);
        setIsPartnerConnected(true);
        if (partnerVideoRef.current) {
          partnerVideoRef.current.srcObject = stream;
        }
        showToast({
          type: 'success',
          title: 'Partner Connected',
          message: 'Real WebRTC live video & audio stream established via Firebase Realtime Database.',
        });
      },
      onConnectionStateChange: (state) => {
        setWebRtcStatus(state);
        if (state === 'connected') {
          setIsPartnerConnected(true);
        } else if (state === 'disconnected' || state === 'failed') {
          if (!isSelfLoopback) {
            setIsPartnerConnected(false);
          }
        }
      },
      onMessage: (roomMsg) => {
        setMessages((prev) => [
          ...prev,
          {
            id: roomMsg.id,
            sender: 'partner',
            text: roomMsg.text,
            time: new Date(roomMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        setPartnerLiveCaption(roomMsg.text);
      },
      onLiveCaption: (caption) => {
        if (caption.letter !== undefined) {
          setPartnerLiveLetter(caption.letter);
        }
        if (caption.text !== undefined) {
          setPartnerLiveCaption(caption.text);
        }
      },
      onSignalingStatus: (status) => {
        setRtdbConnected(status.rtdbConnected);
      },
      onPeerCountChange: (count) => {
        setPeerCount(count);
      },
    });

    return () => {
      webRTCService.cleanup();
    };
  }, [localStream, currentRoomId, showToast]);

  // Attach remote stream whenever partnerVideoRef or remoteStream updates
  useEffect(() => {
    if (partnerVideoRef.current) {
      if (isSelfLoopback && localStream) {
        partnerVideoRef.current.srcObject = localStream;
        partnerVideoRef.current.play().catch(() => {});
      } else if (remoteStream) {
        partnerVideoRef.current.srcObject = remoteStream;
        partnerVideoRef.current.play().catch(() => {});
      }
    }
  }, [remoteStream, isPartnerConnected, isSelfLoopback, localStream]);

  // Real Sign Language Detection Loop (webcam frame -> hand ROI -> classifier)
  useEffect(() => {
    if (!isCameraEnabled || aiState !== 'active') {
      setDetectionResult(null);
      return;
    }

    let isMounted = true;
    let stableCount = 0;
    let candidateLetter = '';
    let cooldown = 0;

    const intervalId = window.setInterval(async () => {
      if (!localVideoRef.current || !isMounted) return;
      try {
        const result = await handSignDetector.detectSign(localVideoRef.current);
        if (!isMounted) return;

        setDetectionResult(result);

        if (cooldown > 0) {
          cooldown--;
        }

        // ONLY print/append letter when accuracy is >= 85% (0.85) and gesture is stable
        if (result.hasHand && result.letter && result.confidence >= 0.85) {
          // Immediately stream active letter gesture to partner so they see real-time signing
          webRTCService.sendLiveCaption(result.letter, recognizedTextRef.current);
          if (isSelfLoopback) {
            setPartnerLiveLetter(result.letter);
          }

          if (result.letter === candidateLetter) {
            stableCount++;
            // Require 4 stable frames (~720ms) and active cooldown passed
            if (stableCount >= 4 && cooldown <= 0) {
              const letter = result.letter;
              appendCharacter(letter);
              const updatedBuffer = (recognizedTextRef.current + letter).toUpperCase();
              recognizedTextRef.current = updatedBuffer;
              webRTCService.sendLiveCaption(letter, updatedBuffer);
              if (isSelfLoopback) {
                setPartnerLiveLetter(letter);
                setPartnerLiveCaption(updatedBuffer);
              }
              stableCount = 0;
              candidateLetter = '';
              cooldown = 6; // cooldown to prevent duplicate spam
            }
          } else {
            candidateLetter = result.letter;
            stableCount = 1;
          }
        } else {
          stableCount = 0;
          candidateLetter = '';
        }
      } catch {
        // Continue detection loop
      }
    }, 180);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [isCameraEnabled, aiState, appendCharacter, isSelfLoopback]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Voice Speech-to-Text integration for partner (Web Speech API)
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'en-US';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognitionInstance.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      if (event.results[current].isFinal && transcript.trim()) {
        const text = `[Voice]: ${transcript.trim()}`;
        const newMsg: ChatMessage = {
          id: `speech-${Date.now()}`,
          sender: 'you',
          text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, newMsg]);
        webRTCService.sendMessage(text, user?.displayName || 'You', 'speech');
        webRTCService.sendLiveCaption('', transcript.trim());
        if (isSelfLoopback) {
          setPartnerLiveCaption(transcript.trim());
          setPartnerLiveLetter('');
        }
      }
    };

    if (isListeningSpeech) {
      try {
        recognitionInstance.start();
      } catch {
        // ignore already started
      }
    } else {
      try {
        recognitionInstance.stop();
      } catch {
        // ignore
      }
    }

    return () => {
      try {
        recognitionInstance.stop();
      } catch {
        // ignore
      }
    };
  }, [isListeningSpeech, user?.displayName, isSelfLoopback]);

  // Handle sending a text message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    const text = inputMessage.trim();
    const newMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'you',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage('');
    webRTCService.sendMessage(text, user?.displayName || 'You', 'chat');
  };

  const handleEndCall = () => {
    webRTCService.cleanup();
    stopLocalMedia();
    showToast({
      type: 'info',
      title: 'Call Ended',
      message: `Disconnected from room ${currentRoomId}.`,
    });
    navigate('/dashboard');
  };

  // Buffer actions
  const handleAddSpace = () => {
    addSpace();
    const updated = recognizedTextRef.current ? `${recognizedTextRef.current.trimEnd()} ` : '';
    recognizedTextRef.current = updated;
    webRTCService.sendLiveCaption(' ', updated);
    if (isSelfLoopback) {
      setPartnerLiveLetter(' ');
      setPartnerLiveCaption(updated);
    }
  };

  const handleDeleteChar = () => {
    deleteLastCharacter();
    const updated = recognizedTextRef.current.slice(0, -1);
    recognizedTextRef.current = updated;
    webRTCService.sendLiveCaption('', updated);
    if (isSelfLoopback) {
      setPartnerLiveLetter('');
      setPartnerLiveCaption(updated);
    }
  };

  const handleClearBuffer = () => {
    clearRecognized();
    recognizedTextRef.current = '';
    webRTCService.sendLiveCaption('', '');
    if (isSelfLoopback) {
      setPartnerLiveLetter('');
      setPartnerLiveCaption('');
    }
    showToast({ type: 'info', title: 'Buffer Cleared', message: 'Recognized sign buffer reset.' });
  };

  const handleSelectSuggestion = (word: string) => {
    selectSuggestion(word);
    const updated = `${word} `;
    recognizedTextRef.current = updated;
    webRTCService.sendLiveCaption(word, updated);
    if (isSelfLoopback) {
      setPartnerLiveLetter(word);
      setPartnerLiveCaption(updated);
    }
  };

  const handleSendSignToCall = () => {
    const textToSend = (recognition.recognizedText || recognizedTextRef.current).trim();
    if (!textToSend) {
      showToast({ type: 'warning', title: 'Nothing to Send', message: 'No recognized signs in buffer.' });
      return;
    }
    speakRecognizedText();
    const text = `[Signed]: ${textToSend}`;
    const newMsg: ChatMessage = {
      id: `sign-${Date.now()}`,
      sender: 'you',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    webRTCService.sendMessage(text, user?.displayName || 'You', 'sign');
    webRTCService.sendLiveCaption('', text);
    if (isSelfLoopback) {
      setPartnerLiveCaption(text);
      setPartnerLiveLetter('');
    }
    clearRecognized();
    recognizedTextRef.current = '';
    showToast({ type: 'success', title: 'Sign Sent to Call', message: `Spoke & sent: "${textToSend}"` });
  };


  const copyRoomLink = () => {
    const url = `${window.location.origin}/room/${currentRoomId}`;
    navigator.clipboard.writeText(url);
    showToast({
      type: 'success',
      title: 'Link Copied',
      message: `Share this link or room code ${currentRoomId} to connect via WebRTC!`,
    });
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] max-h-[100dvh] overflow-hidden bg-[#18191d] text-[#e0e0e0] font-['Montserrat',sans-serif] select-none">
      {/* Top Header Bar matching Screenshot Page 65 */}
      <header className="h-14 bg-[#141518] border-b border-white/10 px-4 flex items-center justify-between shrink-0">
        {/* Left: Brand */}
        <div
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
          title="Go to Dashboard"
        >
          <div className="w-8 h-8 rounded-lg bg-brand-500 group-hover:bg-brand-400 flex items-center justify-center text-white font-bold text-xs tracking-wider transition-colors shadow">
            SM
          </div>
          <span className="font-bold text-base tracking-wide text-white group-hover:text-blue-300 transition-colors">SignMate</span>
        </div>

        {/* Center: Room Code & Action Buttons */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded bg-[#202227] border border-white/10 text-xs font-mono font-bold text-white tracking-wider flex items-center gap-2">
            <span>{currentRoomId}</span>
            <button
              onClick={copyRoomLink}
              className="text-surface-400 hover:text-white cursor-pointer"
              title="Copy Room Link"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            onClick={() => {
              const newCode = `SM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
              navigate(`/room/${newCode}`);
              showToast({ type: 'success', title: 'New Room Created', message: `Room code: ${newCode}` });
            }}
            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Room
          </button>
          <button
            onClick={() => {
              const inputCode = prompt('Enter Room Code to Join (e.g. SM-952JW or paste room link):');
              if (inputCode && inputCode.trim()) {
                const normalized = normalizeRoomCode(inputCode);
                navigate(`/room/${normalized}`);
                showToast({ type: 'info', title: 'Connecting to Room', message: `Joining ${normalized}...` });
              }
            }}
            className="px-3 py-1 rounded bg-[#292b32] hover:bg-[#343740] border border-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            Join Room
          </button>
        </div>

        {/* Right: Voice subtitle toggle, user badge & status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Voice Subtitles Toggle for Hearing Callers */}
          <button
            type="button"
            onClick={() => {
              setIsListeningSpeech(!isListeningSpeech);
              showToast({
                type: 'info',
                title: !isListeningSpeech ? 'Voice Subtitles ON' : 'Voice Subtitles OFF',
                message: !isListeningSpeech
                  ? 'Transcribing your voice into live captions for your partner.'
                  : 'Voice transcription paused.',
              });
            }}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
              isListeningSpeech
                ? 'bg-blue-600/30 border-blue-500/60 text-blue-300'
                : 'bg-[#202227] border-white/10 text-surface-400 hover:text-white'
            }`}
            title="Toggle Live Voice-to-Text Subtitles"
          >
            <Mic className="w-3.5 h-3.5 text-blue-400" />
            <span>Voice Subtitles: {isListeningSpeech ? 'ON' : 'OFF'}</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-[#202227] border border-white/10 text-xs text-surface-300">
            <span className="font-mono text-white font-semibold">{user?.displayName || currentRoomId}</span>
            <span className="text-[10px] text-surface-500 font-mono">({peerCount} in room)</span>
          </div>
          {rtdbConnected && (
            <div
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#202227] border border-white/10 text-[11px] text-amber-300 font-mono"
              title="Firebase Realtime Database WebRTC Signaling Active"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>RTDB Signaling</span>
            </div>
          )}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[11px] font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {isPartnerConnected
                ? (isSelfLoopback ? 'Self Test Active' : 'WebRTC Connected!')
                : 'Video Call Active'}
            </span>
          </div>
        </div>
      </header>

      {/* Network Origin Insecure Context Banner */}
      {(deviceError === 'INSECURE_NETWORK_ORIGIN' || deviceError === 'CAMERA_BLOCKED_HTTP_IP') && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 text-xs text-amber-200 flex items-center justify-between gap-3 shrink-0 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
            <span>
              Browsing via Network IP (<strong>{window.location.hostname}</strong>). Browsers require localhost or Chrome flag to enable camera over plain HTTP.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                const u = new URL(window.location.href);
                u.hostname = 'localhost';
                window.location.href = u.toString();
              }}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shrink-0 shadow flex items-center gap-1.5 cursor-pointer"
            >
              <VideoIcon className="w-3.5 h-3.5" />
              <span>Use localhost (Camera Allowed)</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area: Video Split Grid + Right Deaf Mode Drawer */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Video Area */}
        <div className="flex-1 flex flex-col p-4 relative overflow-hidden">
          {/* Dual Video Grid (Side-by-side like screenshot Page 65) */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-center min-h-0">
            {/* Box 1: "You" (Left Video) */}
            <div className="relative w-full h-full max-h-[70vh] bg-[#22242b] border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center shadow-lg group">
              {/* Video Element - kept in DOM so ref and tracks remain active */}
              <video
                ref={(el) => {
                  localVideoRef.current = el;
                  if (el && localStream && el.srcObject !== localStream) {
                    el.srcObject = localStream;
                    el.play().catch(() => {});
                  }
                }}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover scale-x-[-1] ${
                  isCameraEnabled && localStream ? 'block' : 'hidden'
                }`}
              />

              {(!isCameraEnabled || !localStream) && (
                <div className="flex flex-col items-center justify-center p-6 text-center select-none text-surface-400 z-10 max-w-sm">
                  {deviceError === 'CAMERA_BLOCKED_HTTP_IP' || deviceError === 'INSECURE_NETWORK_ORIGIN' || (deviceError && deviceError.includes('HTTPS')) || (typeof window !== 'undefined' && window.location.protocol === 'http:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') ? (
                    <div className="p-4 rounded-2xl bg-[#16181e]/95 border border-amber-500/30 text-center shadow-2xl backdrop-blur-md">
                      <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center mx-auto mb-3 text-amber-400">
                        <VideoOff className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-white mb-1">Webcam on Network IP ({window.location.hostname})</h4>
                      <p className="text-xs text-surface-300 leading-relaxed mb-4">
                        Chromium browsers restrict webcams on unencrypted HTTP network IPs. Use one of the options below to activate the camera:
                      </p>
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const u = new URL(window.location.href);
                            u.hostname = 'localhost';
                            window.location.href = u.toString();
                          }}
                          className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <VideoIcon className="w-4 h-4" />
                          <span>Open on localhost (Camera Allowed)</span>
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const s = await startLocalMedia();
                            if (s) {
                              showToast({
                                type: 'success',
                                title: 'Camera Enabled',
                                message: 'Webcam started successfully.',
                              });
                            }
                          }}
                          className="w-full py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow"
                        >
                          <span>Request Camera on HTTP</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const flagValue = `http://${window.location.host}`;
                            navigator.clipboard.writeText(flagValue).then(() => {
                              showToast({
                                type: 'success',
                                title: 'Copied to Clipboard!',
                                message: `Copied "${flagValue}". Paste it into Chrome flags.`,
                              });
                            });
                          }}
                          className="w-full py-2 px-4 rounded-xl bg-[#2b2d35] hover:bg-[#383b45] text-surface-200 text-xs font-semibold border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Origin for Chrome Flag</span>
                        </button>
                      </div>
                      <div className="mt-3 p-2 rounded-xl bg-black/40 border border-white/5 text-[10px] text-surface-400 text-left">
                        <span className="font-bold text-surface-300 block mb-0.5">To allow plain HTTP in Chrome:</span>
                        1. Open <code className="text-amber-300 font-mono select-all">chrome://flags/#unsafely-treat-insecure-origin-as-secure</code><br />
                        2. Add <code className="text-emerald-300 font-mono select-all">{`http://${window.location.host}`}</code><br />
                        3. Set to <strong>Enabled</strong> & Relaunch.
                      </div>
                    </div>
                  ) : (
                    <>
                      <VideoOff className="w-12 h-12 mb-3 text-surface-500" />
                      <span className="text-sm font-semibold text-white">
                        {deviceError || 'Camera is Turned Off'}
                      </span>
                      <p className="text-xs text-surface-400 mt-1">
                        {deviceError
                          ? 'Please verify browser camera permissions or close other apps using the webcam.'
                          : 'Click below to enable your camera for live video call and sign detection.'}
                      </p>
                      <button
                        type="button"
                        onClick={async () => {
                          const s = await startLocalMedia();
                          if (s) {
                            showToast({
                              type: 'success',
                              title: 'Camera Enabled',
                              message: 'Webcam connected and sign detection ready.',
                            });
                          }
                        }}
                        className="mt-3 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-colors"
                      >
                        Enable Camera Now
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Top-Left: "You" Badge */}
              <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-white">
                You
              </div>

              {/* Top-Right: Detection Indicator Badge */}
              <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl backdrop-blur-md border text-xs font-semibold shadow-lg transition-all ${
                  detectionResult?.hasHand
                    ? 'bg-black/80 border-amber-500/60 text-amber-300'
                    : 'bg-black/60 border-white/10 text-surface-400'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${detectionResult?.hasHand ? 'bg-amber-400 animate-ping' : 'bg-surface-500'}`} />
                  <span>
                    {detectionResult?.hasHand
                      ? `Sign: [${detectionResult.letter}] ${Math.round((detectionResult.confidence || 0) * 100)}%`
                      : 'Sign Detection Ready'}
                  </span>
                </div>
              </div>

              {/* Real Hand Landmark & Skeletal Overlay - ONLY when camera stream is active */}
              {isCameraEnabled && localStream && (
                <HandLandmarkOverlay
                  hasHand={!!detectionResult?.hasHand}
                  landmarks={detectionResult?.landmarks}
                  box={detectionResult?.box}
                  letter={detectionResult?.letter}
                  confidence={detectionResult?.confidence}
                  source={detectionResult?.source}
                  isMirrored={true}
                />
              )}

              {/* Bottom Info Bar inside You tile */}
              <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between gap-2 pointer-events-auto">
                <span className="px-2.5 py-1 rounded-lg bg-black/70 text-[11px] text-surface-300 backdrop-blur-sm border border-white/5">
                  {isMicEnabled ? 'Microphone On' : 'Microphone Muted'}
                </span>

                {/* Quick On-Screen Sign Buffer Controls */}
                <div className="flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 shadow-lg">
                  {recognition.recognizedText ? (
                    <>
                      <span className="text-xs font-mono font-bold text-white tracking-wider max-w-[120px] sm:max-w-[180px] truncate">
                        Sign: {recognition.recognizedText}
                      </span>
                      <button
                        type="button"
                        onClick={handleAddSpace}
                        className="p-1 rounded bg-[#2b2d35] hover:bg-blue-600 text-surface-200 hover:text-white transition-colors cursor-pointer"
                        title="Add Space to Sign"
                      >
                        <Space className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteChar}
                        className="p-1 rounded bg-[#2b2d35] hover:bg-rose-600 text-surface-200 hover:text-white transition-colors cursor-pointer"
                        title="Backspace"
                      >
                        <Delete className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleSendSignToCall}
                        className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Send Sign to Call & Speak"
                      >
                        <Send className="w-2.5 h-2.5" />
                        <span>Send</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleClearBuffer}
                        className="p-1 rounded bg-[#2b2d35] hover:bg-[#3b3e49] text-surface-400 hover:text-rose-300 transition-colors cursor-pointer"
                        title="Clear Buffer"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <span className="text-[11px] text-surface-400 font-sans italic px-1">
                      {aiState === 'active' ? 'Show sign to camera...' : 'Sign AI Ready'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Box 2: "Partner" (Right Video with Real WebRTC Stream) */}
            <div className="relative w-full h-full max-h-[70vh] bg-[#22242b] border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center shadow-lg">
              {isPartnerConnected && (remoteStream || isSelfLoopback) ? (
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                  {/* Real WebRTC video stream */}
                  <video
                    ref={partnerVideoRef}
                    autoPlay
                    playsInline
                    className={`w-full h-full object-cover ${isSelfLoopback ? 'scale-x-[-1]' : ''}`}
                  />

                  {/* Top-Right: Active Partner Sign Gesture Badge */}
                  {partnerLiveLetter && (
                    <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-xl border border-blue-400/40 animate-pulse">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                        <span>Live Sign:</span>
                        <span className="px-1.5 py-0.5 rounded bg-black/50 text-yellow-300 font-mono text-sm tracking-wider">
                          {partnerLiveLetter}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Live Caption Overlay for deaf users reading partner's spoken words or signs */}
                  <div className="absolute bottom-4 left-4 right-4 z-20 bg-[#121418]/90 backdrop-blur-md border border-white/20 p-3.5 rounded-2xl shadow-2xl transition-all">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                          <Volume2 className="w-3.5 h-3.5" />
                          Live Partner Subtitles (Sign & Voice)
                        </span>
                      </div>
                      {partnerLiveLetter && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-mono font-bold">
                          Active: [{partnerLiveLetter}]
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm sm:text-base font-semibold text-white tracking-wide leading-snug break-words flex-1">
                        {partnerLiveCaption ? (
                          <span className="text-white font-medium">{partnerLiveCaption}</span>
                        ) : (
                          <span className="text-surface-400 text-xs italic font-normal">
                            Live sign translations and speech from your partner will appear here in real time...
                          </span>
                        )}
                      </p>
                      {partnerLiveCaption && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.speechSynthesis) {
                              window.speechSynthesis.cancel();
                              const clean = partnerLiveCaption.replace(/^\[.*?\]:\s*/, '');
                              const u = new SpeechSynthesisUtterance(clean);
                              window.speechSynthesis.speak(u);
                            }
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1.5 shrink-0 transition-colors shadow cursor-pointer"
                          title="Listen aloud with Voice Synthesis"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Listen</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 text-surface-400 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-surface-800 border border-white/10 flex items-center justify-center mx-auto text-surface-300">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Waiting for Partner to Connect</h3>
                    <p className="text-xs text-surface-400 mt-1">
                      Share this room code or link to connect via WebRTC Realtime Database:
                    </p>
                    <span
                      onClick={copyRoomLink}
                      className="font-mono text-sm text-blue-400 font-bold block mt-1 hover:text-blue-300 cursor-pointer underline decoration-dotted"
                      title="Click to copy room code"
                    >
                      {currentRoomId}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={copyRoomLink}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy Invite Link
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        window.open(window.location.href, '_blank');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#292b32] hover:bg-[#343740] border border-white/10 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <span>Open 2nd Tab to Test Call</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const nextState = !isSelfLoopback;
                        setIsSelfLoopback(nextState);
                        setIsPartnerConnected(nextState);
                        showToast({
                          type: 'info',
                          title: nextState ? 'Self Test Mode Enabled' : 'Self Test Mode Disabled',
                          message: nextState
                            ? 'Camera stream routed to partner video window for local testing.'
                            : 'Waiting for remote peer stream.',
                        });
                      }}
                      className="px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/30 text-purple-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <span>{isSelfLoopback ? 'Disable Self Test' : 'Test Camera in Partner Box'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Top-Left: "Partner" Badge */}
              <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-white">
                Partner {isPartnerConnected && (isSelfLoopback ? '• Self Test' : '• WebRTC Live')}
              </div>
            </div>
          </div>

          {/* Floating Call Controls matching Screenshot Page 65 */}
          <div className="py-4 flex items-center justify-center shrink-0">
            <div className="flex items-center gap-3 bg-[#1d1f25] border border-white/10 px-5 py-2.5 rounded-full shadow-2xl backdrop-blur-md">
              {/* Mic Toggle */}
              <button
                type="button"
                onClick={toggleMicrophone}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                  isMicEnabled
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-[#2b2d35] hover:bg-[#383b45] text-rose-400'
                }`}
                title={isMicEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
              >
                {isMicEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              {/* Camera Toggle */}
              <button
                type="button"
                onClick={toggleCamera}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                  isCameraEnabled
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-[#2b2d35] hover:bg-[#383b45] text-rose-400'
                }`}
                title={isCameraEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
              >
                {isCameraEnabled ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              {/* Screen Share Toggle */}
              <button
                type="button"
                onClick={() => {
                  setIsScreenSharing(!isScreenSharing);
                  showToast({
                    type: 'info',
                    title: 'Screen Share',
                    message: !isScreenSharing ? 'Screen sharing initiated.' : 'Screen sharing stopped.',
                  });
                }}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                  isScreenSharing
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#2b2d35] hover:bg-[#383b45] text-white'
                }`}
                title="Share Screen"
              >
                <Share2 className="w-5 h-5" />
              </button>

              {/* End Call Button (Red) */}
              <button
                type="button"
                onClick={handleEndCall}
                className="w-12 h-12 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
                title="End Call"
              >
                <PhoneOff className="w-6 h-6" />
              </button>

              {/* Settings Toggle */}
              <button
                type="button"
                onClick={() => setShowSettingsModal(true)}
                className="w-11 h-11 rounded-full bg-[#2b2d35] hover:bg-[#383b45] text-white flex items-center justify-center transition-colors"
                title="Call Settings"
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* Toggle Deaf Mode Panel */}
              <button
                type="button"
                onClick={() => setIsDeafModeOpen(!isDeafModeOpen)}
                className={`px-3 py-2 rounded-full text-xs font-bold transition-colors ${
                  isDeafModeOpen
                    ? 'bg-brand-600 text-white'
                    : 'bg-[#2b2d35] text-surface-400 hover:text-white'
                }`}
              >
                Deaf Mode
              </button>
            </div>
          </div>
        </div>

        {/* Right Deaf Mode Drawer matching Screenshot Page 65 */}
        {isDeafModeOpen && (
          <aside
            className="w-80 md:w-96 bg-[#16171b] border-l border-white/10 flex flex-col shrink-0 h-full shadow-2xl transition-all"
            aria-label="Deaf Mode Assistive Panel"
          >
            {/* Header: Deaf Mode title + Close button */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#191b20]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <h2 className="font-bold text-sm tracking-wide text-white">Deaf Mode</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsDeafModeOpen(false)}
                className="text-surface-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
                title="Close Deaf Mode Panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl leading-relaxed ${
                    msg.sender === 'system'
                      ? 'bg-[#20232a] border border-blue-500/20 text-[#a0a5b2]'
                      : msg.sender === 'you'
                      ? 'bg-blue-600 text-white ml-6 rounded-tr-none'
                      : 'bg-[#272a33] text-white mr-6 border border-white/10'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className="text-[10px] text-surface-400 block mt-1 text-right">{msg.time}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Box matching Screenshot Page 65 */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-[#191b20]">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full bg-[#121316] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-surface-500 focus:outline-none focus:border-blue-500 pr-10"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="absolute right-2 p-1.5 rounded-lg text-blue-400 hover:text-white disabled:opacity-40 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Sign Language Detection Section matching Screenshot Page 65 */}
            <div className="p-4 border-t border-white/10 bg-[#131417] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-surface-300">Sign Language AI</span>
                <span className="text-[10px] text-brand-400 font-mono">
                  {detectionResult?.source === 'keras_model' ? 'Keras Model' : 'Edge AI'}
                </span>
              </div>

              {/* ASL Detection Toggle */}
              <button
                type="button"
                onClick={toggleAI}
                className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  aiState === 'active'
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow'
                    : 'bg-[#23262e] hover:bg-[#2e323c] text-surface-300'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${aiState === 'active' ? 'bg-emerald-300 animate-pulse' : 'bg-surface-500'}`} />
                <span>{aiState === 'active' ? 'Sign Detection Active' : 'Enable Sign Detection'}</span>
              </button>

              {/* Live Recognized Sign Buffer Card */}
              <div className="bg-[#191b22] border border-white/10 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-surface-400">
                  <span className="font-semibold text-surface-300">Live Sign Buffer:</span>
                  {recognition.currentPrediction && (
                    <span className="text-amber-400 font-mono font-bold">
                      Gesture: [{recognition.currentPrediction}] ({Math.round(recognition.confidence * 100)}%)
                    </span>
                  )}
                </div>
                <div className="min-h-[2.5rem] flex items-center bg-[#101114] border border-white/5 rounded-lg px-3 py-1.5 font-mono text-sm font-bold text-white tracking-wider break-all">
                  {recognition.recognizedText ? (
                    recognition.recognizedText
                  ) : (
                    <span className="text-surface-500 font-sans text-xs italic font-normal">
                      Sign to camera to generate words...
                    </span>
                  )}
                </div>

                {/* Buffer Controls: Space, Backspace, Send to Call, Clear */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={handleAddSpace}
                    className="py-1.5 rounded-lg bg-[#242730] hover:bg-blue-600 text-surface-200 hover:text-white text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer border border-white/5"
                    title="Insert Space"
                  >
                    <Space className="w-3 h-3" />
                    <span>Space</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteChar}
                    className="py-1.5 rounded-lg bg-[#242730] hover:bg-rose-600 text-surface-200 hover:text-white text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer border border-white/5"
                    title="Delete last letter"
                  >
                    <Delete className="w-3 h-3" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSendSignToCall}
                    disabled={!recognition.recognizedText}
                    className="py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow"
                    title="Send to Partner & Vocalize"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearBuffer}
                    className="py-1.5 rounded-lg bg-[#242730] hover:bg-[#343846] text-surface-300 hover:text-rose-300 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer border border-white/5"
                    title="Clear buffer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              {/* Contextual Suggestions Chips */}
              {recognition.suggestions && recognition.suggestions.length > 0 && (
                <div className="pt-1">
                  <span className="text-[10px] text-brand-400 font-semibold block mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Word Completions:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {recognition.suggestions.map((word) => (
                      <button
                        key={word}
                        type="button"
                        onClick={() => handleSelectSuggestion(word)}
                        className="px-2 py-0.5 rounded-lg bg-blue-950/70 hover:bg-blue-600 text-blue-200 hover:text-white text-[11px] font-semibold border border-blue-500/30 transition-colors cursor-pointer"
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick gesture simulation helpers */}
              <div className="pt-1">
                <span className="text-[10px] text-surface-400 uppercase font-semibold block mb-1">
                  Quick Sign Gestures:
                </span>
                <div className="flex flex-wrap gap-1">
                  {['HELLO', 'THANK YOU', 'YES', 'NO', 'HELP'].map((word) => (
                    <button
                      key={word}
                      type="button"
                      onClick={() => {
                        appendCharacter(word + ' ');
                        const updated = `${recognizedTextRef.current ? recognizedTextRef.current.trimEnd() + ' ' : ''}${word} `;
                        recognizedTextRef.current = updated;
                        const text = `[Signed]: ${word}`;
                        const newMsg: ChatMessage = {
                          id: `sign-${Date.now()}`,
                          sender: 'you',
                          text,
                          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        };
                        setMessages((prev) => [...prev, newMsg]);
                        webRTCService.sendMessage(text, user?.displayName || 'You', 'sign');
                        webRTCService.sendLiveCaption(word, updated);
                        if (isSelfLoopback) {
                          setPartnerLiveLetter(word);
                          setPartnerLiveCaption(updated);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#202227] hover:bg-blue-600 hover:text-white text-[10px] font-semibold text-surface-300 border border-white/5 transition-colors cursor-pointer"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#18191d] border border-white/10 rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-base text-white">Call & Assistive Settings</h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-surface-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-surface-400 font-semibold mb-2 uppercase">Camera & Video Status</label>
                <div className="p-3 rounded-xl bg-[#22242b] border border-white/5 text-white flex items-center justify-between">
                  <span>Webcam Active:</span>
                  <span className={`font-bold ${isCameraEnabled && localStream ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isCameraEnabled && localStream ? 'Connected' : 'Off'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-surface-400 font-semibold mb-2 uppercase">WebRTC Connection State</label>
                <div className="p-3 rounded-xl bg-[#22242b] border border-white/5 font-mono text-white flex items-center justify-between">
                  <span>Peer Status:</span>
                  <span className="text-emerald-400 font-bold uppercase">{webRtcStatus}</span>
                </div>
              </div>

              <div>
                <label className="block text-surface-400 font-semibold mb-2 uppercase">Partner Speech-To-Text</label>
                <button
                  type="button"
                  onClick={() => setIsListeningSpeech(!isListeningSpeech)}
                  className={`w-full py-2.5 px-3 rounded-xl font-semibold flex items-center justify-between border transition-colors cursor-pointer ${
                    isListeningSpeech
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                      : 'bg-[#22242b] border-white/5 text-surface-400'
                  }`}
                >
                  <span>Auto-Transcribe Hearing Voice</span>
                  {isListeningSpeech ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>

              <div>
                <label className="block text-surface-400 font-semibold mb-2 uppercase">Voice Synthesis (TTS)</label>
                <button
                  type="button"
                  onClick={() => {
                    if (window.speechSynthesis) {
                      window.speechSynthesis.cancel();
                      const u = new SpeechSynthesisUtterance('SignMate text to speech audio is functioning correctly.');
                      window.speechSynthesis.speak(u);
                    }
                  }}
                  className="w-full py-2.5 px-3 rounded-xl font-semibold flex items-center justify-between border bg-[#22242b] border-white/5 text-surface-200 hover:text-white hover:bg-[#2c2f38] transition-colors cursor-pointer"
                >
                  <span>Test Voice Output</span>
                  <Volume2 className="w-4 h-4 text-blue-400" />
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="w-full py-2.5 rounded-xl bg-white text-black font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
