import React from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, PhoneCall, MessageSquare, ArrowRight } from 'lucide-react';
import { PatientProfileData } from '../../types';
import { formatDate } from '../../utils/formatters';
import { Button } from '../common/Button';

interface PatientsNeedingAttentionProps {
  patients: PatientProfileData[];
  onTriggerSms: (patient: PatientProfileData) => void;
  onTriggerVoice: (patient: PatientProfileData) => void;
}

export const PatientsNeedingAttention: React.FC<PatientsNeedingAttentionProps> = ({
  patients,
  onTriggerSms,
  onTriggerVoice,
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-red-200 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center">
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Patients Needing Staff Attention</h3>
            <p className="text-xs text-slate-500">
              High-Risk & Overdue Follow-Up Interventions (Priority Ranked)
            </p>
          </div>
        </div>

        <Link to="/admin/patients?riskLevel=HIGH">
          <Button variant="ghost" size="sm" className="text-xs text-red-700 hover:bg-red-50" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            View All High-Risk ({patients.length})
          </Button>
        </Link>
      </div>

      {patients.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-500">
          No patients currently flagged for urgent attention.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((p) => (
            <div
              key={p.patientId}
              className="p-4 rounded-xl bg-red-50/40 border border-red-200 hover:border-red-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{p.name}</span>
                    <span className="text-xs font-mono text-slate-500">({p.patientId})</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300 text-[10px] font-bold">
                    Risk: {p.riskScore}%
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-800 mb-1">{p.diagnosis}</div>
                <div className="text-xs text-slate-500 mb-3">
                  Primary: Dr. {p.primaryDoctor} • Discharged {formatDate(p.dischargeDate)}
                </div>

                {p.riskFactors && p.riskFactors.length > 0 && (
                  <div className="mb-4 text-xs text-red-900 bg-red-100/60 p-2.5 rounded-xl border border-red-200">
                    <strong>Flag:</strong> {p.riskFactors[0]}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-red-200/60 flex items-center justify-between gap-2">
                <Link to={`/admin/patients/${p.patientId}`} className="flex-1">
                  <button className="w-full text-center py-1.5 px-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-xs">
                    Patient Profile
                  </button>
                </Link>

                <button
                  onClick={() => onTriggerSms(p)}
                  title="Send Quick SMS"
                  className="p-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onTriggerVoice(p)}
                  title="Trigger Voice Reminder Call"
                  className="p-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientsNeedingAttention;
