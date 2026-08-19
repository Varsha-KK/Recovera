import React from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowRight,
  FileSpreadsheet,
  CalendarX,
  Stethoscope,
  HeartCrack,
  Clock,
} from 'lucide-react';
import { fadeUp, staggerContainer } from '../../utils/motion';

export const ProblemSection: React.FC = () => {
  const steps = [
    {
      title: 'Diagnosis & Treatment',
      subtitle: 'Inpatient Hospital Stay',
      description: 'Acute stabilization and initial care plan formulated by medical staff.',
      icon: Stethoscope,
      color: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    {
      title: 'Hospital Discharge',
      subtitle: 'Paper Slip Handout',
      description: 'Patient receives static discharge instructions and heads home.',
      icon: FileSpreadsheet,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      title: 'Missed Follow-Up',
      subtitle: 'Care Drop-Off Point',
      description: 'Symptoms temporarily subside. Patient forgets or delays scheduling checkup.',
      icon: CalendarX,
      color: 'bg-amber-50 text-amber-700 border-amber-300 ring-2 ring-amber-400/30',
      critical: true,
    },
    {
      title: 'Delayed Treatment',
      subtitle: 'Silent Progression',
      description: 'Medication lapses and unmonitored vitals quietly escalate.',
      icon: Clock,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    {
      title: 'Acute Readmission',
      subtitle: 'Preventable Emergency',
      description: 'Patient returns to the ER with severe, costly complications.',
      icon: HeartCrack,
      color: 'bg-rose-100 text-rose-800 border-rose-300',
    },
  ];

  return (
    <section id="problem" className="py-20 md:py-28 bg-white border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>The Clinical Gap in Healthcare</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 tracking-tight">
            The missed follow-up
          </h2>

          <p className="text-base text-slate-600 leading-relaxed">
            Recovery depends on timely checkups, medication adherence, and lab testing. Yet without
            active coordination, over 40% of patients quietly stop following through after discharge.
          </p>
        </div>

        {/* Animated Drop-Off Progression Flow */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-5 gap-4 relative"
        >
          {steps.map((s, index) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.title}
                variants={fadeUp}
                className={`p-5 rounded-3xl border bg-white shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${
                  s.critical ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      STAGE 0{index + 1}
                    </span>
                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center border ${s.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-0.5">{s.title}</h3>
                  <div className="text-[11px] font-medium text-slate-500 mb-2">{s.subtitle}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{s.description}</p>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden md:flex justify-end pt-4 text-slate-300">
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom Callout */}
        <div className="mt-12 p-6 rounded-3xl bg-slate-50 border border-slate-200/80 max-w-3xl mx-auto text-center space-y-1 text-xs sm:text-sm text-slate-700">
          <strong className="text-slate-900 font-bold block">
            Why patients drop off:
          </strong>
          <span>
            Misplaced paper discharge slips, false sense of recovery after early symptom relief, and no closed-loop follow-up safety net.
          </span>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
