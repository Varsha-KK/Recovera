import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface ECGBackgroundAnimationProps {
  className?: string;
  opacity?: number;
  color?: string;
  strokeWidth?: number;
}

export const ECGBackgroundAnimation: React.FC<ECGBackgroundAnimationProps> = ({
  className = '',
  opacity = 0.14,
  color = '#DC2626',
  strokeWidth = 1.8,
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Repeating standard clinical ECG segment: baseline -> P-wave -> Q-dip -> R-peak -> S-dip -> T-wave -> baseline (250px unit)
  const singleUnit =
    'M 0 45 L 45 45 Q 55 45 60 40 Q 65 45 75 45 L 90 45 L 96 48 L 105 12 L 114 68 L 120 45 L 135 45 Q 148 45 155 36 Q 162 45 175 45 L 250 45';

  // 8 identical units chained to make a seamless 2000px segment
  const fullWaveform = Array.from({ length: 8 })
    .map((_, i) => {
      const offset = i * 250;
      return `M ${offset} 45 L ${offset + 45} 45 Q ${offset + 55} 45 ${offset + 60} 40 Q ${offset + 65} 45 ${offset + 75} 45 L ${offset + 90} 45 L ${offset + 96} 48 L ${offset + 105} 12 L ${offset + 114} 68 L ${offset + 120} 45 L ${offset + 135} 45 Q ${offset + 148} 45 ${offset + 155} 36 Q ${offset + 162} 45 ${offset + 175} 45 L ${offset + 250} 45`;
    })
    .join(' ');

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden select-none flex flex-col justify-around opacity-90 ${className}`}
    >
      {/* Top Background Waveform Track */}
      <div className="relative w-full h-24 overflow-hidden">
        <motion.div
          className="flex w-[4000px]"
          animate={
            shouldReduceMotion
              ? { x: 0 }
              : {
                  x: [0, -1000],
                }
          }
          transition={{
            duration: 22,
            ease: 'linear',
            repeat: Infinity,
          }}
        >
          <svg
            viewBox="0 0 2000 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[2000px] h-20 shrink-0"
            style={{ opacity }}
          >
            <path
              d={fullWaveform}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <svg
            viewBox="0 0 2000 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[2000px] h-20 shrink-0"
            style={{ opacity }}
          >
            <path
              d={fullWaveform}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </div>

      {/* Bottom Background Waveform Track */}
      <div className="relative w-full h-24 overflow-hidden">
        <motion.div
          className="flex w-[4000px]"
          animate={
            shouldReduceMotion
              ? { x: 0 }
              : {
                  x: [-500, -1500],
                }
          }
          transition={{
            duration: 26,
            ease: 'linear',
            repeat: Infinity,
          }}
        >
          <svg
            viewBox="0 0 2000 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[2000px] h-20 shrink-0"
            style={{ opacity: opacity * 0.85 }}
          >
            <path
              d={fullWaveform}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <svg
            viewBox="0 0 2000 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[2000px] h-20 shrink-0"
            style={{ opacity: opacity * 0.85 }}
          >
            <path
              d={fullWaveform}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </div>
    </div>
  );
};

export default ECGBackgroundAnimation;
