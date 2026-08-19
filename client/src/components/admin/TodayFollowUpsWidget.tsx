import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getStatusBadgeColor } from '../../utils/formatters';

interface TodayFollowUpsWidgetProps {
  followUps: {
    appointmentId: string;
    patientId: string;
    patientName: string;
    time: string;
    type: string;
    department: string;
    status: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    riskScore: number;
  }[];
}

export const TodayFollowUpsWidget: React.FC<TodayFollowUpsWidgetProps> = ({ followUps }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Today's Clinic Follow-Ups</h3>
          <p className="text-xs text-slate-500">Live Outpatient Schedule & Attendance Tracker</p>
        </div>
        <Link to="/admin/appointments?filter=TODAY">
          <span className="text-xs font-bold text-brand-700 hover:underline flex items-center gap-1">
            View Hub ({followUps.length}) <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </div>

      {followUps.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-500">
          No appointments scheduled for today.
        </div>
      ) : (
        <div className="space-y-3">
          {followUps.map((appt) => (
            <Link
              key={appt.appointmentId}
              to={`/admin/patients/${appt.patientId}`}
              className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between gap-3 text-xs transition-all block group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 font-mono font-bold text-slate-800 flex items-center justify-center shrink-0">
                  {appt.time.split(' ')[0]}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 group-hover:text-brand-700 transition-colors">
                      {appt.patientName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">({appt.patientId})</span>
                    {appt.riskLevel === 'HIGH' && (
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="High Risk" />
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    {appt.type} • {appt.department}
                  </div>
                </div>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border shrink-0 ${getStatusBadgeColor(
                  appt.status
                )}`}
              >
                {appt.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodayFollowUpsWidget;
