import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JoinRoomModal } from '../rooms/JoinRoomModal';
import { CreateRoomModal } from '../rooms/CreateRoomModal';
import { useAuth } from '../hooks/useAuth';
import {
  ArrowRight,
  Hash,
  Sparkles,
  Users,
  Shield,
  Zap,
  Volume2,
  CheckCircle2,
  Lock,
  Layers,
  Activity,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="flex flex-col flex-1 select-none bg-[#121824] text-[#F8FAFC]">
      {/* 1. HERO SECTION */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-28 md:pb-24 max-w-5xl mx-auto text-center">
        {/* Subtle Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1B2436] border border-[#1e293b] text-xs text-[#38bdf8] font-medium mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#0284C7] animate-pulse" aria-hidden="true" />
          <span>On-Device Gesture Recognition & WebRTC Video</span>
        </div>

        {/* Clean Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F8FAFC] leading-[1.12]">
          Inclusive Video Communication
        </h1>

        {/* Minimalist Subtitle */}
        <p className="mt-6 text-sm sm:text-base md:text-lg text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
          Connect with anyone through real-time sign language translation,
          bidirectional live subtitles, and low-latency accessible group video calls.
        </p>

        {/* Call to Actions */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
          <button
            type="button"
            onClick={handleGetStarted}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#0284C7]/20 transition-all active:scale-[0.98] cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsJoinModalOpen(true)}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#1B2436] hover:bg-[#1e293b] text-[#F8FAFC] border border-[#1e293b] font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Hash className="w-4 h-4 text-[#38bdf8]" />
            <span>Join Call</span>
          </button>
        </div>

        {/* Minimal Tech Metrics Strip */}
        <div className="mt-14 pt-8 border-t border-[#1e293b] grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3">
            <div className="text-xl sm:text-2xl font-bold text-[#F8FAFC] font-mono">&lt; 80ms</div>
            <div className="text-xs text-[#94A3B8] mt-1">Gesture Latency</div>
          </div>
          <div className="p-3">
            <div className="text-xl sm:text-2xl font-bold text-[#38bdf8] font-mono">100%</div>
            <div className="text-xs text-[#94A3B8] mt-1">Client Privacy</div>
          </div>
          <div className="p-3">
            <div className="text-xl sm:text-2xl font-bold text-[#F8FAFC] font-mono">21-Point</div>
            <div className="text-xs text-[#94A3B8] mt-1">Hand Landmarks</div>
          </div>
          <div className="p-3">
            <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono">WebRTC</div>
            <div className="text-xs text-[#94A3B8] mt-1">Multi-Party Mesh</div>
          </div>
        </div>
      </section>

      {/* 2. CORE CAPABILITIES (3-Card Minimalist Grid) */}
      <section id="features" className="px-4 sm:px-6 lg:px-8 py-16 max-w-6xl mx-auto w-full border-t border-[#1e293b]">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs uppercase font-bold tracking-widest text-[#0284C7] mb-2">
            Key Capabilities
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC]">
            Designed for Real-Time Interaction
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#1B2436] border border-[#1e293b] space-y-3.5 hover:border-[#0284C7]/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#0284C7]/15 border border-[#0284C7]/30 flex items-center justify-center text-[#38bdf8]">
              <Users className="w-5 h-5" aria-hidden="true" />
            </div>
            <h4 className="text-base font-semibold text-[#F8FAFC]">Group Video Calls</h4>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Ultra-low latency multi-party video conferencing with automatic grid layout optimization and signer mirror-mode support.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#1B2436] border border-[#1e293b] space-y-3.5 hover:border-[#0284C7]/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" aria-hidden="true" />
            </div>
            <h4 className="text-base font-semibold text-[#F8FAFC]">Live Sign Language AI</h4>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Real-time alphabet gesture classification with instant dictionary matching and predictive word suggestions directly in the video frame.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#1B2436] border border-[#1e293b] space-y-3.5 hover:border-[#0284C7]/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Volume2 className="w-5 h-5" aria-hidden="true" />
            </div>
            <h4 className="text-base font-semibold text-[#F8FAFC]">Subtitles & Voice Synthesis</h4>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Synchronized partner subtitles, speech-to-text transcription, and voice generation for seamless bidirectional conversations.
            </p>
          </div>
        </div>
      </section>

      {/* 3. WHY SIGNMATE SECTION */}
      <section id="why-signmate" className="px-4 sm:px-6 lg:px-8 py-20 max-w-6xl mx-auto w-full border-t border-[#1e293b]">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1B2436] border border-[#1e293b] text-[11px] font-semibold text-[#38bdf8] uppercase tracking-wider mb-3">
            <Activity className="w-3.5 h-3.5" />
            <span>Architecture & Advantage</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
            Why SignMate
          </h2>
          <p className="mt-3 text-sm text-[#94A3B8] leading-relaxed">
            Engineered from first principles to overcome the speed, privacy, and UX bottlenecks of conventional assistive video tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="p-7 rounded-2xl bg-[#1B2436] border border-[#1e293b] space-y-4 hover:border-[#0284C7]/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0284C7]/15 border border-[#0284C7]/30 flex items-center justify-center text-[#38bdf8]">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F8FAFC]">100% In-Browser Privacy</h3>
                <span className="text-[11px] text-[#94A3B8]">Zero External Video Streaming</span>
              </div>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Camera feeds are processed strictly inside your browser through MediaPipe hand landmark tracking and WebAssembly. No biometric data or video streams ever touch external AI servers.
            </p>
            <ul className="space-y-2 text-xs text-[#F8FAFC]/90 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#38bdf8]" />
                <span>Local 21-point 3D landmark tensor generation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#38bdf8]" />
                <span>Zero server-side image caching or recording</span>
              </li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="p-7 rounded-2xl bg-[#1B2436] border border-[#1e293b] space-y-4 hover:border-[#0284C7]/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F8FAFC]">Instant Bidirectional Translation</h3>
                <span className="text-[11px] text-[#94A3B8]">Dual-Flow Communication</span>
              </div>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Signers can sign freely while hearing participants receive instant speech audio and live subtitles. Conversely, spoken words are converted into readable captions with zero manual configuration.
            </p>
            <ul className="space-y-2 text-xs text-[#F8FAFC]/90 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Sub-80 millisecond gesture inference cycle</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Integrated Web Speech synthesis engine</span>
              </li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="p-7 rounded-2xl bg-[#1B2436] border border-[#1e293b] space-y-4 hover:border-[#0284C7]/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F8FAFC]">Engineered for Sign Dynamics</h3>
                <span className="text-[11px] text-[#94A3B8]">Mirror Calibration & Gesture Stabilization</span>
              </div>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Designed specifically for signing ergonomics: mirrored view transforms coordinates accurately, video frames are never obscured by menus, and in-call subtitles adapt dynamically to participants.
            </p>
            <ul className="space-y-2 text-xs text-[#F8FAFC]/90 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>Natural mirror perspective for comfortable signing</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>Adaptive video layout fits active talkers & signers</span>
              </li>
            </ul>
          </div>

          {/* Card 4 */}
          <div className="p-7 rounded-2xl bg-[#1B2436] border border-[#1e293b] space-y-4 hover:border-[#0284C7]/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F8FAFC]">WCAG AAA Contrast Standard</h3>
                <span className="text-[11px] text-[#94A3B8]">High Visibility Dark Environment</span>
              </div>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              The high-contrast non-glare palette prevents eye strain during extended signing sessions, with sky-blue active cues and large accessible tap targets built into every workflow.
            </p>
            <ul className="space-y-2 text-xs text-[#F8FAFC]/90 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>Non-glare #121824 background with #F8FAFC text</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>100% keyboard navigable with high-visibility rings</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 max-w-5xl mx-auto w-full border-t border-[#1e293b]">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-xs uppercase font-bold tracking-widest text-[#0284C7] mb-2">
            Workflow
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC]">
            Connect in Three Simple Steps
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-6 rounded-2xl bg-[#1B2436] border border-[#1e293b] space-y-3">
            <div className="w-8 h-8 rounded-full bg-[#0284C7] text-white font-mono font-bold text-sm flex items-center justify-center mx-auto">
              1
            </div>
            <h4 className="text-sm font-semibold text-[#F8FAFC]">Launch or Join Room</h4>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Create an instant meeting or enter with a room code. No plugins or downloads required.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#1B2436] border border-[#1e293b] space-y-3">
            <div className="w-8 h-8 rounded-full bg-[#0284C7] text-white font-mono font-bold text-sm flex items-center justify-center mx-auto">
              2
            </div>
            <h4 className="text-sm font-semibold text-[#F8FAFC]">Sign or Speak Naturally</h4>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              The camera and microphone track gestures and audio in parallel with sub-pixel precision.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#1B2436] border border-[#1e293b] space-y-3">
            <div className="w-8 h-8 rounded-full bg-[#0284C7] text-white font-mono font-bold text-sm flex items-center justify-center mx-auto">
              3
            </div>
            <h4 className="text-sm font-semibold text-[#F8FAFC]">Real-Time Dual Captions</h4>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Both parties communicate effortlessly via translated captions and synthesized audio.
            </p>
          </div>
        </div>
      </section>

      {/* 5. MINIMAL CTA */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 max-w-4xl mx-auto w-full text-center border-t border-[#1e293b]">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#1B2436] border border-[#1e293b] space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC]">
            Ready to Experience Accessible Video Calls?
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-md mx-auto leading-relaxed">
            Start communicating today with zero setup and full in-browser gesture intelligence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleGetStarted}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsJoinModalOpen(true)}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#121824] hover:bg-[#1B2436] text-[#F8FAFC] border border-[#1e293b] font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Hash className="w-4 h-4 text-[#38bdf8]" />
              <span>Enter Room Code</span>
            </button>
          </div>
        </div>
      </section>

      {/* Accessible Modals */}
      <JoinRoomModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
