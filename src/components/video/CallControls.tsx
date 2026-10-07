import React from 'react';
import { Mic, MicOff, Video, VideoOff, Users, PhoneOff } from 'lucide-react';
import { AIControl } from '../ai/AIControl';
import type { AIState } from '../../types/ai';

interface CallControlsProps {
  isMicEnabled: boolean;
  isCameraEnabled: boolean;
  aiState: AIState;
  isAIPanelOpen: boolean;
  isParticipantsOpen: boolean;
  participantCount: number;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleAI: () => void;
  onToggleParticipants: () => void;
  onLeaveCall: () => void;
}

export const CallControls: React.FC<CallControlsProps> = ({
  isMicEnabled,
  isCameraEnabled,
  aiState,
  isAIPanelOpen,
  isParticipantsOpen,
  participantCount,
  onToggleMic,
  onToggleCamera,
  onToggleAI,
  onToggleParticipants,
  onLeaveCall,
}) => {
  return (
    <nav
      className="w-full bg-surface-900/95 border-t border-surface-800/90 py-3 px-3 sm:px-6 backdrop-blur-md z-30 shrink-0"
      aria-label="Video Call Controls"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
        {/* Microphone Toggle */}
        <button
          type="button"
          onClick={onToggleMic}
          className={`p-3 rounded-full transition-all duration-150 min-h-touch min-w-touch flex items-center justify-center focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:outline-none border shadow-sm ${
            isMicEnabled
              ? 'bg-surface-800 hover:bg-surface-700 text-surface-100 border-surface-700/80'
              : 'bg-rose-950/80 hover:bg-rose-900 active:bg-rose-800 text-rose-200 border-rose-700/70'
          }`}
          aria-pressed={isMicEnabled}
          aria-label={isMicEnabled ? 'Mute microphone' : 'Unmute microphone'}
          title={isMicEnabled ? 'Mute microphone (currently on)' : 'Unmute microphone (currently muted)'}
        >
          {isMicEnabled ? (
            <Mic className="w-5 h-5" aria-hidden="true" />
          ) : (
            <MicOff className="w-5 h-5 text-rose-300" aria-hidden="true" />
          )}
        </button>

        {/* Camera Toggle */}
        <button
          type="button"
          onClick={onToggleCamera}
          className={`p-3 rounded-full transition-all duration-150 min-h-touch min-w-touch flex items-center justify-center focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:outline-none border shadow-sm ${
            isCameraEnabled
              ? 'bg-surface-800 hover:bg-surface-700 text-surface-100 border-surface-700/80'
              : 'bg-rose-950/80 hover:bg-rose-900 active:bg-rose-800 text-rose-200 border-rose-700/70'
          }`}
          aria-pressed={isCameraEnabled}
          aria-label={isCameraEnabled ? 'Turn camera off' : 'Turn camera on'}
          title={isCameraEnabled ? 'Turn camera off (currently on)' : 'Turn camera on (currently off)'}
        >
          {isCameraEnabled ? (
            <Video className="w-5 h-5" aria-hidden="true" />
          ) : (
            <VideoOff className="w-5 h-5 text-rose-300" aria-hidden="true" />
          )}
        </button>

        {/* Compact AI Control: 🤖 AI / 🤖 AI ON */}
        <AIControl
          aiState={aiState}
          isPanelOpen={isAIPanelOpen}
          onToggleAI={onToggleAI}
        />

        {/* Participants Panel Toggle */}
        <button
          type="button"
          onClick={onToggleParticipants}
          className={`relative p-3 rounded-full transition-all duration-150 min-h-touch min-w-touch flex items-center justify-center focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:outline-none border shadow-sm ${
            isParticipantsOpen
              ? 'bg-surface-700 text-brand-300 border-brand-500/50'
              : 'bg-surface-800 hover:bg-surface-700 text-surface-200 border-surface-700/80'
          }`}
          aria-pressed={isParticipantsOpen}
          aria-label="Toggle participants list"
          title="Participants list"
        >
          <Users className="w-5 h-5" aria-hidden="true" />
          {participantCount > 0 && (
            <span
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-surface-900"
              aria-hidden="true"
            >
              {participantCount}
            </span>
          )}
        </button>

        {/* Leave Call (Distinct Danger Red Button) */}
        <button
          type="button"
          onClick={onLeaveCall}
          className="p-3 rounded-full bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-md border border-rose-500/40 transition-colors duration-150 min-h-touch min-w-touch flex items-center justify-center focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none ml-1 sm:ml-2"
          aria-label="End call and leave room"
          title="Leave room"
        >
          <PhoneOff className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
};
