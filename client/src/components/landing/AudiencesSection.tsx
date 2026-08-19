import React from 'react';
import { motion } from 'motion/react';
import {
  HeartPulse,
  Building2,
  CheckCircle2,
  CalendarCheck,
  BellRing,
  ShieldAlert,
  Users,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';
import { fadeUp, staggerContainer } from '../../utils/motion';

export const AudiencesSection: React.FC = () => {
  const patientPoints = [
    "Know exactly what's next in your recovery",
    'Never miss important clinical checkups or prescription refills',
    'Manage, confirm, and reschedule appointments within safe clinical windows',
    'Receive timely SMS, voice, and push notifications with zero spam',
    'Track diagnostic test requirements and overall recovery milestones',
  ];

  const hospitalPoints = [
    'Identify high-risk drop-off patients before complications develop',
    'Prioritize care coordinator daily outreach by urgency and clinical window',
    'Track overdue follow-ups, pending labs, and no-shows in real time',
    'Manage multi-channel outreach without manual spreadsheet tracking',
    'Close the transitional care loop and reduce 30-day hospital readmissions',
  ];

  return (
    <section id="for-both" className="py-20 md:py-28 bg-slate-50/60 border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
            <Users className="w-3.5 h-3.5 text-teal-600" />
            <span>Dual-Sided Transitional Care</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 tracking-tight">
            Built for both sides of care
          </h2>

          <p className="text-base text-slate-600 leading-relaxed">
            Empowering patients with clear guidance while giving hospital care coordinators
            real-time visibility and prioritization tools.
          </p>
        </div>

        {/* 2 Big Clean Cards: Patients vs Hospitals */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto"
        >
          {/* Patients Card */}
          <motion.div
            id="for-patients"
            variants={fadeUp}
            className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div>
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200/80 flex items-center justify-center">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block font-mono">
                    Patient Portal
                  </span>
                  <h3 className="text-2xl font-bold font-display text-slate-900">
                    For Patients
                  </h3>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                A calm, mobile-first experience that turns confusing discharge instructions into simple, manageable steps.
              </p>

              <ul className="space-y-3 mb-8">
                {patientPoints.map((pt) => (
                  <li key={pt} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Self-Service Care Portal</span>
              <Link to="/login">
                <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Patient Login
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Hospitals Card */}
          <motion.div
            id="for-hospitals"
            variants={fadeUp}
            className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div>
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200/80 flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block font-mono">
                    Clinical Care Team
                  </span>
                  <h3 className="text-2xl font-bold font-display text-slate-900">
                    For Hospitals & Coordinators
                  </h3>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                A command center giving care coordinators instant triage over patients needing urgent outreach and follow-up.
              </p>

              <ul className="space-y-3 mb-8">
                {hospitalPoints.map((pt) => (
                  <li key={pt} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Hospital Coordination Suite</span>
              <Link to="/login">
                <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Staff Portal
                </Button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default AudiencesSection;
