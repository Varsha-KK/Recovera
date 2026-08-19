import React from 'react';
import { motion } from 'motion/react';
import {
  BrainCircuit,
  ListOrdered,
  BellRing,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { fadeUp, staggerContainer } from '../../utils/motion';

export const CorePillarsSection: React.FC = () => {
  const pillars = [
    {
      num: '01',
      title: 'Predict',
      headline: 'Explainable Drop-Off Scoring',
      desc: 'Transparent rule-based risk scoring (0–100) calculates non-attendance likelihood based on baseline condition severity, previous no-shows, and pending pre-tests.',
      icon: BrainCircuit,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
    },
    {
      num: '02',
      title: 'Prioritize',
      headline: 'Urgency & Timeline Queue',
      desc: 'Care coordinators see active cohorts sorted strictly by clinical follow-up window urgency and drop-off probability, eliminating spreadsheet guesswork.',
      icon: ListOrdered,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      num: '03',
      title: 'Remind',
      headline: 'Multi-Channel Engagement',
      desc: 'Automated 2-way SMS check-ins, natural voice calls (via ElevenLabs + Twilio), and browser push alerts keep patients informed without spam.',
      icon: BellRing,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      num: '04',
      title: 'Follow through',
      headline: 'Closed-Loop Care Tracking',
      desc: 'Consultations, diagnostic lab panels, and medication reviews are tracked to verified clinical completion, preventing preventable 30-day readmissions.',
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>The Four Operational Pillars</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 tracking-tight">
            Predict. Prioritize. Remind. Follow through.
          </h2>

          <p className="text-base text-slate-600 leading-relaxed">
            The foundational methodology behind Recovera's post-discharge adherence platform.
          </p>
        </div>

        {/* 4 Clean Feature Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                variants={fadeUp}
                className="p-6 sm:p-7 rounded-3xl bg-slate-50/80 border border-slate-200 shadow-xs flex flex-col justify-between hover:bg-white hover:border-teal-300 hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-extrabold text-slate-400">
                      {p.num}
                    </span>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${p.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block font-mono mb-1">
                    {p.title}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mb-2 font-display">
                    {p.headline}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default CorePillarsSection;
