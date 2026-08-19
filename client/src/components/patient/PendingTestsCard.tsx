import React from 'react';
import { Activity, CheckCircle2 } from 'lucide-react';
import { CarePlanMilestone } from '../../types';
import { formatDate } from '../../utils/formatters';

export const PendingTestsCard: React.FC<{ tests: CarePlanMilestone[] }> = ({ tests }) => {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-600" />
          Pre-Consultation Diagnostic Tests
        </h3>
        <span className="text-xs text-slate-400 font-mono">{tests.length} Required</span>
      </div>

      {tests.length === 0 ? (
        <div className="text-center py-4 text-xs text-slate-500">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
          All required laboratory panels are completed.
        </div>
      ) : (
        <div className="space-y-3">
          {tests.map((test, i) => (
            <div
              key={test.milestoneId || i}
              className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                test.status === 'OVERDUE'
                  ? 'bg-red-50 border-red-200 text-red-950'
                  : 'bg-slate-50 border-slate-100 text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold shrink-0">
                  Lab
                </div>
                <div>
                  <span className="font-bold block">{test.title}</span>
                  <span className="text-slate-500 text-[11px]">Due by {formatDate(test.dueDate)}</span>
                </div>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                  test.status === 'OVERDUE'
                    ? 'bg-red-100 text-red-800 border-red-300'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {test.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingTestsCard;
