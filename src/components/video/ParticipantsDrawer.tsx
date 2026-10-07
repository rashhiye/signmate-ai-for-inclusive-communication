import React from 'react';
import { X, Mic, MicOff, Video, VideoOff, Crown } from 'lucide-react';
import type { ParticipantTileProps } from './ParticipantTile';
import { RoomCodeBadge } from '../../rooms/RoomCodeBadge';

interface ParticipantsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  participants: ParticipantTileProps[];
  roomCode: string;
}

export const ParticipantsDrawer: React.FC<ParticipantsDrawerProps> = ({
  isOpen,
  onClose,
  participants,
  roomCode,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Room Participants"
      className="fixed inset-y-0 right-0 z-40 w-full sm:w-80 bg-surface-900 border-l border-surface-800 shadow-2xl flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-surface-800 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm text-surface-100">
            Participants ({participants.length}/5)
          </h3>
          <p className="text-xs text-surface-400 mt-0.5">Active communication room</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-surface-400 hover:text-surface-100 hover:bg-surface-800 transition-colors min-h-touch min-w-touch flex items-center justify-center"
          aria-label="Close participants list"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Room code snippet */}
      <div className="p-3 bg-surface-950/60 border-b border-surface-800/80 flex items-center justify-between">
        <span className="text-xs text-surface-400 font-medium">Invite others:</span>
        <RoomCodeBadge roomCode={roomCode} size="sm" />
      </div>

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
        {participants.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between p-2.5 rounded-lg bg-surface-850/60 border border-surface-800"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-surface-800 border border-surface-700/80 flex items-center justify-center text-xs font-bold text-surface-200 shrink-0">
                {p.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-surface-100 truncate">
                    {p.name}
                  </span>
                  {p.isHost && (
                    <span title="Host">
                      <Crown className="w-3 h-3 text-amber-400 shrink-0" aria-hidden="true" />
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-surface-400 block">
                  {p.isLocal ? 'You' : 'Remote'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-surface-400">
              {p.isAudioMuted ? (
                <span title="Microphone muted">
                  <MicOff className="w-3.5 h-3.5 text-rose-400" aria-hidden="true" />
                </span>
              ) : (
                <span title="Microphone active">
                  <Mic className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                </span>
              )}
              {p.isVideoMuted ? (
                <span title="Camera off">
                  <VideoOff className="w-3.5 h-3.5 text-rose-400" aria-hidden="true" />
                </span>
              ) : (
                <span title="Camera on">
                  <Video className="w-3.5 h-3.5 text-surface-400" aria-hidden="true" />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
