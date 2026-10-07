import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  hideLabel?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  leftIcon,
  rightElement,
  hideLabel = false,
  id: customId,
  className = '',
  required,
  disabled,
  ...props
}) => {
  const generatedId = useId();
  const inputId = customId || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      <label
        htmlFor={inputId}
        className={`text-sm font-medium text-surface-200 ${
          hideLabel ? 'sr-only' : 'flex items-center justify-between'
        }`}
      >
        <span>
          {label}
          {required && <span className="text-rose-400 ml-1" aria-hidden="true">*</span>}
        </span>
      </label>

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 text-surface-400 pointer-events-none flex items-center justify-center">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          required={required}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          className={`w-full bg-surface-900 border rounded-lg text-surface-100 placeholder-surface-500 min-h-touch text-base sm:text-sm px-3.5 transition-colors focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
            leftIcon ? 'pl-10' : ''
          } ${rightElement ? 'pr-12' : ''} ${
            error
              ? 'border-rose-500/80 focus-visible:ring-rose-400'
              : 'border-surface-700/80 hover:border-surface-600 focus-visible:border-brand-500'
          } ${className}`}
          {...props}
        />

        {rightElement && (
          <div className="absolute right-2.5 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {error ? (
        <p id={errorId} className="text-xs text-rose-400 flex items-center gap-1 mt-0.5" role="alert">
          <span aria-hidden="true">⚠️</span>
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-xs text-surface-400 mt-0.5">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};
