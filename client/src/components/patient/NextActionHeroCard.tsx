import React, { useState } from 'react';
import {
  CheckCircle2,
  CalendarDays,
  Building2,
  User,
  Clock,
  Sparkles,
  PhoneCall,
  MessageSquare,
  Bell,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppointmentData } from '../../types';
import { formatDate } from '../../utils/formatters';
import { Button } from '../common/Button';

interface NextActionHeroCardProps {
  appointment: AppointmentData | null;
  onConfirm: () => Promise<void>;
  onReschedule: () => void;
  onCancel: () => void;
}

export const NextActionHeroCard: React.FC<NextActionHeroCardProps> = ({
  appointment,
  onConfirm,
  onReschedule,
  onCancel,
}) => {
  const [confirming, setConfirming] = useState(false);

  const handleConfirmClick = async () => {
    setConfirming(true);
    try {
      await onConfirm();
      confetti({
        particleCount: 70,
        spread: 55,
        origin: { y: 0.65 },
        colors: ['#0284C7', '#0369A1', '#2563EB', '#10B981'],
      });
    } finally {
      setConfirming(false);
    }
  };

  if (!appointment) {
    return (
      <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs text-center">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold font-display text-slate-900 mb-1">You are all caught up!</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          No urgent follow-up consultations scheduled right now. Your care coordinator will notify you of upcoming milestones.
        </p>
      </div>
    );
  }

  const isConfirmed = appointment.status === 'CONFIRMED';
  const isRescheduled = appointment.status === 'RESCHEDULED';
  const isOverdue = appointment.isOverdue;

  return (
    <div
      className={`rounded-2xl p-6 sm:p-7 bg-white border shadow-xs transition-all ${
        isOverdue ? 'border-red-300 ring-1 ring-red-200' : 'border-slate-200'
      }`}
    >
      {/* Top Banner Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-800 flex items-center gap-1.5 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" /> Your Scheduled Priority Step
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isOverdue && (
            <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> OVERDUE
            </span>
          )}
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${
              isConfirmed
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : isRescheduled
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : 'bg-brand-50 text-brand-700 border-brand-200'
            }`}
          >
            {appointment.status}
          </span>
        </div>
      </div>

      {/* Main Appointment Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-2xl font-bold font-display text-slate-900 tracking-tight">
            {appointment.type}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm pt-1">
            <div className="flex items-center gap-2.5 text-slate-700">
              <Building2 className="w-4 h-4 text-brand-600 shrink-0" />
              <span>{appointment.hospital || 'City Care Hospital'} ({appointment.department})</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700">
              <User className="w-4 h-4 text-brand-600 shrink-0" />
              <span>Dr. {appointment.doctorName}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-900 font-bold">
              <CalendarDays className="w-4 h-4 text-brand-600 shrink-0" />
              <span>{formatDate(appointment.scheduledDate)}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-900 font-bold">
              <Clock className="w-4 h-4 text-brand-600 shrink-0" />
              <span>{appointment.scheduledTime}</span>
            </div>
          </div>

          {appointment.followUpWindow && appointment.followUpWindow.start && (
            <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 mt-2">
              Recommended Clinical Window: <strong className="text-slate-900">{formatDate(appointment.followUpWindow.start)} – {formatDate(appointment.followUpWindow.end)}</strong>
            </div>
          )}
        </div>

        {/* Action Controls Box */}
        <div className="flex flex-col justify-center gap-2.5 p-5 rounded-xl bg-slate-50 border border-slate-200">
          {!isConfirmed ? (
            <Button
              variant="primary"
              size="md"
              className="w-full text-xs sm:text-sm shadow-xs"
              isLoading={confirming}
              onClick={handleConfirmClick}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              I'll Attend Consultation
            </Button>
          ) : (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center text-xs font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Attendance Confirmed ✓
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onReschedule}
              className="text-xs"
            >
              Reschedule
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-red-600 hover:bg-red-50 text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Reminder Schedule Timeline attached to Appointment */}
      {appointment.reminderTimeline && appointment.reminderTimeline.length > 0 && (
        <div className="pt-4 border-t border-slate-100">
          <div className="text-xs font-bold text-slate-600 mb-3 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-brand-600" /> Automated Care Outreach Schedule
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {appointment.reminderTimeline.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-700 border border-brand-200 flex items-center justify-center shrink-0">
                    {item.channel === 'SMS' && <MessageSquare className="w-3.5 h-3.5" />}
                    {item.channel === 'VOICE' && <PhoneCall className="w-3.5 h-3.5" />}
                    {item.channel === 'PUSH' && <Bell className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">{item.formattedDate}</div>
                    <div className="text-[10px] text-slate-500">{item.title}</div>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    item.status === 'SENT' || item.status === 'DELIVERED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : item.status === 'CANCELLED'
                      ? 'bg-slate-100 text-slate-400'
                      : 'bg-brand-50 text-brand-700 border border-brand-200'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NextActionHeroCard;
