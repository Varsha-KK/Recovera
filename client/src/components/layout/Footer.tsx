import React from 'react';
import { Link } from 'react-router-dom';
import { RecoveraLogo } from '../common/RecoveraLogo';
import { ShieldCheck, HeartPulse, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800 py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <RecoveraLogo size="md" variant="white" />
            </Link>
            <p className="text-sm text-slate-300 max-w-md leading-relaxed font-medium">
              "From diagnosis to recovery, we don't lose the patient."
            </p>
            <p className="text-xs text-teal-300 font-mono tracking-wide">
              Predict. Prioritize. Remind. Follow through.
            </p>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Intelligent post-discharge care coordination preventing patient drop-off through rule-based risk prioritization, multi-channel reminders, and closed-loop adherence tracking.
            </p>
          </div>

          {/* Platform Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Hospital Care Dashboard
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Patient Self-Service Portal
                </Link>
              </li>
              <li>
                <a href="/#solution" className="hover:text-white transition-colors">
                  Closed-Loop Care Model
                </a>
              </li>
              <li>
                <a href="/#for-hospitals" className="hover:text-white transition-colors">
                  Hospital Risk Triage
                </a>
              </li>
              <li>
                <a href="/#for-patients" className="hover:text-white transition-colors">
                  Patient Timeline & Reminders
                </a>
              </li>
            </ul>
          </div>

          {/* Integrations & Security Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Technology & Security
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>PostgreSQL + Prisma ORM</li>
              <li>Twilio Programmable SMS</li>
              <li>Twilio Voice Call Telephony</li>
              <li>ElevenLabs Voice AI Model</li>
              <li>VAPID Web Push Alerts</li>
              <li>Role-Based Access Control</li>
            </ul>
          </div>
        </div>

        {/* Regulatory Disclaimer & Copyright */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Recovera Inc. All rights reserved.</p>
          <div className="flex items-center gap-2 text-slate-400 text-right max-w-xl text-[11px] leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
            <span>
              Recovera is an administrative transitional care management platform. It does not provide medical diagnoses, alter prescriptions, or replace clinical judgment.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
