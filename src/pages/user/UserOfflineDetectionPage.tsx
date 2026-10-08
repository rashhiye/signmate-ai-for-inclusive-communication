import React, { useState, useEffect, useRef } from 'react';
import { UserSidebar } from '../../components/user/UserSidebar';
import { useMediaDevices } from '../../hooks/useMediaDevices';
import { useToast } from '../../hooks/useToast';
import {
  Camera,
  Mic,
  MicOff,
  Volume2,
  Trash2,
  Bot,
  User,
  Delete,
  Space,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { handSignDetector, type HandDetectionResult } from '../../ai/handSignDetector';
import { HandLandmarkOverlay } from '../../components/ai/HandLandmarkOverlay';
import { dictionaryService } from '../../services/dictionaryService';

export const UserOfflineDetectionPage: React.FC = () => {
  const { localStream, startLocalMedia, stopLocalMedia, isCameraEnabled, deviceError } = useMediaDevices();
  const { showToast } = useToast();

  const [recognizedSignText, setRecognizedSignText] = useState('');
  const [wordSuggestions, setWordSuggestions] = useState<string[]>([]);
  const [currentGesture, setCurrentGesture] = useState<string>('');
  const [detectionResult, setDetectionResult] = useState<HandDetectionResult | null>(null);
  const [isListeningSpeech, setIsListeningSpeech] = useState(false);
  const [spokenCaptions, setSpokenCaptions] = useState<string[]>(['Hi! How are you doing today?']);
  const [speechInputBuffer, setSpeechInputBuffer] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Attach local stream to videoRef and ensure playback
  useEffect(() => {
    if (videoRef.current && localStream) {
      if (videoRef.current.srcObject !== localStream) {
        videoRef.current.srcObject = localStream;
      }
      videoRef.current.play().catch((err) => {
        console.warn('[SignMate] videoRef play caught:', err);
      });
    }
  }, [localStream, isCameraEnabled]);

  // Real-time hand sign detection loop
  useEffect(() => {
    if (!isCameraEnabled || !localStream) {
      setDetectionResult(null);
      setCurrentGesture('');
      return;
    }

    let isMounted = true;
    let candidateLetter = '';
    let stableCount = 0;
    let lastCommittedLetter = '';
    let releaseCount = 0;

    const intervalId = window.setInterval(async () => {
      if (!videoRef.current || !isMounted) return;
      try {
        const result = await handSignDetector.detectSign(videoRef.current);
        if (!isMounted) return;

        setDetectionResult(result);

        // Detect hand release or neutral state to allow signing the same letter again
        if (!result.hasHand || !result.letter || result.confidence < 0.70) {
          releaseCount++;
          // When hand is dropped, pulled away, or relaxed for 2 frames (~360ms), reset committed letter
          if (releaseCount >= 2) {
            lastCommittedLetter = '';
            candidateLetter = '';
            stableCount = 0;
          }
        } else {
          releaseCount = 0;
        }

        if (result.hasHand && result.letter) {
          setCurrentGesture(result.letter);

          // Anti-spam rule: If user is STILL holding the exact same letter that was already committed,
          // do NOT append it again.
          if (result.letter === lastCommittedLetter) {
            candidateLetter = '';
            stableCount = 0;
            return;
          }

          // Append letter when accuracy is >= 70% (0.70) and held stable for 2 frames (~360ms)
          if (result.confidence >= 0.70) {
            if (result.letter === candidateLetter) {
              stableCount++;
              if (stableCount >= 2) {
                const letter = result.letter;
                setRecognizedSignText((prev) => {
                  const next = prev + letter;
                  const words = next.split(/\s+/);
                  const lastWord = (words[words.length - 1] || '').toUpperCase();
                  setWordSuggestions(lastWord ? dictionaryService.getWordSuggestions(lastWord, 8) : []);
                  return next;
                });
                lastCommittedLetter = letter;
                stableCount = 0;
                candidateLetter = '';
              }
            } else {
              candidateLetter = result.letter;
              stableCount = 1;
            }
          } else {
            // Under 70% accuracy - do not print
            candidateLetter = '';
            stableCount = 0;
          }
        } else {
          setCurrentGesture('');
          candidateLetter = '';
          stableCount = 0;
        }
      } catch {
        // continue loop
      }
    }, 180);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [isCameraEnabled, localStream]);

  useEffect(() => {
    startLocalMedia();
    return () => {
      stopLocalMedia();
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
    };
  }, [startLocalMedia, stopLocalMedia]);

  // Setup Web Speech API for Hearing person's voice to text
  const toggleSpeechListener = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast({
        type: 'warning',
        title: 'Speech Recognition Unavailable',
        message: 'Your browser does not support Web Speech Recognition. Simulated input active.',
      });
      setIsListeningSpeech((prev) => !prev);
      return;
    }

    if (isListeningSpeech) {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      setIsListeningSpeech(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setSpeechInputBuffer(currentTranscript);
          if (event.results[event.results.length - 1].isFinal) {
            setSpokenCaptions((prev) => [...prev, currentTranscript]);
            setSpeechInputBuffer('');
          }
        };

        recognition.onerror = () => {
          setIsListeningSpeech(false);
        };

        recognition.onend = () => {
          setIsListeningSpeech(false);
        };

        recognition.start();
        speechRecognitionRef.current = recognition;
        setIsListeningSpeech(true);
      } catch {
        setIsListeningSpeech(false);
      }
    }
  };

  const handleSpeakSigns = () => {
    if (!window.speechSynthesis || !recognizedSignText) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(recognizedSignText);
    window.speechSynthesis.speak(utterance);
    showToast({
      type: 'info',
      title: 'Speech Output',
      message: `Spoken aloud: "${recognizedSignText}"`,
    });
  };

  const appendLetter = (char: string) => {
    setCurrentGesture(char);
    setRecognizedSignText((prev) => {
      const next = prev + char.toUpperCase();
      const words = next.split(/\s+/);
      const lastWord = (words[words.length - 1] || '').toUpperCase();
      setWordSuggestions(lastWord ? dictionaryService.getWordSuggestions(lastWord, 8) : []);
      return next;
    });
  };

  const selectSuggestion = (word: string) => {
    setRecognizedSignText((prev) => {
      const trimmed = prev.trimEnd();
      const lastSpaceIndex = trimmed.lastIndexOf(' ');
      const prefix = lastSpaceIndex >= 0 ? trimmed.substring(0, lastSpaceIndex + 1) : '';
      const updated = `${prefix}${word.toUpperCase()} `;
      setWordSuggestions([]);
      return updated;
    });
  };

  const handleSpace = () => {
    setRecognizedSignText((prev) => (prev ? prev + ' ' : ''));
    setWordSuggestions([]);
  };

  const handleBackspace = () => {
    setRecognizedSignText((prev) => {
      const next = prev.slice(0, -1);
      const words = next.split(/\s+/);
      const lastWord = (words[words.length - 1] || '').toUpperCase();
      setWordSuggestions(lastWord ? dictionaryService.getWordSuggestions(lastWord, 8) : []);
      return next;
    });
  };

  const clearSigns = () => {
    setRecognizedSignText('');
    setCurrentGesture('');
    setWordSuggestions([]);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-[#0d0f12]">
      <div className="hidden md:block">
        <UserSidebar />
      </div>

      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="border-b border-white/5 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-brand-950/80 border border-brand-700/60 text-[10px] font-bold text-brand-300 uppercase">
                Sign Language Detection
              </span>
              <span className="text-xs text-emerald-400 font-semibold">• Face-to-Face Ready</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-white mt-1">
              Dual-Mode Offline Detection Station
            </h1>
            <p className="text-xs text-[#8e94a0] mt-0.5">
              Real-time sign language translation and speech captions for seamless face-to-face communication.
            </p>
          </div>
        </div>

        {/* Split Screen Interaction Arena */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* LEFT: Deaf / Mute User Station (Sign to Text & Speech) */}
          <div className="bg-[#141720] border border-white/5 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-brand-500/20 text-brand-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Sign Language Station
                  </h3>
                  <span className="text-[10px] text-[#8e94a0]">Camera Sign Detection</span>
                </div>
              </div>

              {currentGesture ? (
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono font-bold border transition-all ${
                      (detectionResult?.confidence || 0) >= 0.85
                        ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 animate-pulse'
                        : 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                    }`}
                  >
                    Gesture: [{currentGesture}] {detectionResult?.confidence ? `${Math.round(detectionResult.confidence * 100)}%` : ''}
                    {(detectionResult?.confidence || 0) >= 0.85 ? ' ✓ Ready' : ' (Hold for ≥85%)'}
                  </span>
                </div>
              ) : (
                <span className="text-[10px] text-[#777] font-medium">Show hand to camera</span>
              )}
            </div>

            {/* Video Viewport with landmark guide */}
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-white/10 flex items-center justify-center">
              <video
                ref={(el) => {
                  videoRef.current = el;
                  if (el && localStream && el.srcObject !== localStream) {
                    el.srcObject = localStream;
                    el.play().catch(() => {});
                  }
                }}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover scale-x-[-1] ${
                  localStream && isCameraEnabled ? 'block' : 'hidden'
                }`}
              />
              {(!localStream || !isCameraEnabled) && (
                <div className="text-center p-4 z-10">
                  <Camera className="w-10 h-10 text-surface-600 mx-auto mb-2" />
                  <p className="text-xs text-white font-medium">{deviceError || 'Camera feed inactive'}</p>
                  <button
                    type="button"
                    onClick={async () => {
                      const s = await startLocalMedia();
                      if (s) {
                        showToast({
                          type: 'success',
                          title: 'Camera Enabled',
                          message: 'Webcam ready for offline sign detection.',
                        });
                      }
                    }}
                    className="mt-2.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                  >
                    Enable Camera
                  </button>
                </div>
              )}

              {/* Real Hand Landmark & Skeletal Overlay */}
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

              {/* In-video Model Engine Status Badge */}
              <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-mono border border-white/10 text-brand-300 flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                <span>
                  {detectionResult?.source === 'keras_model'
                    ? 'MobileNetV3 .keras (Neural Net)'
                    : 'MediaPipe 3D Landmark Engine'}
                </span>
              </div>

              {/* Hand Detection Indicator */}
              <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-mono border border-white/10">
                {detectionResult?.hasHand ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                    Hand Tracked
                  </span>
                ) : (
                  <span className="text-surface-400">Searching Hand...</span>
                )}
              </div>
            </div>

            {/* Quick Virtual Sign Palette (A–Z) */}
            <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-[11px] text-[#8e94a0]">
                <span className="font-bold uppercase tracking-wider">Quick Sign Palette:</span>
                <span>Click to append or hold sign before camera</span>
              </div>
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto custom-scrollbar">
                {['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'].map((letter) => (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => appendLetter(letter)}
                    className={`w-7 h-7 rounded text-xs font-mono font-bold transition-all ${
                      currentGesture === letter
                        ? 'bg-brand-500 text-white scale-110 shadow-lg'
                        : 'bg-white/5 hover:bg-white/15 text-surface-200 border border-white/5'
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </div>

            {/* Accumulated Translation & Output Controls */}
            <div className="space-y-3">
              <div className="p-3.5 bg-black/50 border border-white/10 rounded-xl flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400 block mb-1">
                    Composed Message:
                  </span>
                  <div className="font-mono text-xl font-bold text-white tracking-wider break-words min-h-[28px]">
                    {recognizedSignText || <span className="text-surface-500 text-sm font-normal italic">Gestures appear here as you sign...</span>}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleSpace}
                    className="p-2.5 rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-200 transition-colors flex items-center gap-1 text-xs"
                    title="Insert Space"
                  >
                    <Space className="w-4 h-4" />
                    <span className="hidden sm:inline">Space</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleBackspace}
                    disabled={!recognizedSignText}
                    className="p-2.5 rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-200 disabled:opacity-40 transition-colors"
                    title="Backspace"
                  >
                    <Delete className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleSpeakSigns}
                    disabled={!recognizedSignText}
                    className="p-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white disabled:opacity-40 transition-colors flex items-center gap-1 text-xs font-semibold"
                    title="Speak text aloud to hearing partner"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Speak</span>
                  </button>
                  <button
                    type="button"
                    onClick={clearSigns}
                    disabled={!recognizedSignText}
                    className="p-2.5 rounded-lg bg-surface-800 hover:bg-rose-900/40 text-surface-300 hover:text-rose-300 disabled:opacity-40 transition-colors"
                    title="Clear text"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Word Completion Chips from dictionary_compact.json */}
              {wordSuggestions.length > 0 && (
                <div className="p-3 bg-brand-950/40 border border-brand-500/20 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-brand-300 font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                    <span>Word Completions (Dictionary):</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {wordSuggestions.map((word) => (
                      <button
                        key={word}
                        type="button"
                        onClick={() => selectSuggestion(word)}
                        className="px-2.5 py-1 rounded-lg bg-blue-900/60 hover:bg-blue-600 text-blue-100 hover:text-white text-xs font-semibold border border-blue-400/30 transition-colors cursor-pointer select-none"
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Hearing Participant Station (Voice to Text Captions) */}
          <div className="bg-[#141720] border border-white/5 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Hearing Partner Voice Station
                  </h3>
                  <span className="text-[10px] text-[#8e94a0]">Live Speech to Captions</span>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleSpeechListener}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  isListeningSpeech
                    ? 'bg-rose-950/80 border border-rose-500/60 text-rose-300 animate-pulse'
                    : 'bg-blue-600/30 border border-blue-500/50 text-blue-300 hover:bg-blue-600 hover:text-white'
                }`}
              >
                {isListeningSpeech ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                <span>{isListeningSpeech ? 'Listening...' : 'Start Voice Listener'}</span>
              </button>
            </div>

            {/* Live Captions Stream View */}
            <div className="flex-1 min-h-[220px] bg-black/60 rounded-xl p-4 border border-white/5 flex flex-col justify-between overflow-hidden">
              <div className="space-y-2 overflow-y-auto custom-scrollbar max-h-[240px]">
                <span className="text-[10px] uppercase font-bold text-surface-500 tracking-wider block">
                  Live Captions for Deaf User:
                </span>
                {spokenCaptions.map((caption, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-surface-900 border border-white/5 text-xs text-white leading-relaxed">
                    "{caption}"
                  </div>
                ))}
                {speechInputBuffer && (
                  <div className="p-3 rounded-lg bg-surface-900/50 border border-dashed border-blue-500/40 text-xs text-blue-300 italic">
                    "{speechInputBuffer}..."
                  </div>
                )}
              </div>

              {/* Quick Spoken Reply Prompts */}
              <div className="pt-3 border-t border-white/5">
                <span className="text-[10px] text-[#888] font-bold uppercase block mb-1.5">
                  Quick Spoken Responses:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Yes, I understand.',
                    'No problem at all.',
                    'Could you repeat that gesture?',
                    'Nice to meet you!',
                  ].map((phrase) => (
                    <button
                      key={phrase}
                      type="button"
                      onClick={() => setSpokenCaptions((prev) => [...prev, phrase])}
                      className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-[11px] text-surface-200 border border-white/5 transition-colors"
                    >
                      {phrase}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Status indicator */}
            <div className="p-3 bg-black/40 border border-white/5 rounded-xl text-xs text-[#8e94a0] flex items-center justify-between">
              <span>Speech-to-Text Engine: Web Speech API</span>
              <button
                type="button"
                onClick={() => setSpokenCaptions([])}
                className="text-[11px] text-surface-400 hover:text-white"
              >
                Clear Captions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
