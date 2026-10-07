import React from 'react';

export type StatusVariant = 'active' | 'waiting' | 'ended' | 'offline' | 'ai-on' | 'ai-off';

interface StatusBadgeProps {
  variant: StatusVariant;
  label?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant,
  label,
  className = '',
}) => {
  const configs: Record<StatusVariant, { text: string; bg: string; border: string; dot: string; icon?: string }> = {
    active: {
      text: label || 'Live',
      bg: 'bg-emerald-950/60 text-emerald-300',
      border: 'border-emerald-600/30',
      dot: 'bg-emerald-400',
    },
    waiting: {
      text: label || 'Waiting',
      bg: 'bg-amber-950/60 text-amber-300',
      border: 'border-amber-600/30',
      dot: 'bg-amber-400',
    },
    ended: {
      text: label || 'Ended',
      bg: 'bg-surface-800/80 text-surface-400',
      border: 'border-surface-700/40',
      dot: 'bg-surface-500',
    },
    offline: {
      text: label || 'Offline',
      bg: 'bg-surface-850 text-surface-400',
      border: 'border-surface-700',
      dot: 'bg-surface-500',
    },
    'ai-on': {
      text: label || 'AI Active',
      bg: 'bg-brand-950/70 text-brand-300',
      border: 'border-brand-500/40',
      dot: 'bg-brand-400',
    },
    'ai-off': {
      text: label || 'AI Standby',
      bg: 'bg-surface-800/80 text-surface-400',
      border: 'border-surface-700/50',
      dot: 'bg-surface-500',
    },
  };

  const current = configs[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${current.bg} ${current.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot} shrink-0`} aria-hidden="true" />
      <span>{current.text}</span>
    </span>
  );
};
