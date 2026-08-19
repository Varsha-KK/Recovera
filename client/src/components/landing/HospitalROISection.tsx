import React from 'react';
import { DollarSign, TrendingDown, Users, Activity, CheckCircle2 } from 'lucide-react';

export const HospitalROISection: React.FC = () => {
  return (
    <section id="roi" className="py-20 md:py-28 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Economic & Clinical ROI</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 tracking-tight">
            Preventing care drop-off saves lives and hospital resources
          </h2>
          <p className="text-base text-slate-600">
            Recovera turns missed checkups into completed consultations and reduces preventable 30-day readmissions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-lg">
              87%
            </div>
            <h3 className="text-lg font-bold text-slate-900">Follow-Up Completion</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Increases completed post-discharge checkups from an unassisted baseline of 58% to 87.4% through multi-channel reminders and smart rescheduling.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-lg">
              -71%
            </div>
            <h3 className="text-lg font-bold text-slate-900">Drop-Off Reduction</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Drastically reduces drop-off rates across chronic disease cohorts (Diabetes: 42% down to 11%, Tuberculosis: 48% down to 8%).
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-lg">
              3.4x
            </div>
            <h3 className="text-lg font-bold text-slate-900">Coordinator Efficiency</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Care coordinators focus exclusively on prioritized high-risk patients instead of making hundreds of manual reminder calls.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
