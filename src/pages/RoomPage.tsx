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
  Trash2,
  X,
  Copy,
  Users,
  Space,
  Delete,
  Sparkles,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Activity,
  Sliders,
  AlertTriangle,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'system' | 'you' | 'partner';
  text: string;
  time: string;
}

interface RemoteParticipantTileProps {
  stream?: MediaStream;
  peerLabel: string;
  badgeLabel: string;
  badgeColor?: string;
  fitMode: 'cover' | 'contain';
}

const RemoteParticipantTile: React.FC<RemoteParticipantTileProps> = ({
  stream,
  peerLabel,
  badgeLabel,
  badgeColor = 'bg-blue-400',
  fitMode,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
      }
      videoRef.current.play().catch((err) => {
        console.warn(`[RemoteParticipantTile] Play caught for ${peerLabel}:`, err);
      });
    }
  }, [stream, peerLabel]);

  return (
    <div className="relative w-full h-full bg-[#15171f] border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden flex items-center justify-center shadow-2xl">
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`w-full h-full ${fitMode === 'contain' ? 'object-contain' : 'object-cover'} object-center`}
        />
      ) : (
        <div className="text-center p-4 text-surface-400 space-y-2 select-none">
          <div className="w-12 h-12 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-300 font-bold text-sm animate-pulse">
            <Users className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-semibold text-white">{peerLabel}</h4>
          <span className="text-[10px] text-surface-400 block">Connecting live video & audio...</span>
        </div>
      )}

      {/* Peer Badge */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-white shadow-md">
        <span className={`w-2 h-2 rounded-full ${badgeColor} ${stream ? 'animate-pulse' : ''}`} />
        <span>{badgeLabel}</span>
      </div>
    </div>
  );
};

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
    repeatLastCharacter,
    deleteLastCharacter,
    addSpace,
    selectSuggestion,
  } = useSignAI();

  // WebRTC Real Remote Stream states
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [remotePeers, setRemotePeers] = useState<Map<string, { peerId: string; stream: MediaStream }>>(new Map());
  const [webRtcStatus, setWebRtcStatus] = useState<string>('disconnected');
  const [isPartnerConnected, setIsPartnerConnected] = useState(false);
  const [peerCount, setPeerCount] = useState<number>(1);
  const [rtdbConnected, setRtdbConnected] = useState<boolean>(true);
  const [partnerLiveCaption, setPartnerLiveCaption] = useState<string>('');
  const [partnerLiveLetter, setPartnerLiveLetter] = useState<string>('');
  const isSelfLoopback = false;
  const [isAutoSpeakEnabled, setIsAutoSpeakEnabled] = useState<boolean>(true);
  const [isRoomFull, setIsRoomFull] = useState<boolean>(false);
  const isAutoSpeakRef = useRef<boolean>(true);
  const recognizedTextRef = useRef<string>('');

  // Overlay Chat drawer & unread notifications
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Floating assistive bar collapse toggle
  const [isAssistiveCollapsed, setIsAssistiveCollapsed] = useState(false);

  // Video aspect ratio mode: 'cover' (edge-to-edge) vs 'contain' (full frame fit)
  const [videoFit, setVideoFit] = useState<'cover' | 'contain'>('cover');

  // Accordion Settings Modal state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<'audio' | 'video' | 'ai' | 'room'>('audio');

  // Screen sharing & speech recognition
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isListeningSpeech, setIsListeningSpeech] = useState(false);
  const [showLandmarks, setShowLandmarks] = useState(true);

  // Real-time Hand Detection state
  const [detectionResult, setDetectionResult] = useState<HandDetectionResult | null>(null);

  // Video element references
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const partnerVideoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Keep isAutoSpeakRef synchronized with toggle state
  useEffect(() => {
    isAutoSpeakRef.current = isAutoSpeakEnabled;
  }, [isAutoSpeakEnabled]);

  // Voice synthesis speaker helper
  const speakText = (raw: string) => {
    if (!window.speechSynthesis || !raw) return;
    try {
      window.speechSynthesis.cancel();
      const clean = raw.replace(/^\[.*?\]:\s*/, '').trim();
      if (!clean) return;
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      // ignore
    }
  };

  // Keep recognizedTextRef synchronized with recognition state
  useEffect(() => {
    recognizedTextRef.current = recognition.recognizedText;
  }, [recognition.recognizedText]);

  // Initial messages
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return [
      {
        id: 'm1',
        sender: 'system',
        text: '👋 Welcome to SignMate. Live sign translations, subtitles, and messages stream here in real-time.',
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
          message: 'Real WebRTC live video & audio stream established.',
        });
      },
      onPeerStream: (peerId, stream) => {
        setIsPartnerConnected(true);
        setRemotePeers((prev) => {
          const next = new Map(prev);
          next.set(peerId, { peerId, stream });
          return next;
        });
      },
      onPeerLeave: (peerId) => {
        setRemotePeers((prev) => {
          const next = new Map(prev);
          next.delete(peerId);
          return next;
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

        // If chat drawer is closed, increment unread counter
        setIsChatDrawerOpen((isOpen) => {
          if (!isOpen) {
            setUnreadCount((prev) => prev + 1);
          }
          return isOpen;
        });

        // Automatically speak signed messages for hearing callers if enabled
        if (isAutoSpeakRef.current && (roomMsg.type === 'sign' || roomMsg.text.startsWith('[Signed]:'))) {
          speakText(roomMsg.text);
        }
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
      onRoomFull: () => {
        setIsRoomFull(true);
        showToast({
          type: 'error',
          title: 'Room Full',
          message: 'This video call already has the maximum of 4 participants.',
        });
      },
    });

    return () => {
      webRTCService.cleanup();
      setRemotePeers(new Map());
    };
  }, [localStream, currentRoomId, showToast, isSelfLoopback]);

  // Attach remote stream whenever partnerVideoRef or remoteStream updates
  useEffect(() => {
    const remoteList = Array.from(remotePeers.values());
    const firstRemoteStream = remoteList[0]?.stream || remoteStream;
    if (partnerVideoRef.current) {
      if (isSelfLoopback && localStream) {
        partnerVideoRef.current.srcObject = localStream;
        partnerVideoRef.current.play().catch(() => {});
      } else if (firstRemoteStream) {
        partnerVideoRef.current.srcObject = firstRemoteStream;
        partnerVideoRef.current.play().catch(() => {});
      }
    }
  }, [remotePeers, remoteStream, isPartnerConnected, isSelfLoopback, localStream]);

  // Real Sign Language Detection Loop (webcam frame -> hand ROI -> classifier)
  useEffect(() => {
    if (!isCameraEnabled || aiState !== 'active') {
      setDetectionResult(null);
      return;
    }

    let isMounted = true;
    let stableCount = 0;
    let holdCount = 0;
    let repeatCount = 0;
    let candidateLetter = '';
    let lastCommittedLetter = '';
    let releaseCount = 0;

    const intervalId = window.setInterval(async () => {
      if (!localVideoRef.current || !isMounted) return;
      try {
        const result = await handSignDetector.detectSign(localVideoRef.current);
        if (!isMounted) return;

        setDetectionResult(result);

        // Detect hand release or neutral state to allow signing the same letter again
        if (!result.hasHand || !result.letter || result.confidence < 0.70) {
          releaseCount++;
          if (releaseCount >= 2) {
            lastCommittedLetter = '';
            candidateLetter = '';
            stableCount = 0;
            holdCount = 0;
            repeatCount = 0;
            if (isSelfLoopback) {
              setPartnerLiveLetter('');
            }
          }
        } else {
          releaseCount = 0;
        }

        const validLetter = /^[A-Z]$/.test(result.letter) ? result.letter : '';

        // Stream active detected sign in real-time
        if (result.hasHand && validLetter && result.confidence >= 0.70) {
          webRTCService.sendLiveCaption(validLetter, recognizedTextRef.current);
          if (isSelfLoopback) {
            setPartnerLiveLetter(validLetter);
          }

          // Double/Triple letter hold handling (e.g. for "MOON", "HELLO")
          if (validLetter === lastCommittedLetter) {
            holdCount++;
            // Require a deliberate hold of ~1.5s (13 frames @ 120ms) for intentional duplicate letter
            if (holdCount >= 13 && repeatCount === 0) {
              const letter = validLetter;
              appendCharacter(letter);
              const updatedBuffer = (recognizedTextRef.current + letter).toUpperCase();
              recognizedTextRef.current = updatedBuffer;
              webRTCService.sendLiveCaption(letter, updatedBuffer);
              if (isSelfLoopback) {
                setPartnerLiveLetter(letter);
                setPartnerLiveCaption(updatedBuffer);
              }
              repeatCount = 1;
            } else if (holdCount >= 22 && repeatCount === 1) {
              const letter = validLetter;
              appendCharacter(letter);
              const updatedBuffer = (recognizedTextRef.current + letter).toUpperCase();
              recognizedTextRef.current = updatedBuffer;
              webRTCService.sendLiveCaption(letter, updatedBuffer);
              if (isSelfLoopback) {
                setPartnerLiveLetter(letter);
                setPartnerLiveCaption(updatedBuffer);
              }
              repeatCount = 2;
            }
            candidateLetter = '';
            stableCount = 0;
            return;
          }

          // Commit NEW letter to sentence buffer when held stable for 2 frames (~360ms)
          if (result.confidence >= 0.70) {
            if (validLetter === candidateLetter) {
              stableCount++;
              if (stableCount >= 2) {
                const letter = validLetter;
                appendCharacter(letter);
                const updatedBuffer = (recognizedTextRef.current + letter).toUpperCase();
                recognizedTextRef.current = updatedBuffer;
                webRTCService.sendLiveCaption(letter, updatedBuffer);
                if (isSelfLoopback) {
                  setPartnerLiveLetter(letter);
                  setPartnerLiveCaption(updatedBuffer);
                }
                lastCommittedLetter = letter;
                holdCount = 0;
                repeatCount = 0;
                stableCount = 0;
                candidateLetter = '';
              }
            } else {
              candidateLetter = validLetter;
              stableCount = 1;
              holdCount = 0;
              repeatCount = 0;
            }
          } else {
            stableCount = 0;
            candidateLetter = '';
          }
        } else {
          stableCount = 0;
          candidateLetter = '';
        }
      } catch {
        // Continue detection loop
      }
    }, 120);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [isCameraEnabled, aiState, appendCharacter, isSelfLoopback]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatDrawerOpen]);

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

  const handleRepeatLast = () => {
    repeatLastCharacter();
    const cur = recognizedTextRef.current;
    if (cur) {
      const lastChar = cur.slice(-1);
      const updated = cur + lastChar;
      recognizedTextRef.current = updated;
      webRTCService.sendLiveCaption(lastChar, updated);
      if (isSelfLoopback) {
        setPartnerLiveLetter(lastChar);
        setPartnerLiveCaption(updated);
      }
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
    const trimmed = (recognizedTextRef.current || '').trimEnd();
    const lastSpaceIndex = trimmed.lastIndexOf(' ');
    const prefix = lastSpaceIndex >= 0 ? trimmed.substring(0, lastSpaceIndex + 1) : '';
    const updated = `${prefix}${word.toUpperCase()} `;
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
      message: `Share room code ${currentRoomId} to connect via WebRTC!`,
    });
  };

  const openChatDrawer = () => {
    setIsChatDrawerOpen(true);
    setUnreadCount(0);
  };

  // Dynamic WhatsApp Call grid:
  // Mobile: 2 vertically stacked equal tiles (WhatsApp mobile style)
  // Desktop: 2 equal side-by-side vertical columns (WhatsApp desktop / Meet style)
  const remoteList = Array.from(remotePeers.values());
  const effectivePeerCount = Math.min(4, Math.max(peerCount, remoteList.length + 1));
  const totalTiles = Math.min(4, Math.max(effectivePeerCount, isPartnerConnected ? 2 : 1));
  const getGridClasses = () => {
    if (totalTiles <= 2) {
      return 'grid-cols-1 md:grid-cols-2 grid-rows-2 md:grid-rows-1';
    }
    if (totalTiles === 3) {
      // 3 users: 1 top hero + 2 bottom on mobile; 3 equal columns on desktop
      return 'grid-cols-2 md:grid-cols-3 grid-rows-2 md:grid-rows-1';
    }
    // 4 users: 2x2 quadrant grid on both mobile and desktop
    return 'grid-cols-2 grid-rows-2';
  };

  return (
    <div className="flex-1 flex flex-col h-screen max-h-screen h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#0d0f14] text-[#e2e8f0] font-['Montserrat',sans-serif] select-none relative">
      {/* WhatsApp Call Header Bar */}
      <header className="h-14 bg-[#12141a]/95 border-b border-white/10 px-3 sm:px-5 flex items-center justify-between shrink-0 z-20 backdrop-blur-xl">
        {/* Left: Brand & Room code */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
            title="Go to Dashboard"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs tracking-wider shadow-lg group-hover:scale-105 transition-transform">
              SM
            </div>
            <span className="font-bold text-sm tracking-wide text-white group-hover:text-blue-300 transition-colors hidden sm:inline">
              SignMate Call
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1b1e26] border border-white/10 text-xs font-mono font-bold text-white">
            <span className="text-blue-400">{currentRoomId}</span>
            <button
              onClick={copyRoomLink}
              className="text-surface-400 hover:text-white transition-colors cursor-pointer p-0.5"
              title="Copy Room Link"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center: Live Call Status & Participant Count */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[11px] font-semibold text-emerald-300 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {isPartnerConnected
                ? (isSelfLoopback ? 'Self Test' : 'Connected')
                : 'Active Call'}
            </span>
          </div>
          <span className="text-[11px] text-surface-400 font-mono px-2 py-0.5 rounded-full bg-[#1b1e26] border border-white/5">
            {Math.min(4, Math.max(peerCount, remoteList.length + 1))}/4 in call
          </span>
        </div>

        {/* Right: Quick Subtitles Voice Toggle */}
        <div className="flex items-center gap-2">
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
              isListeningSpeech
                ? 'bg-blue-600/30 border-blue-500/60 text-blue-300'
                : 'bg-[#1b1e26] border-white/10 text-surface-400 hover:text-white'
            }`}
            title="Toggle Live Speech-to-Text Transcriptions"
          >
            <Mic className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Subtitles:</span> {isListeningSpeech ? 'ON' : 'OFF'}
          </button>
        </div>
      </header>

      {/* Network Origin Insecure Context Banner */}
      {(deviceError === 'INSECURE_NETWORK_ORIGIN' || deviceError === 'CAMERA_BLOCKED_HTTP_IP') && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-200 flex items-center justify-between gap-3 shrink-0 backdrop-blur-md z-20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
            <span>
              Browsing via IP (<strong>{window.location.hostname}</strong>). Browsers require localhost to enable camera over plain HTTP.
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              const u = new URL(window.location.href);
              u.hostname = 'localhost';
              window.location.href = u.toString();
            }}
            className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <VideoIcon className="w-3.5 h-3.5" />
            <span>Switch to localhost</span>
          </button>
        </div>
      )}

      {/* Main Edge-to-Edge WhatsApp Call Video Stage - Padded cleanly above bottom controls */}
      <main className="flex-1 relative overflow-hidden flex flex-col p-2 sm:p-3 pb-36 sm:pb-40 md:pb-44 bg-[#0a0c10]" aria-label="Video Call Feed">
        {/* Fullscreen Video Grid (WhatsApp Video Call style with 1, 2, 3, or 4 tiles) */}
        <div className={`flex-1 grid ${getGridClasses()} gap-2 sm:gap-3 items-stretch justify-center h-full min-h-0 relative`}>
          {/* Tile 1: "You" (Local Webcam with Hand Landmarks) */}
          <div className={`relative w-full h-full bg-[#15171f] border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden flex items-center justify-center shadow-2xl group ${totalTiles === 3 ? 'col-span-2 md:col-span-1' : ''}`}>
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
              className={`w-full h-full ${videoFit === 'contain' ? 'object-contain' : 'object-cover'} object-center scale-x-[-1] transition-opacity duration-300 ${
                isCameraEnabled && localStream ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Camera Off / Error Placeholder */}
            {(!isCameraEnabled || !localStream) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none text-surface-400 z-10 bg-[#12141a]/95">
                <div className="w-16 h-16 rounded-full bg-surface-800/80 border border-white/10 flex items-center justify-center mb-3 text-surface-400">
                  <VideoOff className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">
                  {deviceError || 'Camera is Turned Off'}
                </h3>
                <p className="text-xs text-surface-400 max-w-xs mb-4">
                  Turn on your camera to join the video call and activate real-time sign detection.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    const s = await startLocalMedia();
                    if (s) {
                      showToast({ type: 'success', title: 'Camera Enabled', message: 'Webcam ready for video & signs.' });
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg cursor-pointer"
                >
                  Enable Camera
                </button>
              </div>
            )}

            {/* "You" Glass Badge */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-white shadow-md flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span>You</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-[10px] text-surface-400 border border-white/5">
                {isMicEnabled ? 'Mic On' : 'Muted'}
              </span>
              <button
                type="button"
                onClick={() => setVideoFit((f) => (f === 'cover' ? 'contain' : 'cover'))}
                className="px-2.5 py-0.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-[10px] text-surface-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                title="Toggle between edge-to-edge fill and uncropped fit"
              >
                {videoFit === 'cover' ? 'Fit View' : 'Fill View'}
              </button>
            </div>

            {/* Top-Right: Sign Detection Active Indicator */}
            <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-md border text-xs font-semibold shadow-lg transition-all ${
                  detectionResult?.hasHand && detectionResult.letter
                    ? 'bg-amber-950/80 border-amber-500/60 text-amber-300'
                    : 'bg-black/60 border-white/10 text-surface-400'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    detectionResult?.hasHand && detectionResult.letter ? 'bg-amber-400 animate-ping' : 'bg-surface-500'
                  }`}
                />
                <span>
                  {detectionResult?.hasHand && detectionResult.letter
                    ? `Sign: [${detectionResult.letter}] ${Math.round((detectionResult.confidence || 0) * 100)}%`
                    : aiState === 'active'
                    ? 'Detecting signs...'
                    : 'Sign AI Ready'}
                </span>
              </div>
            </div>

            {/* Hand Landmark Overlay */}
            {isCameraEnabled && localStream && showLandmarks && (
              <HandLandmarkOverlay
                hasHand={!!detectionResult?.hasHand}
                landmarks={detectionResult?.landmarks}
                box={detectionResult?.box}
                letter={detectionResult?.letter}
                confidence={detectionResult?.confidence}
                source={detectionResult?.source}
                isMirrored={true}
                videoRef={localVideoRef}
                fitMode={videoFit}
              />
            )}
          </div>

          {/* Tile 2: "Partner 1" (Remote WebRTC Stream / Waiting State) */}
          <div className="relative w-full h-full bg-[#15171f] border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden flex items-center justify-center shadow-2xl">
            {isPartnerConnected && (remoteList[0]?.stream || remoteStream || isSelfLoopback) ? (
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                <video
                  ref={partnerVideoRef}
                  autoPlay
                  playsInline
                  className={`w-full h-full ${videoFit === 'contain' ? 'object-contain' : 'object-cover'} object-center ${isSelfLoopback ? 'scale-x-[-1]' : ''}`}
                />

                {/* Top-Left: Partner Badge */}
                <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                  <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-white shadow-md flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Partner {isSelfLoopback ? '(Self Test)' : ''}</span>
                  </div>
                </div>

                {/* Top-Right: Live Sign Gesture Alert Badge */}
                {partnerLiveLetter && (
                  <div className="absolute top-3 right-3 z-20 flex items-center gap-2 animate-bounce">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-xl border border-blue-400/40">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                      <span>Partner Signed:</span>
                      <span className="px-2 py-0.5 rounded-lg bg-black/50 text-yellow-300 font-mono text-sm font-black">
                        {partnerLiveLetter}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Waiting for partner screen (Clean WhatsApp call style) */
              <div className="text-center p-6 text-surface-400 space-y-2.5 z-10 select-none">
                <div className="w-16 h-16 rounded-full bg-[#1e212b] border border-white/10 flex items-center justify-center mx-auto text-surface-400 animate-pulse">
                  <Users className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Waiting for Partner...</h3>
                  <p className="text-xs text-surface-400 mt-0.5">
                    Room: <span className="font-mono text-blue-400 font-bold">{currentRoomId}</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Tile 3: Partner 2 (Real 3rd Participant Live Stream with Audio & Video) */}
          {totalTiles >= 3 && (
            <RemoteParticipantTile
              stream={remoteList[1]?.stream}
              peerLabel="Participant 3"
              badgeLabel="Partner 2"
              badgeColor="bg-blue-400"
              fitMode={videoFit}
            />
          )}

          {/* Tile 4: Partner 3 (Real 4th Participant Live Stream with Audio & Video) */}
          {totalTiles >= 4 && (
            <RemoteParticipantTile
              stream={remoteList[2]?.stream}
              peerLabel="Participant 4"
              badgeLabel="Partner 3"
              badgeColor="bg-purple-400"
              fitMode={videoFit}
            />
          )}
        </div>

        {/* FLOATING STREAM MESSAGES & ASSISTIVE OPTIONS SECTION (Just above bottom controls) */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-2xl flex flex-col gap-2 pointer-events-auto transition-all duration-300">
          {/* Live Stream Messages & Subtitles Card (Moved out of video tile to just above options) */}
          {(partnerLiveCaption || isPartnerConnected) && (
            <div className="bg-[#101217]/95 backdrop-blur-2xl border border-white/15 p-2.5 sm:p-3 rounded-2xl shadow-2xl transition-all">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5" />
                    Live Stream Messages & Subtitles
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {partnerLiveLetter && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[10px] font-mono font-bold">
                      [{partnerLiveLetter}]
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const next = !isAutoSpeakEnabled;
                      setIsAutoSpeakEnabled(next);
                      showToast({
                        type: 'info',
                        title: next ? 'Auto-Voice Enabled' : 'Auto-Voice Muted',
                        message: next ? 'Incoming signs will be vocalized.' : 'Muted incoming signs.',
                      });
                    }}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer border ${
                      isAutoSpeakEnabled
                        ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-300'
                        : 'bg-[#22252e] border-white/10 text-surface-400 hover:text-white'
                    }`}
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Voice: {isAutoSpeakEnabled ? 'ON' : 'OFF'}</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs sm:text-sm font-semibold text-white tracking-wide leading-relaxed break-words flex-1">
                  {partnerLiveCaption ? (
                    <span>{partnerLiveCaption}</span>
                  ) : (
                    <span className="text-surface-400 text-xs italic font-normal">
                      Live signed messages and voice transcriptions stream here in real-time...
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
                    className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1 transition-colors shadow cursor-pointer shrink-0"
                    title="Listen aloud with Voice Synthesis"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Listen</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* MAIN SCREEN FLOATING ASSISTIVE BAR (Sign AI, Live Buffer & Word Suggestions) */}
          <div className="bg-[#12141a]/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-2.5 sm:p-3 text-xs space-y-2">
            {/* Header / Buffer Row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <button
                  type="button"
                  onClick={toggleAI}
                  className={`px-2.5 py-1 rounded-full font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 border ${
                    aiState === 'active'
                      ? 'bg-blue-600/30 border-blue-500/50 text-blue-300'
                      : 'bg-[#22252e] border-white/10 text-surface-400'
                  }`}
                  title="Toggle Sign AI Recognition"
                >
                  <span className={`w-2 h-2 rounded-full ${aiState === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-surface-500'}`} />
                  <span>{aiState === 'active' ? 'Sign AI Active' : 'Enable AI'}</span>
                </button>

                {/* Monospace Active Buffer */}
                <div className="flex-1 min-h-[1.8rem] flex items-center bg-[#0d0f14] border border-white/10 rounded-xl px-2.5 py-1 font-mono text-xs sm:text-sm font-bold text-white tracking-wider truncate">
                  {recognition.recognizedText ? (
                    <span>{recognition.recognizedText}</span>
                  ) : (
                    <span className="text-surface-500 font-sans text-[11px] italic font-normal">
                      {aiState === 'active' ? 'Sign letters to camera...' : 'Sign buffer ready'}
                    </span>
                  )}
                </div>
              </div>

              {/* Buffer Quick Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleAddSpace}
                  className="px-2 py-1 rounded-lg bg-[#22252e] hover:bg-blue-600 text-surface-200 hover:text-white transition-colors cursor-pointer border border-white/5 font-semibold text-[11px] flex items-center gap-0.5"
                  title="Add space"
                >
                  <Space className="w-3 h-3" />
                  <span className="hidden sm:inline">Space</span>
                </button>
                <button
                  type="button"
                  onClick={handleRepeatLast}
                  disabled={!recognition.recognizedText}
                  className="px-2 py-1 rounded-lg bg-[#22252e] hover:bg-blue-600 disabled:opacity-30 text-surface-200 hover:text-white transition-colors cursor-pointer border border-white/5 font-mono text-[11px] font-bold"
                  title="Repeat last letter (e.g. OO in MOON)"
                >
                  2x
                </button>
                <button
                  type="button"
                  onClick={handleDeleteChar}
                  disabled={!recognition.recognizedText}
                  className="p-1.5 rounded-lg bg-[#22252e] hover:bg-rose-600 disabled:opacity-30 text-surface-200 hover:text-white transition-colors cursor-pointer border border-white/5"
                  title="Backspace"
                >
                  <Delete className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleSendSignToCall}
                  disabled={!recognition.recognizedText}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer shadow"
                  title="Send to Partner & Speak"
                >
                  <Send className="w-3 h-3" />
                  <span>Send</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearBuffer}
                  disabled={!recognition.recognizedText}
                  className="p-1.5 rounded-lg bg-[#22252e] hover:bg-surface-700 disabled:opacity-30 text-surface-400 hover:text-rose-300 transition-colors cursor-pointer border border-white/5"
                  title="Clear buffer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsAssistiveCollapsed(!isAssistiveCollapsed)}
                  className="p-1.5 rounded-lg bg-[#1b1d24] hover:bg-[#282b35] text-surface-400 hover:text-white transition-colors cursor-pointer"
                  title={isAssistiveCollapsed ? 'Expand suggestions' : 'Collapse suggestions'}
                >
                  {isAssistiveCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Word Suggestions Chips (Directly on Main Screen) */}
            {!isAssistiveCollapsed && (
              <div className="space-y-1.5 pt-1 border-t border-white/10">
                {recognition.suggestions && recognition.suggestions.length > 0 ? (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-brand-400 font-bold flex items-center gap-1 uppercase tracking-wider shrink-0">
                      <Sparkles className="w-3 h-3 text-yellow-300" />
                      Suggestions:
                    </span>
                    {recognition.suggestions.map((word) => (
                      <button
                        key={word}
                        type="button"
                        onClick={() => handleSelectSuggestion(word)}
                        className="px-2.5 py-1 rounded-full bg-blue-950/70 hover:bg-blue-600 text-blue-200 hover:text-white text-xs font-semibold border border-blue-500/30 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-surface-400 font-bold uppercase tracking-wider shrink-0">
                      Quick Signs:
                    </span>
                    {['HELLO', 'THANK YOU', 'YES', 'NO', 'PLEASE', 'HELP', 'SORRY'].map((word) => (
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
                        className="px-2 py-0.5 rounded-full bg-[#1c1f27] hover:bg-blue-600 hover:text-white text-[11px] font-semibold text-surface-300 border border-white/5 transition-all cursor-pointer"
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* WHATSAPP CALL FLOATING BOTTOM CONTROL PILL */}
      <div className="fixed bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
        <div className="flex items-center gap-2.5 sm:gap-3.5 bg-[#14161f]/95 border border-white/15 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-2xl backdrop-blur-2xl">
          {/* Mic Toggle */}
          <button
            type="button"
            onClick={toggleMicrophone}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-md ${
              isMicEnabled
                ? 'bg-[#22252e] hover:bg-[#2d313d] text-white border border-white/10'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/50'
            }`}
            title={isMicEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {isMicEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* Camera Toggle */}
          <button
            type="button"
            onClick={toggleCamera}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-md ${
              isCameraEnabled
                ? 'bg-[#22252e] hover:bg-[#2d313d] text-white border border-white/10'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/50'
            }`}
            title={isCameraEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {isCameraEnabled ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Sign AI Quick Toggle */}
          <button
            type="button"
            onClick={toggleAI}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-md ${
              aiState === 'active'
                ? 'bg-gradient-to-tr from-blue-600 to-indigo-500 text-white ring-2 ring-blue-400/40 shadow-blue-900/50'
                : 'bg-[#22252e] hover:bg-[#2d313d] text-surface-400 border border-white/10'
            }`}
            title={aiState === 'active' ? 'Sign Language AI Active' : 'Enable Sign AI'}
          >
            <Sparkles className="w-5 h-5" />
          </button>

          {/* Overlay Chat Toggle with Unread Badge */}
          <button
            type="button"
            onClick={openChatDrawer}
            className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-md ${
              isChatDrawerOpen
                ? 'bg-blue-600 text-white'
                : 'bg-[#22252e] hover:bg-[#2d313d] text-white border border-white/10'
            }`}
            title="Open In-Call Chat"
          >
            <MessageCircle className="w-5 h-5" />
            {unreadCount > 0 && !isChatDrawerOpen && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-[#14161f] animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Screen Share */}
          <button
            type="button"
            onClick={() => {
              setIsScreenSharing(!isScreenSharing);
              showToast({
                type: 'info',
                title: 'Screen Sharing',
                message: !isScreenSharing ? 'Screen share activated.' : 'Screen sharing stopped.',
              });
            }}
            className={`hidden sm:flex w-11 h-11 sm:w-12 sm:h-12 rounded-full items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-md ${
              isScreenSharing
                ? 'bg-emerald-600 text-white'
                : 'bg-[#22252e] hover:bg-[#2d313d] text-white border border-white/10'
            }`}
            title="Share Screen"
          >
            <Share2 className="w-5 h-5" />
          </button>

          {/* Accordion Settings Toggle */}
          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#22252e] hover:bg-[#2d313d] text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer border border-white/10 shadow-md"
            title="Call Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* End Call Button (Prominent Red WhatsApp Style) */}
          <button
            type="button"
            onClick={handleEndCall}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-xl shadow-rose-600/40 transition-transform hover:scale-105 active:scale-95 cursor-pointer ml-1"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        </div>
      </div>

      {/* OVERLAY SLIDE-OUT CHAT DRAWER (WHATSAPP CALL STYLE - MOBILE FRIENDLY) */}
      {isChatDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop on mobile - clicking immediately closes drawer */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm sm:bg-black/40 transition-opacity"
            onClick={() => setIsChatDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-out Drawer Container */}
          <aside
            className="relative w-full sm:w-96 bg-[#13151c]/98 backdrop-blur-2xl border-l border-white/10 h-full shadow-2xl z-10 flex flex-col animate-slideInRight"
            aria-label="In-Call Chat"
          >
            {/* Mobile swipe-down pull bar */}
            <div
              className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mt-2.5 mb-1 sm:hidden cursor-pointer"
              onClick={() => setIsChatDrawerOpen(false)}
              title="Tap to close"
            />

            {/* Drawer Header with large, prominent close button */}
            <div className="p-3.5 sm:p-4 border-b border-white/10 flex items-center justify-between bg-[#171a22] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">In-Call Messages</h3>
                  <p className="text-[10px] text-surface-400">{effectivePeerCount}/4 in room • WebRTC Active</p>
                </div>
              </div>

              {/* Large touch-friendly Close button */}
              <button
                type="button"
                onClick={() => setIsChatDrawerOpen(false)}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-rose-600 text-surface-200 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 font-bold text-xs"
                title="Close chat drawer"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>
            </div>

            {/* Chat Messages List (WhatsApp Bubbles with smooth touch scrolling) */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar text-xs overscroll-contain pb-24 touch-pan-y">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-2xl leading-relaxed max-w-[85%] shadow-sm ${
                    msg.sender === 'system'
                      ? 'bg-[#1e212b] border border-blue-500/20 text-[#a0a5b2] mx-auto text-center text-[11px]'
                      : msg.sender === 'you'
                      ? 'bg-blue-600 text-white ml-auto rounded-tr-xs'
                      : 'bg-[#20232c] text-white mr-auto rounded-tl-xs border border-white/10'
                  }`}
                >
                  <p className="break-words">{msg.text}</p>
                  <span className="text-[10px] text-surface-400 block mt-1 text-right">{msg.time}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-[#171a22] shrink-0">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type a message to partner..."
                  className="w-full bg-[#0d0f14] border border-white/10 rounded-full px-4 py-2.5 text-xs text-white placeholder-surface-500 focus:outline-none focus:border-blue-500 pr-10"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="absolute right-2 p-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 transition-colors cursor-pointer"
                  title="Send message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}

      {/* ACCORDION SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#14161f] border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Call Settings</h3>
                  <p className="text-xs text-surface-400">Audio, Video, AI & Connection Options</p>
                </div>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1.5 rounded-full text-surface-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Accordion Tabs */}
            <div className="space-y-2.5 text-xs">
              {/* Accordion 1: Audio & Voice */}
              <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#1a1d27]">
                <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === 'audio' ? ('video' as any) : 'audio')}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 font-bold text-white text-xs">
                    <Mic className="w-4 h-4 text-blue-400" />
                    <span>Audio & Speech Synthesis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-surface-400 font-semibold">
                      {isMicEnabled ? 'Mic ON' : 'Muted'}
                    </span>
                    {activeAccordion === 'audio' ? <ChevronUp className="w-4 h-4 text-surface-400" /> : <ChevronDown className="w-4 h-4 text-surface-400" />}
                  </div>
                </button>

                {activeAccordion === 'audio' && (
                  <div className="p-3.5 border-t border-white/5 space-y-3 bg-[#13151e]">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1b1e29]">
                      <span>Microphone Status</span>
                      <button
                        type="button"
                        onClick={toggleMicrophone}
                        className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer ${
                          isMicEnabled ? 'bg-emerald-600/30 text-emerald-300' : 'bg-rose-600/30 text-rose-300'
                        }`}
                      >
                        {isMicEnabled ? 'Active' : 'Muted'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1b1e29]">
                      <div>
                        <span className="block font-semibold">Auto-Speak Partner Signs</span>
                        <span className="text-[10px] text-surface-400">Vocalize incoming signs via speech synthesis</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAutoSpeakEnabled(!isAutoSpeakEnabled)}
                        className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer ${
                          isAutoSpeakEnabled ? 'bg-emerald-600/30 text-emerald-300' : 'bg-surface-700 text-surface-400'
                        }`}
                      >
                        {isAutoSpeakEnabled ? 'ON' : 'OFF'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1b1e29]">
                      <div>
                        <span className="block font-semibold">Voice Subtitles (Speech-to-Text)</span>
                        <span className="text-[10px] text-surface-400">Transcribe voice into captions for partner</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsListeningSpeech(!isListeningSpeech)}
                        className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer ${
                          isListeningSpeech ? 'bg-blue-600/30 text-blue-300' : 'bg-surface-700 text-surface-400'
                        }`}
                      >
                        {isListeningSpeech ? 'Active' : 'Off'}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.speechSynthesis) {
                          window.speechSynthesis.cancel();
                          const u = new SpeechSynthesisUtterance('SignMate voice synthesis audio is working correctly.');
                          window.speechSynthesis.speak(u);
                        }
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-[#222532] hover:bg-[#2b2f3f] text-surface-200 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>Test Speech Synthesis Audio</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Accordion 2: Video & Camera */}
              <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#1a1d27]">
                <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === 'video' ? ('ai' as any) : 'video')}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 font-bold text-white text-xs">
                    <VideoIcon className="w-4 h-4 text-emerald-400" />
                    <span>Video & Camera</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-surface-400 font-semibold">
                      {isCameraEnabled ? 'Camera Active' : 'Camera Off'}
                    </span>
                    {activeAccordion === 'video' ? <ChevronUp className="w-4 h-4 text-surface-400" /> : <ChevronDown className="w-4 h-4 text-surface-400" />}
                  </div>
                </button>

                {activeAccordion === 'video' && (
                  <div className="p-3.5 border-t border-white/5 space-y-3 bg-[#13151e]">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1b1e29]">
                      <span>Camera Stream</span>
                      <button
                        type="button"
                        onClick={toggleCamera}
                        className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer ${
                          isCameraEnabled ? 'bg-emerald-600/30 text-emerald-300' : 'bg-rose-600/30 text-rose-300'
                        }`}
                      >
                        {isCameraEnabled ? 'Turn Off' : 'Turn On'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1b1e29]">
                      <span>Show Hand Skeleton Overlay</span>
                      <button
                        type="button"
                        onClick={() => setShowLandmarks(!showLandmarks)}
                        className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer ${
                          showLandmarks ? 'bg-blue-600/30 text-blue-300' : 'bg-surface-700 text-surface-400'
                        }`}
                      >
                        {showLandmarks ? 'Visible' : 'Hidden'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 3: Sign Language AI */}
              <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#1a1d27]">
                <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === 'ai' ? ('room' as any) : 'ai')}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 font-bold text-white text-xs">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span>Sign Language AI & Model</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-surface-400 font-semibold">
                      {aiState === 'active' ? 'Active' : 'Off'}
                    </span>
                    {activeAccordion === 'ai' ? <ChevronUp className="w-4 h-4 text-surface-400" /> : <ChevronDown className="w-4 h-4 text-surface-400" />}
                  </div>
                </button>

                {activeAccordion === 'ai' && (
                  <div className="p-3.5 border-t border-white/5 space-y-3 bg-[#13151e]">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1b1e29]">
                      <div>
                        <span className="block font-semibold">Detection Engine</span>
                        <span className="text-[10px] text-surface-400">
                          {detectionResult?.source === 'keras_model' ? 'FastAPI Keras Model' : 'Edge TensorFlow.js'}
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-blue-600/30 text-blue-300 font-bold text-xs">
                        {aiState === 'active' ? 'Active' : 'Standby'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#1b1e29] space-y-1">
                      <span className="font-semibold block">Continuous Hold & Repeat Features</span>
                      <p className="text-[11px] text-surface-400 leading-relaxed">
                        • Hold sign for ~1.2s to commit double letters (e.g. 'OO' in 'MOON').<br />
                        • Use the on-screen 2x button or backspace anytime.<br />
                        • Conversational word suggestions appear automatically on the main screen.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 4: Room & Connection */}
              <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#1a1d27]">
                <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === 'room' ? ('audio' as any) : 'room')}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 font-bold text-white text-xs">
                    <Activity className="w-4 h-4 text-purple-400" />
                    <span>Room & WebRTC Connection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-emerald-400 font-semibold uppercase">{webRtcStatus}</span>
                    {activeAccordion === 'room' ? <ChevronUp className="w-4 h-4 text-surface-400" /> : <ChevronDown className="w-4 h-4 text-surface-400" />}
                  </div>
                </button>

                {activeAccordion === 'room' && (
                  <div className="p-3.5 border-t border-white/5 space-y-3 bg-[#13151e]">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1b1e29]">
                      <span>Room Code</span>
                      <span className="font-mono font-bold text-white">{currentRoomId}</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1b1e29]">
                      <span>Room Capacity</span>
                      <span className="font-mono font-bold text-white">{effectivePeerCount} / 4 participants</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1b1e29]">
                      <span>Signaling Backbone</span>
                      <span className={`font-mono font-bold ${rtdbConnected ? 'text-amber-300' : 'text-surface-400'}`}>
                        {rtdbConnected ? 'Firebase RTDB Active' : 'Disconnected'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-lg"
              >
                Close Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ROOM FULL MODAL (Max 4 Participants Reached) */}
      {isRoomFull && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#161820] border border-rose-500/30 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Room is Full</h3>
              <p className="text-xs text-surface-300 leading-relaxed mt-2">
                This room has reached its maximum capacity of <strong>4 participants</strong>. Please wait for someone to leave or create a new room.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-colors cursor-pointer"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
