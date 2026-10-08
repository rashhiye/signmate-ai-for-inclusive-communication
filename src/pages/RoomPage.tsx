import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useMediaDevices } from '../hooks/useMediaDevices';
import { useSignAI } from '../hooks/useSignAI';
import { useToast } from '../hooks/useToast';
import { webRTCService } from '../services/WebRTCService';
import { handSignDetector, type HandDetectionResult } from '../ai/handSignDetector';
import { HandLandmarkOverlay } from '../components/ai/HandLandmarkOverlay';
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
  } = useSignAI();

  // WebRTC Real Remote Stream states
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [webRtcStatus, setWebRtcStatus] = useState<string>('disconnected');
  const [isPartnerConnected, setIsPartnerConnected] = useState(false);
  const [peerCount, setPeerCount] = useState<number>(1);
  const [rtdbConnected, setRtdbConnected] = useState<boolean>(true);
  const [partnerLiveCaption, setPartnerLiveCaption] = useState<string>('');
  const [isSelfLoopback, setIsSelfLoopback] = useState<boolean>(false);

  // Real-time Hand Detection state
  const [detectionResult, setDetectionResult] = useState<HandDetectionResult | null>(null);

  // Local UI states
  const [isDeafModeOpen, setIsDeafModeOpen] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isListeningSpeech, setIsListeningSpeech] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'ASL' | 'ISL'>('ASL');

  // Video element references
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const partnerVideoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Chat messages matching screenshot Page 65
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'system',
      text: 'Welcome! Your messages will appear here',
      time: '10:14 pm',
    },
    {
      id: 'm2',
      sender: 'system',
      text: 'Connected to Firebase Realtime Database signaling for ultra-low latency calls.',
      time: '10:14 pm',
    },
    {
      id: 'm3',
      sender: 'system',
      text: 'System: Sign detection started. Show your hand to YOUR camera (left Video)',
      time: '10:14 pm',
    },
  ]);

  // Start media stream on mount
  useEffect(() => {
    startLocalMedia();
    return () => {
      stopLocalMedia();
    };
  }, [startLocalMedia, stopLocalMedia]);

  // Attach local stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
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
          if (result.letter === candidateLetter) {
            stableCount++;
            // Require 4 stable frames (~720ms) and active cooldown passed
            if (stableCount >= 4 && cooldown <= 0) {
              appendCharacter(result.letter);
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
  }, [isCameraEnabled, aiState, appendCharacter]);

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
  }, [isListeningSpeech, user?.displayName]);

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

  const handleSpeakCurrentBuffer = () => {
    if (!recognition.recognizedText) {
      showToast({ type: 'warning', title: 'Nothing to Speak', message: 'No recognized sign text to vocalize.' });
      return;
    }
    speakRecognizedText();
    const text = `[Sign Language]: ${recognition.recognizedText}`;
    const newMsg: ChatMessage = {
      id: `sign-${Date.now()}`,
      sender: 'you',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    webRTCService.sendMessage(text, user?.displayName || 'You', 'sign');
    showToast({ type: 'success', title: 'Text-to-Speech', message: `Speaking: "${recognition.recognizedText}"` });
  };

  const handleResetDetection = () => {
    clearRecognized();
    showToast({ type: 'info', title: 'Detection Reset', message: 'Sign buffer and tracking landmarks reset.' });
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
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-xs tracking-wider">
            SM
          </div>
          <span className="font-bold text-base tracking-wide text-white">SignMate</span>
        </div>

        {/* Center: Room Code & Action Buttons */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded bg-[#202227] border border-white/10 text-xs font-mono font-bold text-white tracking-wider flex items-center gap-2">
            <span>{currentRoomId}</span>
            <button
              onClick={copyRoomLink}
              className="text-surface-400 hover:text-white"
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
            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Room
          </button>
          <button
            onClick={() => {
              const inputCode = prompt('Enter Room Code to Join (e.g., SM-952JW or X8LN7A):');
              if (inputCode && inputCode.trim()) {
                navigate(`/room/${inputCode.trim().toUpperCase()}`);
              }
            }}
            className="px-3 py-1 rounded bg-[#292b32] hover:bg-[#343740] border border-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            Join Room
          </button>
        </div>

        {/* Right: User badge, RTDB indicator & Video call active status */}
        <div className="flex items-center gap-2 sm:gap-3">
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

      {/* Main Content Area: Video Split Grid + Right Deaf Mode Drawer */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Video Area */}
        <div className="flex-1 flex flex-col p-4 relative overflow-hidden">
          {/* Dual Video Grid (Side-by-side like screenshot Page 65) */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-center min-h-0">
            {/* Box 1: "You" (Left Video) */}
            <div className="relative w-full h-full max-h-[70vh] bg-[#22242b] border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center shadow-lg group">
              {isCameraEnabled && localStream ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center select-none text-surface-400">
                  <VideoOff className="w-12 h-12 mb-3 text-surface-500" />
                  <span className="text-sm font-semibold">Camera is Turned Off</span>
                  <span className="text-xs text-surface-500 mt-1">Enable camera using the bottom toolbar</span>
                </div>
              )}

              {/* Top-Left: "You" Badge */}
              <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-white">
                You
              </div>

              {/* Top-Right: Detection Indicator Banner matching Screenshot Page 65 */}
              <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg backdrop-blur-md border text-[11px] font-semibold shadow transition-colors ${
                  detectionResult?.hasHand
                    ? 'bg-[#272a33]/90 border-yellow-500/60 text-yellow-300'
                    : 'bg-black/50 border-white/10 text-surface-400'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${detectionResult?.hasHand ? 'bg-yellow-400 animate-ping' : 'bg-surface-500'}`} />
                  <span>
                    {detectionResult?.hasHand
                      ? `Detection: Hand Detected [${detectionResult.letter}]`
                      : 'Detection: Ready'}
                  </span>
                </div>
              </div>

              {/* Real Hand Landmark & Skeletal Overlay */}
              {isCameraEnabled && (
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
              <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
                <span className="px-2 py-0.5 rounded bg-black/60 text-[11px] text-surface-300 backdrop-blur-sm">
                  {isMicEnabled ? 'Microphone On' : 'Microphone Muted'}
                </span>
                {recognition.recognizedText && (
                  <span className="px-3 py-1 rounded-lg bg-blue-600/90 text-white text-xs font-mono font-bold shadow">
                    Sign: {recognition.recognizedText}
                  </span>
                )}
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
                  {/* Live Caption Overlay for deaf users reading partner's spoken words */}
                  <div className="absolute bottom-4 left-4 right-4 z-20 bg-black/80 backdrop-blur-md border border-white/15 p-3 rounded-xl shadow-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                        Live Speech & Sign Caption (Partner)
                      </span>
                    </div>
                    <p className="text-sm font-medium text-white leading-snug">
                      {partnerLiveCaption || '"WebRTC audio/video stream active. You are speaking in real-time."'}
                    </p>
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
                    <span className="font-mono text-sm text-blue-400 font-bold block mt-1">
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
            <div className="p-4 border-t border-white/10 bg-[#131417] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-surface-300">Sign Language Detection</span>
                <span className="text-[10px] text-brand-400 font-mono">
                  {detectionResult?.source === 'keras_model' ? 'Keras Model' : 'Edge AI'}
                </span>
              </div>

              {/* ASL Detection Toggle */}
              <button
                type="button"
                onClick={toggleAI}
                className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors ${
                  aiState === 'active'
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow'
                    : 'bg-[#23262e] hover:bg-[#2e323c] text-surface-300'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${aiState === 'active' ? 'bg-emerald-300 animate-pulse' : 'bg-surface-500'}`} />
                <span>{selectedLanguage} Detection Active</span>
              </button>

              {/* Action Buttons: Reset, Speak, Clear */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={handleResetDetection}
                  className="py-2 px-2 rounded-xl bg-[#23262e] hover:bg-[#2f333e] text-[11px] font-semibold text-white flex items-center justify-center gap-1.5 transition-colors border border-white/5"
                  title="Reset Detection"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>

                <button
                  type="button"
                  onClick={handleSpeakCurrentBuffer}
                  className="py-2 px-2 rounded-xl bg-[#23262e] hover:bg-[#2f333e] text-[11px] font-semibold text-white flex items-center justify-center gap-1.5 transition-colors border border-white/5"
                  title="Speak Text with Voice Synthesis"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Speak</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    clearRecognized();
                    setMessages([]);
                    showToast({ type: 'info', title: 'Cleared', message: 'Cleared conversation and buffer.' });
                  }}
                  className="py-2 px-2 rounded-xl bg-[#23262e] hover:bg-[#2f333e] text-[11px] font-semibold text-rose-300 flex items-center justify-center gap-1.5 transition-colors border border-white/5"
                  title="Clear Conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>

              {/* Quick letter simulation helpers */}
              <div className="pt-1">
                <span className="text-[10px] text-surface-500 uppercase font-semibold block mb-1">
                  Test Gestures:
                </span>
                <div className="flex flex-wrap gap-1">
                  {['HELLO', 'THANK YOU', 'YES', 'NO', 'HELP'].map((word) => (
                    <button
                      key={word}
                      type="button"
                      onClick={() => {
                        appendCharacter(word + ' ');
                        const text = `[Signed]: ${word}`;
                        const newMsg: ChatMessage = {
                          id: `sign-${Date.now()}`,
                          sender: 'you',
                          text,
                          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        };
                        setMessages((prev) => [...prev, newMsg]);
                        webRTCService.sendMessage(text, user?.displayName || 'You', 'sign');
                      }}
                      className="px-2 py-1 rounded bg-[#202227] hover:bg-blue-600 hover:text-white text-[10px] text-surface-300 border border-white/5 transition-colors"
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
                <label className="block text-surface-400 font-semibold mb-2 uppercase">Sign Language System</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedLanguage('ASL')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-colors ${
                      selectedLanguage === 'ASL'
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-[#22242b] text-surface-400 border-white/5'
                    }`}
                  >
                    American Sign (ASL)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedLanguage('ISL')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-colors ${
                      selectedLanguage === 'ISL'
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-[#22242b] text-surface-400 border-white/5'
                    }`}
                  >
                    Indian Sign (ISL)
                  </button>
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
                  className={`w-full py-2.5 px-3 rounded-xl font-semibold flex items-center justify-between border transition-colors ${
                    isListeningSpeech
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                      : 'bg-[#22242b] border-white/5 text-surface-400'
                  }`}
                >
                  <span>Auto-Transcribe Hearing Voice</span>
                  {isListeningSpeech ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
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
