import React from 'react';
import { Button } from '../components/Button';

interface SocialAuthButtonsProps {
  onGoogleClick: () => void;
  isLoading?: boolean;
}

export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  onGoogleClick,
  isLoading = false,
}) => {
  return (
    <div className="w-full space-y-3">
      <Button
        variant="secondary"
        onClick={onGoogleClick}
        isLoading={isLoading}
        className="w-full font-medium text-surface-200 hover:text-white border-surface-700/80"
        icon={
          <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#EA4335"
              d="M12 5c1.56 0 2.97.55 4.08 1.45l3.06-3.06C17.29 1.7 14.83 1 12 1 7.46 1 3.58 3.58 1.67 7.34l3.75 2.91C6.31 7.27 8.92 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-1.99 3.7-4.93 3.7-8.69z"
            />
            <path
              fill="#FBBC05"
              d="M5.42 14.75c-.23-.68-.36-1.41-.36-2.17s.13-1.49.36-2.17L1.67 7.34C.61 9.44 0 11.83 0 14.32s.61 4.88 1.67 6.98l3.75-2.55z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.7-2.87c-1.07.72-2.45 1.16-4.23 1.16-3.08 0-5.69-2.27-6.58-5.25L1.67 15.68C3.58 19.42 7.46 23 12 23z"
            />
          </svg>
        }
      >
        Continue with Google
      </Button>

      <div className="relative flex items-center justify-center py-2">
        <div className="border-t border-surface-800 w-full" aria-hidden="true" />
        <span className="bg-surface-900 px-3 text-xs text-surface-400 uppercase tracking-wider relative font-medium">
          Or continue with email
        </span>
      </div>
    </div>
  );
};
