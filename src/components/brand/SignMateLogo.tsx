import React from 'react';

interface SignMateLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'icon' | 'full' | 'mark';
  className?: string;
  showText?: boolean;
}

export const SignMateLogo: React.FC<SignMateLogoProps> = ({
  size = 'md',
  variant = 'icon',
  className = '',
  showText = false,
}) => {
  const sizeMap = {
    xs: { dim: 20, textSize: 'text-xs', subSize: 'text-[8px]' },
    sm: { dim: 28, textSize: 'text-sm', subSize: 'text-[9px]' },
    md: { dim: 36, textSize: 'text-base', subSize: 'text-[10px]' },
    lg: { dim: 48, textSize: 'text-xl', subSize: 'text-xs' },
    xl: { dim: 64, textSize: 'text-2xl', subSize: 'text-sm' },
  };

  const { dim, textSize, subSize } = sizeMap[size];
  const isFull = variant === 'full' || showText;
  const isMarkOnly = variant === 'mark';

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Precision Vector Emblem */}
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform hover:scale-105 duration-200"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="sm-logo-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1B2436" />
            <stop offset="100%" stopColor="#121824" />
          </linearGradient>
          <linearGradient id="sm-logo-border" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#0284C7" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#1e293b" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="sm-hand-grad1" x1="13" y1="12" x2="35" y2="25" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <linearGradient id="sm-hand-grad2" x1="35" y1="36" x2="13" y2="25" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
        </defs>

        {/* Squircle Frame (skipped in mark-only mode) */}
        {!isMarkOnly && (
          <rect
            x="2"
            y="2"
            width="44"
            height="44"
            rx="12"
            fill="url(#sm-logo-bg)"
            stroke="url(#sm-logo-border)"
            strokeWidth="1.5"
          />
        )}

        {/* Upper Hand Gesture Arc (Human Signing) */}
        <path
          d="M 13 24 C 13 17 18 12 25 12 C 30.5 12 34.5 15.5 35 20 C 35 21.5 33.8 22.5 32.3 22.5 C 31 22.5 30 21.8 29.5 20.5 C 28.5 18 26.2 16.5 24 16.5 C 19.5 16.5 17.5 19.8 17.5 23.5 C 17.5 24.8 16.5 25.8 15.2 25.8 C 14 25.8 13 25 13 24 Z"
          fill="url(#sm-hand-grad1)"
        />

        {/* Lower Hand Gesture Arc (Inclusive Connection Bridge) */}
        <path
          d="M 35 24 C 35 31 30 36 23 36 C 17.5 36 13.5 32.5 13 28 C 13 26.5 14.2 25.5 15.7 25.5 C 17 25.5 18 26.2 18.5 27.5 C 19.5 30 21.8 31.5 24 31.5 C 28.5 31.5 30.5 28.2 30.5 24.5 C 30.5 23.2 31.5 22.2 32.8 22.2 C 34 22.2 35 23 35 24 Z"
          fill="url(#sm-hand-grad2)"
        />

        {/* Center Iris / Translation Node */}
        <circle cx="24" cy="24" r="3.2" fill="#F8FAFC" />
        <circle cx="24" cy="24" r="5.8" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="3 2" strokeOpacity="0.85" />

        {/* Constellation Landmark Joint Nodes (MediaPipe Precision Tracking) */}
        <circle cx="31" cy="17" r="1.6" fill="#38bdf8" />
        <circle cx="17" cy="31" r="1.6" fill="#38bdf8" />
        <circle cx="24" cy="12" r="1.2" fill="#60a5fa" fillOpacity="0.9" />
        <circle cx="24" cy="36" r="1.2" fill="#60a5fa" fillOpacity="0.9" />
      </svg>

      {/* Typography for Full Variant */}
      {isFull && (
        <div className="flex flex-col text-left">
          <span className={`font-sans font-bold tracking-tight text-[#F8FAFC] leading-tight ${textSize}`}>
            Sign<span className="text-[#38bdf8]">Mate</span>
          </span>
          <span className={`text-[#94A3B8] font-medium tracking-wider uppercase ${subSize}`}>
            Assistive Video AI
          </span>
        </div>
      )}
    </div>
  );
};
