import React from 'react';
import type { ParticipantTileProps } from './ParticipantTile';
import { ParticipantTile } from './ParticipantTile';
import { Users } from 'lucide-react';

interface VideoGridProps {
  participants: ParticipantTileProps[];
  roomCode: string;
}

export const VideoGrid: React.FC<VideoGridProps> = ({ participants, roomCode }) => {
  const count = participants.length;

  const getGridClasses = () => {
    switch (count) {
      case 1:
        return 'grid-cols-1 max-w-3xl mx-auto h-full max-h-[70vh]';
      case 2:
        return 'grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto h-full max-h-[75vh]';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto h-full';
      case 4:
        return 'grid-cols-1 sm:grid-cols-2 max-w-5xl mx-auto h-full';
      case 5:
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto h-full';
    }
  };

  return (
    <div className="w-full h-full flex-1 flex flex-col items-center justify-center p-3 sm:p-5 overflow-y-auto custom-scrollbar">
      {count === 0 ? (
        <div className="text-center p-8 text-surface-400">
          <Users className="w-12 h-12 mx-auto mb-2 text-surface-500" />
          <p className="text-sm">Connecting to room {roomCode}...</p>
        </div>
      ) : (
        <div className="w-full flex-1 flex flex-col justify-center">
          <div className={`grid gap-3 sm:gap-4 w-full ${getGridClasses()}`}>
            {participants.map((participant) => (
              <div key={participant.id} className="w-full h-full min-h-[200px] flex">
                <ParticipantTile {...participant} />
              </div>
            ))}
          </div>

          {count === 1 && (
            <div className="mt-4 text-center">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-900 border border-surface-800 text-xs text-surface-400">
                <span className="w-2 h-2 rounded-full bg-amber-400" aria-hidden="true" />
                <span>Waiting for others to join with room code: </span>
                <strong className="font-mono text-brand-300 font-semibold">{roomCode}</strong>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
