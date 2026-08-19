import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, ShieldCheck, AlertTriangle, Flame } from 'lucide-react';
import { RiskLevel } from '../../types';
import { cn } from '../../utils/cn';

interface RiskIndicatorProps {
  score: number;
  level?: RiskLevel | string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const RiskIndicator: React.FC<RiskIndicatorProps> = ({
  score,
  level,
  size = 'md',
  showLabel = true,
  className,
}) => {
  // Infer normalized level if needed
  const effectiveLevel =
    level?.toUpperCase() || (score >= 85 ? 'CRITICAL' : score >= 60 ? 'HIGH' : score >= 30 ? 'MEDIUM' : 'LOW');

  const getTheme = () => {
    switch (effectiveLevel) {
      case 'CRITICAL':
        return {
          stroke: '#DC2626',
          bgRing: '#FEE2E2',
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
          dot: 'bg-rose-600',
          icon: <Flame className="w-4 h-4 text-rose-600" />,
          label: 'Critical Risk',
        };
      case 'HIGH':
        return {
          stroke: '#EF4444',
          bgRing: '#FEE2E2',
          badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          icon: <ShieldAlert className="w-4 h-4 text-rose-600" />,
          label: 'High Drop-Off Risk',
        };
      case 'MEDIUM':
        return {
          stroke: '#F59E0B',
          bgRing: '#FEF3C7',
          badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
          label: 'Medium Risk',
        };
      case 'LOW':
      default:
        return {
          stroke: '#10B981',
          bgRing: '#D1FAE5',
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
          label: 'Low Drop-Off Risk',
        };
    }
  };

  const theme = getTheme();
  const radius = size === 'lg' ? 32 : size === 'md' ? 22 : 16;
  const strokeWidth = size === 'lg' ? 5 : size === 'md' ? 3.5 : 2.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;
  const svgSize = (radius + strokeWidth) * 2;

  return (
    <div className={cn('flex items-center gap-3 select-none', className)}>
      <div className="relative inline-flex items-center justify-center shrink-0">
        <svg width={svgSize} height={svgSize} className="transform -rotate-90">
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke={theme.bgRing}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <motion.circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke={theme.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <span
          className={cn(
            'absolute font-bold text-slate-800 font-mono',
            size === 'lg' ? 'text-base font-display' : size === 'md' ? 'text-xs' : 'text-[10px]'
          )}
        >
          {score}
        </span>
      </div>

      {showLabel && (
        <div className="min-w-0">
          <div
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold',
              theme.badgeBg
            )}
          >
            <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse', theme.dot)} />
            <span>{effectiveLevel} RISK</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Care Follow-Up Score ({score}%)</p>
        </div>
      )}
    </div>
  );
};

export default RiskIndicator;
