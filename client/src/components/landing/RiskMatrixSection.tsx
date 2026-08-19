import React from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, XCircle, Sparkles } from 'lucide-react';

export const RiskMatrixSection: React.FC = () => {
  const factors = [
    {
      code: 'BASELINE_SEVERITY',
      name: 'Baseline Disease Severity',
      points: '+25 pts',
      description: 'Acute conditions (CABG, TB DOTS, unstable diabetes) have higher inherent complication risks.',
    },
    {
      code: 'MISSED_APPOINTMENT',
      name: 'Previous Missed Appointment / No-Show',
      points: '+30 pts',
      description: 'Historical non-attendance strongly predicts future drop-off without active intervention.',
    },
    {
      code: 'OVERDUE_FOLLOW_UP',
      name: 'Elapsed Follow-Up Window',
      points: '+35 pts',
      description: 'Patient is past their clinically recommended consultation window.',
    },
    {
      code: 'PENDING_LAB_TEST',
      name: 'Pending Pre-Consultation Diagnostic Panel',
      points: '+15 pts',
      description: 'Required laboratory tests (e.g. HbA1c, sputum test) remain uncompleted.',
    },
    {
      code: 'CONFIRMED_ATTENDANCE',
      name: 'Explicit Attendance Confirmation',
      points: '-30 pts',
      description: 'Patient confirms appointment in Recovera portal, significantly reducing drop-off risk.',
    },
  ];

  return (
    <section id="risk-engine" className="py-20 md:py-28 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Explainable Scoring Engine</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 tracking-tight">
            Transparent, rule-based Care Follow-Up Risk Scores
          </h2>
          <p className="text-base text-slate-600">
            Recovera calculates a 0–100 risk score based on transparent behavioral and clinical factors — never a black box.
          </p>
        </div>

        {/* Risk Level Bands */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-3xl bg-white border border-emerald-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Low Risk</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                0 – 30 pts
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Standard Monitoring</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Standard automated SMS and app reminders. Patient is on schedule and adhering to care milestones.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-amber-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Medium Risk</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                31 – 60 pts
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Active Multi-Channel</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Multi-channel sequence including natural voice reminders 24h prior and proactive transportation check.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-rose-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">High Risk</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                61 – 100 pts
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Priority Coordinator Alert</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Patient flagged on care coordinator attention queue for direct clinical outreach and recovery support.
            </p>
          </div>
        </div>

        {/* Explainable Factor Breakdown */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <h3 className="text-lg font-bold font-display text-slate-900 mb-6">
            Risk Factor Weighting Matrix
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {factors.map((f) => (
              <div
                key={f.code}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-slate-900">{f.name}</span>
                    <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      {f.points}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
