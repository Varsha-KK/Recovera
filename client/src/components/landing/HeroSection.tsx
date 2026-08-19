import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  HeartPulse,
} from 'lucide-react';
import { Button } from '../common/Button';
import { ECGHeartbeatLine } from './ECGHeartbeatLine';
import { FloatingMilestoneBubbles } from './FloatingMilestoneBubbles';
import { ECGBackgroundAnimation } from '../common/ECGBackgroundAnimation';
import { fadeUp, staggerContainer } from '../../utils/motion';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/70 to-blue-50/20 pt-16 pb-16 md:pt-24 md:pb-24 border-b border-slate-200">
      {/* Subtle Red Animated ECG Background Waveform */}
      <ECGBackgroundAnimation opacity={0.14} color="#DC2626" />

      {/* Floating Milestone Bubbles */}
      <FloatingMilestoneBubbles />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-6 max-w-3xl mx-auto"
        >
          {/* Subtle Clinical Badge */}
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold shadow-xs">
            <HeartPulse className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
            <span>Intelligent Post-Discharge Care Coordination</span>
          </motion.div>

          {/* Centered Main Headline in Baskervville Bold */}
          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display tracking-tight text-slate-900 leading-[1.12]"
          >
            From diagnosis to recovery, <br className="hidden sm:inline" />
            <span className="text-brand-700">we don't lose the patient.</span>
          </motion.h1>

          {/* Supporting Text in Comic Sans */}
          <motion.p
            variants={fadeUp}
            className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal"
          >
            Recovera helps care teams identify patients at risk of dropping off, prioritize
            follow-ups, and keep every patient connected to the next step in their care journey.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center justify-center gap-3.5 pt-2"
          >
            <Link to="/register">
              <Button
                size="lg"
                variant="primary"
                className="shadow-xs text-sm px-6"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Get Started
              </Button>
            </Link>
            <a href="#solution">
              <Button
                size="lg"
                variant="outline"
                className="bg-white text-slate-800 border-slate-300 hover:bg-slate-50 text-sm px-6"
              >
                See How Recovera Works
              </Button>
            </a>
          </motion.div>
        </motion.div>

        {/* Animated ECG Heartbeat Monitor Widget */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-10 sm:mt-12 max-w-2xl mx-auto"
        >
          <div className="p-4 sm:p-5 rounded-2xl bg-white/95 border border-slate-200 shadow-xs backdrop-blur-xs">
            <div className="flex items-center justify-between px-2 pb-2 mb-1 border-b border-slate-100 text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-600 animate-ping" />
                Continuous Patient Engagement Monitor
              </span>
              <span className="text-xs font-mono text-slate-400">Care Loop Active</span>
            </div>

            <ECGHeartbeatLine height={60} color="#0284C7" strokeWidth={2.2} />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
