import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { JoinRoomModal } from '../rooms/JoinRoomModal';
import { CreateRoomModal } from '../rooms/CreateRoomModal';
import { useAuth } from '../hooks/useAuth';
import {
  ArrowRight,
  Hash,
  Sparkles,
  Users,
  Video,
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
    <div className="flex flex-col flex-1 select-none">
      {/* Minimalist Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28 max-w-4xl mx-auto text-center">
        {/* Subtle Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/40 border border-blue-500/30 text-xs text-blue-300 font-medium mb-6 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" aria-hidden="true" />
          <span>Real-Time Sign Language Video Calls</span>
        </div>

        {/* Clean Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]">
          Inclusive Video Communication
        </h1>

        {/* Minimalist Subtitle */}
        <p className="mt-5 text-sm sm:text-base text-surface-300 max-w-xl mx-auto leading-relaxed">
          Connect with anyone through real-time sign language translation,
          live subtitles, and seamless group video calls.
        </p>

        {/* Call to Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
          <Button
            size="lg"
            variant="primary"
            onClick={handleGetStarted}
            icon={<ArrowRight className="w-4 h-4" />}
            className="w-full sm:w-auto text-sm font-semibold px-6 shadow-lg shadow-blue-600/25"
          >
            Get Started
          </Button>

          <Button
            size="lg"
            variant="secondary"
            onClick={() => setIsJoinModalOpen(true)}
            icon={<Hash className="w-4 h-4 text-blue-400" />}
            className="w-full sm:w-auto text-sm font-semibold px-6"
          >
            Join Call
          </Button>
        </div>

        {/* Minimalist 3-Card Feature Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <div className="p-5 rounded-2xl bg-[#14161f]/80 border border-white/10 backdrop-blur-sm space-y-2.5 hover:border-white/20 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" aria-hidden="true" />
            </div>
            <h3 className="text-sm font-semibold text-white">Group Video Calls</h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              Low-latency video calls for up to 4 participants with optimized layout.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#14161f]/80 border border-white/10 backdrop-blur-sm space-y-2.5 hover:border-white/20 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
            </div>
            <h3 className="text-sm font-semibold text-white">Live Sign Language AI</h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              Real-time alphabet gesture translation and instant word suggestions directly on screen.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#14161f]/80 border border-white/10 backdrop-blur-sm space-y-2.5 hover:border-white/20 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-purple-600/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Video className="w-4 h-4" aria-hidden="true" />
            </div>
            <h3 className="text-sm font-semibold text-white">Subtitles & Voice</h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              Live partner subtitles, automatic speech-to-text, and voice synthesis audio.
            </p>
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
