import React from 'react';
import { Pill, CheckCircle2, Clock } from 'lucide-react';
import { Medication } from '../../types';

export const MedicationList: React.FC<{ medications?: Medication[] }> = ({ medications = [] }) => {
  if (medications.length === 0) {
    return (
      <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500">
        No active discharge medications recorded.
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Pill className="w-4 h-4 text-brand-600" />
          Active Medication Regimen
        </h3>
        <span className="text-xs text-slate-400 font-mono">{medications.length} Prescriptions</span>
      </div>

      <div className="space-y-3">
        {medications.map((med, i) => (
          <div
            key={i}
            className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold shrink-0">
                Rx
              </div>
              <div>
                <span className="font-bold text-slate-900 block">{med.name}</span>
                <span className="text-slate-500 text-[11px]">{med.dosage} • {med.frequency}</span>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
              ACTIVE
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
