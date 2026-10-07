import React, { useRef, useEffect } from 'react';
import { Mic, MicOff, VideoOff, Bot, User as UserIcon } from 'lucide-react';

export interface ParticipantTileProps {
  id: string;
  name: string;
  isLocal?: boolean;
  isHost?: boolean;
  isAudioMuted?: boolean;
  isVideoMuted?: boolean;
  isAISpeaker?: boolean;
  isSpeaking?: boolean;
  stream?: MediaStream | null;
}

export const ParticipantTile: React.FC<ParticipantTileProps> = ({
  id,
  name,
  isLocal = false,
  isHost = false,
  isAudioMuted = false,
  isVideoMuted = false,
  isAISpeaker = false,
  isSpeaking = false,
  stream,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Attach stream to video tag if present
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    } else if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream, isVideoMuted]);

  return (
    <div
      id={`participant-tile-${id}`}
      className={`relative w-full h-full min-h-[160px] sm:min-h-[220px] bg-surface-900 border rounded-xl overflow-hidden flex items-center justify-center transition-all ${
        isSpeaking
          ? 'border-brand-400 ring-2 ring-brand-400/50 shadow-lg shadow-brand-500/10'
          : 'border-surface-800 hover:border-surface-700'
      }`}
      role="region"
      aria-label={`Participant video tile for ${name}`}
    >
      {/* Video Stream Element */}
      {!isVideoMuted && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal} // Always mute local video playback to avoid feedback
          className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''}`}
        />
      ) : (
        /* Video Off State */
        <div className="flex flex-col items-center justify-center p-4 text-center select-none">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-surface-800 border border-surface-700/80 flex items-center justify-center text-surface-400 mb-2 shadow-inner">
            <UserIcon className="w-8 h-8 sm:w-10 sm:h-10 text-surface-400" aria-hidden="true" />
          </div>
          <span className="text-xs text-surface-400 flex items-center gap-1 font-medium">
            <VideoOff className="w-3.5 h-3.5" aria-hidden="true" />
            Camera off
          </span>
        </div>
      )}

      {/* Top Indicators: AI Active Badge */}
      {isAISpeaker && (
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-950/80 border border-brand-500/50 text-[11px] font-medium text-brand-300 shadow-sm backdrop-blur-sm">
          <Bot className="w-3.5 h-3.5 text-brand-400" aria-hidden="true" />
          <span>ISL AI Active</span>
        </div>
      )}

      {/* Bottom Overlay: Participant Name & Audio State */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-950/80 backdrop-blur-md border border-surface-800/80 text-xs font-medium text-surface-100 max-w-[80%] truncate">
          <span className="truncate">
            {name}
            {isLocal && ' (You)'}
            {isHost && ' • Host'}
          </span>
        </div>

        <div
          className={`p-1.5 rounded-md backdrop-blur-md border text-xs flex items-center justify-center ${
            isAudioMuted
              ? 'bg-rose-950/80 border-rose-800/60 text-rose-300'
              : 'bg-surface-950/80 border-surface-800/80 text-surface-200'
          }`}
          title={isAudioMuted ? 'Microphone muted' : 'Microphone active'}
          aria-label={isAudioMuted ? 'Microphone muted' : 'Microphone active'}
        >
          {isAudioMuted ? (
            <MicOff className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <Mic className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
          )}
        </div>
      </div>
    </div>
  );
};
