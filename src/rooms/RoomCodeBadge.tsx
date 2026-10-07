import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { announceToScreenReader } from '../utils/a11y';

interface RoomCodeBadgeProps {
  roomCode: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RoomCodeBadge: React.FC<RoomCodeBadgeProps> = ({ roomCode, size = 'md' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      announceToScreenReader(`Room code ${roomCode} copied to clipboard`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const textSizes = {
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2 font-mono tracking-wider',
  }[size];

  return (
    <div className="inline-flex items-center gap-1.5 bg-surface-900 border border-surface-700/80 rounded-lg p-1">
      <span className={`font-mono font-bold text-brand-300 ${textSizes}`}>
        {roomCode}
      </span>
      <button
        type="button"
        onClick={handleCopy}
        className="p-1.5 rounded-md text-surface-400 hover:text-surface-100 hover:bg-surface-800 focus-visible:ring-2 focus-visible:ring-brand-400 transition-colors min-h-touch min-w-touch flex items-center justify-center"
        aria-label={`Copy room code ${roomCode}`}
        title="Copy room code"
      >
        {copied ? (
          <Check className="w-4 h-4 text-emerald-400" aria-hidden="true" />
        ) : (
          <Copy className="w-4 h-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
};
