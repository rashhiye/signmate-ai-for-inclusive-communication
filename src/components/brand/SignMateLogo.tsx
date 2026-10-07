import React from 'react';

interface SignMateLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'icon' | 'full';
  className?: string;
}

export const SignMateLogo: React.FC<SignMateLogoProps> = ({
  size = 'md',
  variant = 'icon',
  className = '',
}) => {
  const sizeMap = {
    xs: { dim: 20, text: 'text-sm' },
    sm: { dim: 28, text: 'text-base' },
    md: { dim: 36, text: 'text-lg' },
    lg: { dim: 48, text: 'text-2xl' },
    xl: { dim: 64, text: 'text-3xl' },
  };

  const { dim, text } = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Geometric SVG Vector Mark */}
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
          <linearGradient id="sm-gradient-primary" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="sm-gradient-accent" x1="44" y1="4" x2="4" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <filter id="sm-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Hex-Shield Backdrop */}
        <rect
          x="3"
          y="3"
          width="42"
          height="42"
          rx="12"
          fill="#13161d"
          stroke="url(#sm-gradient-primary)"
          strokeWidth="1.5"
          strokeOpacity="0.4"
        />

        {/* Ambient Subtle Glow Layer */}
        <path
          d="M14 16C14 12.6863 16.6863 10 20 10H28C31.3137 10 34 12.6863 34 16C34 19.3137 31.3137 22 28 22H20C16.6863 22 14 24.6863 14 28C14 31.3137 16.6863 34 20 34H28C31.3137 34 34 31.3137 34 28"
          stroke="url(#sm-gradient-primary)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Interlocking Sign-Wave Nodes */}
        <circle cx="20" cy="16" r="2.5" fill="#38bdf8" />
        <circle cx="28" cy="32" r="2.5" fill="#818cf8" />
        <circle cx="24" cy="24" r="2" fill="#ffffff" />
      </svg>

      {/* Typography for Full Variant */}
      {variant === 'full' && (
        <div className="flex flex-col text-left">
          <span
            className={`font-['Montserrat',sans-serif] font-extrabold tracking-[2px] uppercase text-white leading-none ${text}`}
          >
            SIGN<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">MATE</span>
          </span>
          <span className="text-[9px] text-[#8e94a0] tracking-[1.5px] uppercase font-medium mt-0.5">
            Inclusive AI Platform
          </span>
        </div>
      )}
    </div>
  );
};
