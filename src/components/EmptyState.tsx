import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-surface-800 rounded-xl bg-surface-900/40 max-w-md mx-auto">
      <div className="p-3 bg-surface-800/80 rounded-full text-surface-400 mb-3" aria-hidden="true">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-surface-200">{title}</h3>
      <p className="text-sm text-surface-400 mt-1 max-w-xs leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
