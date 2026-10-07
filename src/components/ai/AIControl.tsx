import React from 'react';
import type { AIState } from '../../types/ai';
import { Bot } from 'lucide-react';

interface AIControlProps {
  aiState: AIState;
  isPanelOpen?: boolean;
  onToggleAI: () => void;
  className?: string;
}

export const AIControl: React.FC<AIControlProps> = ({
  aiState,
  onToggleAI,
  className = '',
}) => {
  const isEnabled = aiState === 'active';

  return (
    <button
      type="button"
      id="ai-toggle-control"
      onClick={onToggleAI}
      className={`group relative inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-full font-medium text-xs sm:text-sm transition-all duration-200 select-none min-h-touch focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:outline-none border shadow-sm ${
        isEnabled
          ? 'bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white border-brand-400/50 shadow-brand-500/20'
          : 'bg-surface-800/90 hover:bg-surface-700 text-surface-200 hover:text-white border-surface-700/80'
      } ${className}`}
      aria-pressed={isEnabled}
      aria-label={isEnabled ? 'Turn Sign Recognition AI OFF' : 'Turn Sign Recognition AI ON'}
      title={isEnabled ? 'Sign Recognition AI is ON (Click to disable)' : 'Sign Recognition AI is OFF (Click to enable)'}
    >
      <Bot
        className={`w-4 h-4 transition-transform ${
          isEnabled ? 'text-brand-100 scale-110' : 'text-surface-400 group-hover:text-surface-200'
        }`}
        aria-hidden="true"
      />

      <span className="font-semibold tracking-wide">
        {isEnabled ? '🤖 AI ON' : '🤖 AI'}
      </span>

      {isEnabled && (
        <span
          className="w-2 h-2 rounded-full bg-brand-300 animate-pulse ml-0.5"
          aria-hidden="true"
        />
      )}
    </button>
  );
};
