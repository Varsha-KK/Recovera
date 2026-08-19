import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  CalendarDays,
  Pill,
  Activity,
  BellRing,
  CheckCircle2,
} from 'lucide-react';

export const FloatingMilestoneBubbles: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  const bubbles = [
    {
      id: 'followup',
      label: 'Follow-Up Scheduled',
      icon: CalendarDays,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
      iconColor: 'text-teal-600',
      position: 'top-8 left-4 sm:left-12 lg:left-24',
      delay: 0,
      floatY: [-6, 6, -6],
      duration: 6,
    },
    {
      id: 'medication',
      label: 'Medication Adherence',
      icon: Pill,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      iconColor: 'text-blue-600',
      position: 'top-16 right-4 sm:right-12 lg:right-24',
      delay: 0.5,
      floatY: [6, -6, 6],
      duration: 7,
    },
    {
      id: 'test',
      label: 'Pre-Visit Lab Tests',
      icon: Activity,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconColor: 'text-emerald-600',
      position: 'bottom-20 left-6 sm:left-20 lg:left-36 hidden sm:flex',
      delay: 1,
      floatY: [-8, 4, -8],
      duration: 8,
    },
    {
      id: 'reminder',
      label: 'Multi-Channel Reminder',
      icon: BellRing,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      iconColor: 'text-indigo-600',
      position: 'bottom-16 right-6 sm:right-20 lg:right-36 hidden sm:flex',
      delay: 1.5,
      floatY: [4, -8, 4],
      duration: 6.5,
    },
    {
      id: 'completion',
      label: 'Care Loop Closed',
      icon: CheckCircle2,
      color: 'bg-cyan-50 text-cyan-800 border-cyan-200',
      iconColor: 'text-cyan-600',
      position: 'top-1/2 -translate-y-1/2 right-2 lg:right-10 hidden md:flex',
      delay: 2,
      floatY: [-5, 5, -5],
      duration: 7.5,
    },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {bubbles.map((b) => {
        const Icon = b.icon;
        return (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={
              shouldReduceMotion
                ? { opacity: 0.85, scale: 1 }
                : {
                    opacity: [0.75, 0.95, 0.75],
                    scale: 1,
                    y: b.floatY,
                  }
            }
            transition={{
              duration: b.duration,
              ease: 'easeInOut',
              repeat: Infinity,
              delay: b.delay,
            }}
            className={`absolute ${b.position} items-center gap-2 px-3 py-1.5 rounded-full border shadow-xs backdrop-blur-xs text-xs font-semibold select-none ${b.color}`}
          >
            <Icon className={`w-3.5 h-3.5 ${b.iconColor}`} />
            <span className="hidden sm:inline">{b.label}</span>
          </motion.div>
        );
      })}
    </div>
  );
};

export default FloatingMilestoneBubbles;
