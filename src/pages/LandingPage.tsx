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
  Users2,
  Cpu,
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
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-12 pb-16 md:pt-20 md:pb-24 max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-900 border border-surface-700/80 text-xs text-brand-300 font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-brand-400" aria-hidden="true" />
          <span>Real-time Indian Sign Language (ISL) Video Platform</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-surface-50 leading-[1.15]">
          AI-Assisted Inclusive Communication
        </h1>

        {/* Concise explanation */}
        <p className="mt-5 text-base sm:text-lg text-surface-300 max-w-2xl mx-auto leading-relaxed">
          SignMate is an accessible communication platform bridging the gap between
          sign-language users and English speakers through real-time video, on-device gesture
          alphabet recognition, and contextual suggestions.
        </p>

        {/* Primary & Secondary Call to Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md mx-auto">
          <Button
            size="lg"
            variant="primary"
            onClick={handleGetStarted}
            icon={<ArrowRight className="w-4 h-4" />}
            className="w-full sm:w-auto text-sm sm:text-base font-semibold px-6"
          >
            Get Started
          </Button>

          <Button
            size="lg"
            variant="secondary"
            onClick={() => setIsJoinModalOpen(true)}
            icon={<Hash className="w-4 h-4 text-brand-400" />}
            className="w-full sm:w-auto text-sm sm:text-base font-semibold px-6"
          >
            Join a Room
          </Button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <div className="p-5 rounded-xl bg-surface-900/60 border border-surface-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Users2 className="w-4 h-4" aria-hidden="true" />
            </div>
            <h3 className="text-sm font-semibold text-surface-100">Small Group Rooms</h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              Designed specifically for focused, accessible meetings of 3–5 participants with low-latency video and audio.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-surface-900/60 border border-surface-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Cpu className="w-4 h-4" aria-hidden="true" />
            </div>
            <h3 className="text-sm font-semibold text-surface-100">ISL Alphabet Recognition</h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              Powered by the trained MobileNetV3 model achieving ~97% accuracy across 27 classes (background and A–Z).
            </p>
          </div>

          <div className="p-5 rounded-xl bg-surface-900/60 border border-surface-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
            </div>
            <h3 className="text-sm font-semibold text-surface-100">Contextual Word Predictions</h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              Intelligent completions turn spelled characters into whole words and spoken phrases in real time.
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
