import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'control';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  type = 'button',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-colors duration-150 rounded-lg focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-950 disabled:opacity-50 disabled:cursor-not-allowed select-none touch-manipulation min-h-touch';

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'text-xs px-3 py-2 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-5 py-3 gap-2.5',
  };

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white shadow-sm border border-brand-400/20',
    secondary:
      'bg-surface-800 hover:bg-surface-700 active:bg-surface-600 text-surface-100 border border-surface-700/60',
    outline:
      'bg-transparent hover:bg-surface-850 active:bg-surface-800 text-surface-200 hover:text-white border border-surface-700 hover:border-surface-600',
    danger:
      'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm border border-rose-500/20',
    ghost:
      'bg-transparent hover:bg-surface-800 active:bg-surface-700 text-surface-300 hover:text-surface-100 border border-transparent',
    control:
      'bg-surface-800/90 hover:bg-surface-700 active:bg-surface-600 text-surface-100 rounded-full border border-surface-700/70 shadow-md backdrop-blur-sm',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0"
          aria-hidden="true"
        />
      ) : (
        icon && <span className="shrink-0" aria-hidden="true">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
