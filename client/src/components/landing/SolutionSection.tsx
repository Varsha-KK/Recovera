import React from 'react';
import { motion } from 'motion/react';
import {
  User,
  FileCheck2,
  ShieldAlert,
  CalendarDays,
  BellRing,
  CheckCircle2,
  CalendarCheck,
  ArrowRight,
} from 'lucide-react';
import { fadeUp, staggerContainer } from '../../utils/motion';

export const SolutionSection: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Patient',
      desc: 'Enrolled upon discharge from inpatient or specialty care.',
      icon: User,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
    },
    {
      step: '02',
      title: 'Care Plan',
      desc: 'Formulates condition-specific follow-up window and required lab panels.',
      icon: FileCheck2,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      step: '03',
      title: 'Risk Assessment',
      desc: 'Rule-based explainable risk scoring (0–100) flags drop-off risk.',
      icon: ShieldAlert,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      step: '04',
      title: 'Follow-Up Schedule',
      desc: 'Clinical checkup windows synced to hospital calendars.',
      icon: CalendarDays,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      step: '05',
      title: 'Smart Reminders',
      desc: 'Multi-channel sequence: 72h SMS, 48h push, and 24h voice check-ins.',
      icon: BellRing,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      step: '06',
      title: 'Appointment',
      desc: '1-click patient attendance confirmation or window-safe reschedule.',
      icon: CalendarCheck,
      color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    },
    {
      step: '07',
      title: 'Care Completion',
      desc: 'Consultation conducted. Care loop closed and long-term risk mitigated.',
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-400/20',
    },
  ];

  return (
    <section id="solution" className="py-20 md:py-28 bg-slate-50/70 border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
            <span>The Continuous Care Loop</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 tracking-tight">
            Recovera closes the gap
          </h2>

          <p className="text-base text-slate-600 leading-relaxed">
            From diagnosis to long-term recovery, Recovera connects clinical teams and patients
            in an automated, closed-loop transitional care sequence.
          </p>
        </div>

        {/* 7-Step Animated Timeline Workflow */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3.5"
        >
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.title}
                variants={fadeUp}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-teal-300 hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {s.step}
                    </span>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${s.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 mb-1 font-display">
                    {s.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                {idx < steps.length - 1 && (
                  <div className="hidden lg:flex justify-end pt-3 text-slate-300">
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default SolutionSection;
