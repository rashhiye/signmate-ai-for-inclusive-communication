import React from 'react';
import { Link } from 'react-router-dom';
import { RoomCodeBadge } from '../../rooms/RoomCodeBadge';
import { StatusBadge } from '../StatusBadge';
import { Button } from '../Button';
import { Video, LogOut, Users } from 'lucide-react';

interface RoomHeaderProps {
  roomCode: string;
  roomName?: string;
  participantCount: number;
  maxParticipants?: number;
  onLeave: () => void;
}

export const RoomHeader: React.FC<RoomHeaderProps> = ({
  roomCode,
  roomName,
  participantCount,
  maxParticipants = 5,
  onLeave,
}) => {
  return (
    <header className="w-full bg-surface-900/90 border-b border-surface-800/80 px-4 py-2.5 backdrop-blur-md z-30 shrink-0">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Branding & Room Info */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-surface-200 hover:text-white transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-brand-400 rounded-lg p-1"
            aria-label="Exit to Dashboard"
            title="Exit to Dashboard"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400">
              <Video className="w-4 h-4" aria-hidden="true" />
            </div>
            <span className="font-bold text-sm text-surface-100 hidden sm:inline">SignMate</span>
          </Link>

          <div className="h-4 w-px bg-surface-700 hidden sm:block" aria-hidden="true" />

          <div className="flex items-center gap-2 min-w-0">
            {roomName && (
              <span className="text-xs sm:text-sm font-semibold text-surface-200 truncate max-w-[120px] sm:max-w-[200px]">
                {roomName}
              </span>
            )}
            <RoomCodeBadge roomCode={roomCode} size="sm" />
          </div>
        </div>

        {/* Center/Right: Badges & Leave */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-800 border border-surface-700/60 text-xs text-surface-300">
            <Users className="w-3.5 h-3.5 text-surface-400" aria-hidden="true" />
            <span>
              {participantCount}/{maxParticipants}
            </span>
          </div>

          <StatusBadge variant="active" label="Live" />

          <Button
            variant="danger"
            size="sm"
            onClick={onLeave}
            icon={<LogOut className="w-3.5 h-3.5" />}
            className="px-3 py-1.5 text-xs"
            aria-label="Leave room"
          >
            Leave
          </Button>
        </div>
      </div>
    </header>
  );
};
