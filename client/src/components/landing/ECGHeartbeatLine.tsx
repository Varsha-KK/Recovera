import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface ECGHeartbeatLineProps {
  className?: string;
  color?: string;
  strokeWidth?: number;
  height?: number;
}

export const ECGHeartbeatLine: React.FC<ECGHeartbeatLineProps> = ({
  className = '',
  color = '#0D9488',
  strokeWidth = 2.5,
  height = 70,
}) => {
  const shouldReduceMotion = useReducedMotion();

  // ECG standard P-Q-R-S-T wave path repeating across 800px width
  const ecgPath =
    'M 0 35 L 60 35 L 75 35 L 85 30 L 95 35 L 110 35 L 120 38 L 130 8 L 140 54 L 148 35 L 160 35 L 175 27 L 190 35 L 260 35 L 320 35 L 335 35 L 345 30 L 355 35 L 370 35 L 380 38 L 390 8 L 400 54 L 408 35 L 420 35 L 435 27 L 450 35 L 520 35 L 580 35 L 595 35 L 605 30 L 615 35 L 630 35 L 640 38 L 650 8 L 660 54 L 668 35 L 680 35 L 695 27 L 710 35 L 800 35';

  return (
    <div className={`relative w-full overflow-hidden flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 800 70"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-w-3xl"
        style={{ maxHeight: height }}
      >
        {/* Subtle grid background guideline */}
        <line
          x1="0"
          y1="35"
          x2="800"
          y2="35"
          stroke="#E2E8F0"
          strokeWidth="1"
          strokeDasharray="4 6"
          strokeOpacity="0.8"
        />

        {/* Faint static base ECG track */}
        <path
          d={ecgPath}
          stroke="#99F6E4"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.35"
        />

        {/* Animated Drawing ECG Wave */}
        <motion.path
          d={ecgPath}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0.1, pathOffset: 0 }}
          animate={
            shouldReduceMotion
              ? { pathLength: 1 }
              : {
                  pathLength: [0.15, 0.45, 0.15],
                  pathOffset: [0, 1],
                }
          }
          transition={{
            duration: 4.5,
            ease: 'linear',
            repeat: Infinity,
          }}
        />

        {/* Heartbeat pulse glow node at R-peak */}
        {!shouldReduceMotion && (
          <motion.circle
            r="3.5"
            fill={color}
            initial={{ opacity: 0 }}
            animate={{
              cx: [130, 390, 650, 130],
              cy: [8, 8, 8, 8],
              opacity: [0, 1, 0.7, 0],
              scale: [0.8, 1.3, 0.8],
            }}
            transition={{
              duration: 4.5,
              ease: 'easeInOut',
              repeat: Infinity,
            }}
          />
        )}
      </svg>
    </div>
  );
};

export default ECGHeartbeatLine;
