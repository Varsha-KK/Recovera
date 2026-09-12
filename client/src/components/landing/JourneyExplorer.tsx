import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Stethoscope,
  FileCheck,
  CalendarClock,
  Activity,
  CalendarCheck2,
  HeartHandshake,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { fadeUp } from '../../utils/motion';

export const JourneyExplorer: React.FC = () => {
  const [activeStep, setActiveStep] = useState(2);

  const milestones = [
    {
      id: 0,
      name: 'Diagnosis',
      timeframe: 'Day 0',
      title: 'Clinical Diagnosis & Inpatient Care',
      summary: 'Patient receives primary diagnosis and inpatient treatment. Clinical discharge parameters are established.',
      patientView: 'Diagnosis documented in health portal with discharge summary.',
      hospitalView: 'Care plan CP-1001 initialized with recommended 10–14 day follow-up window.',
      icon: Stethoscope,
      status: 'COMPLETED',
    },
    {
      id: 1,
      name: 'Discharge',
      timeframe: 'Day 2',
      title: 'Discharge & Care Plan Activation',
      summary: 'Digital care plan activated with recommended follow-up dates, prescription schedule, and required diagnostic panels.',
      patientView: 'Prescription list and calendar milestone sync active in patient portal.',
      hospitalView: 'Patient profile established; baseline risk calculated; reminder sequence queued.',
      icon: FileCheck,
      status: 'COMPLETED',
    },
    {
      id: 2,
      name: 'Follow-Up',
      timeframe: 'Day 5',
      title: '72h Multi-Channel Outreach',
      summary: 'Automated 2-way SMS check-in verifies prescription fill and reminds patient of upcoming consultation slot.',
      patientView: 'SMS reminder delivered with 1-click confirmation link.',
      hospitalView: 'SMS delivered via Exotel. Status: DELIVERED. Attendance unconfirmed.',
      icon: CalendarClock,
      status: 'IN_PROGRESS',
    },
    {
      id: 3,
      name: 'Test',
      timeframe: 'Day 9',
      title: 'Pre-Visit Diagnostic Testing',
      summary: 'Pre-consultation lab tests (e.g. fasting blood sugar, renal panel, or sputum test) requested 48 hours prior.',
      patientView: 'Notification: "Please complete fasting blood panel at City Care Lab by Aug 23."',
      hospitalView: 'Test order tracked. Status: PENDING LAB RESULT.',
      icon: Activity,
      status: 'UPCOMING',
    },
    {
      id: 4,
      name: 'Appointment',
      timeframe: 'Day 12',
      title: 'Clinical Checkup Consultation',
      summary: 'Patient attends follow-up with attending physician. Vitals reviewed, lab panels interpreted, and medication titrated.',
      patientView: 'Appointment confirmed with Dr. Sarah Jenkins at 10:30 AM.',
      hospitalView: 'Consultation conducted. Attendance verified in Recovera dashboard.',
      icon: CalendarCheck2,
      status: 'UPCOMING',
    },
    {
      id: 5,
      name: 'Recovery',
      timeframe: 'Day 30+',
      title: 'Care Loop Closed & Ongoing Adherence',
      summary: 'Post-discharge recovery milestone reached. Long-term drop-off prevented, reducing 30-day readmission risk.',
      patientView: 'Care milestone completed ✓. Next routine checkup scheduled in 3 months.',
      hospitalView: 'Care loop successfully closed. Patient risk mitigated.',
      icon: HeartHandshake,
      status: 'UPCOMING',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Interactive Care Path</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 tracking-tight">
            One patient. One care journey.
          </h2>

          <p className="text-base text-slate-600 leading-relaxed">
            Follow the standardized progression from hospital discharge to recovery completion
          </p>
        </div>

        {/* Milestone Indicator Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 max-w-5xl mx-auto mb-10">
          {milestones.map((m, idx) => {
            const Icon = m.icon;
            const isSelected = activeStep === idx;
            return (
              <button
                key={m.name}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'bg-teal-50/70 border-teal-600 shadow-sm ring-1 ring-teal-600/20'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isSelected
                        ? 'bg-teal-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-slate-400">
                    {m.timeframe}
                  </span>
                </div>

                <div>
                  <div
                    className={`text-xs font-bold ${
                      isSelected ? 'text-teal-900' : 'text-slate-700'
                    }`}
                  >
                    {m.name}
                  </div>
                  <div className="text-[10px] text-slate-500 capitalize">{m.status.toLowerCase()}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detailed Milestone Inspector Box */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="p-6 sm:p-8 rounded-3xl bg-slate-50/90 border border-slate-200 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-5 mb-5">
                <div>
                  <span className="text-[11px] font-mono font-bold text-teal-700 uppercase tracking-wider">
                    Milestone {activeStep + 1} of 6 • {milestones[activeStep].timeframe}
                  </span>
                  <h3 className="text-xl font-bold font-display text-slate-900 mt-0.5">
                    {milestones[activeStep].title}
                  </h3>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-slate-700 border border-slate-200 shadow-2xs self-start sm:self-center">
                  Status: {milestones[activeStep].status}
                </span>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                {milestones[activeStep].summary}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-1.5 shadow-2xs">
                  <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">
                    Patient Experience
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">
                    {milestones[activeStep].patientView}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-1.5 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                    Hospital Coordination Feed
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">
                    {milestones[activeStep].hospitalView}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default JourneyExplorer;
