import React from 'react';

interface RecoveraLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: string;
  variant?: 'color' | 'monochrome' | 'white';
}

export const RecoveraLogo: React.FC<RecoveraLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  textColor,
  variant = 'color',
}) => {
  const sizeMap = {
    sm: { icon: 24, text: 'text-lg', gap: 'gap-2' },
    md: { icon: 32, text: 'text-xl', gap: 'gap-2.5' },
    lg: { icon: 40, text: 'text-2xl', gap: 'gap-3' },
    xl: { icon: 48, text: 'text-3xl', gap: 'gap-3.5' },
  };

  const { icon, text, gap } = sizeMap[size];

  return (
    <div className={`inline-flex items-center ${gap} ${className} select-none`}>
      <div
        className="relative flex items-center justify-center shrink-0"
        style={{ width: icon, height: icon }}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Bell Top Handle */}
          <path
            d="M24 5C22.3431 5 21 6.34315 21 8V9.17071C22.0128 9.05837 23.0135 9 24 9C24.9865 9 25.9872 9.05837 27 9.17071V8C27 6.34315 25.6569 5 24 5Z"
            fill={variant === 'white' ? '#FFFFFF' : variant === 'monochrome' ? 'currentColor' : '#0369A1'}
          />

          {/* Bell Body */}
          <path
            d="M13 32C13 32 12 33.5 10 35C9 35.75 9.5 37 11 37H37C38.5 37 39 35.75 38 35C36 33.5 35 32 35 32V21C35 14.9249 30.0751 10 24 10C17.9249 10 13 14.9249 13 21V32Z"
            fill={
              variant === 'white'
                ? '#FFFFFF'
                : variant === 'monochrome'
                ? 'currentColor'
                : '#0284C7'
            }
            fillOpacity={variant === 'color' ? 0.12 : 1}
            stroke={variant === 'white' ? '#FFFFFF' : variant === 'monochrome' ? 'currentColor' : '#0369A1'}
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Bell Clapper */}
          <path
            d="M21 38C21.2 40.2 22.4 42 24 42C25.6 42 26.8 40.2 27 38"
            stroke={variant === 'white' ? '#FFFFFF' : variant === 'monochrome' ? 'currentColor' : '#0369A1'}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Integrated ECG Heartbeat Pulse Line */}
          <path
            d="M5 24.5H15.5L18 20L21 28.5L24.5 13L28 32L30.5 24.5H43"
            stroke={variant === 'white' ? '#7DD3FC' : variant === 'monochrome' ? 'currentColor' : '#0284C7'}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Pulse Node Accent */}
          <circle
            cx="24.5"
            cy="13"
            r="2.2"
            fill={variant === 'white' ? '#FFFFFF' : variant === 'monochrome' ? 'currentColor' : '#0284C7'}
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-bold tracking-tight ${text} ${
              textColor
                ? textColor
                : variant === 'white'
                ? 'text-white'
                : 'text-slate-900'
            }`}
          >
            Recov<span className={variant === 'white' ? 'text-blue-300' : 'text-brand-600'}>era</span>
          </span>
          {size !== 'sm' && (
            <span
              className={`text-[10px] font-bold tracking-wider uppercase mt-0.5 ${
                variant === 'white' ? 'text-slate-300' : 'text-slate-500'
              }`}
            >
              Continuous Care
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default RecoveraLogo;
