import React, { useState } from 'react';
import { AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { AppointmentData } from '../../types';
import { formatDate } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useToast } from '../../contexts/ToastContext';
import { appointmentService } from '../../services/appointmentService';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentData | null;
  onRescheduleSuccess: () => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onRescheduleSuccess,
}) => {
  if (!appointment) return null;

  const [selectedDate, setSelectedDate] = useState(appointment.scheduledDate);
  const [selectedTime, setSelectedTime] = useState(appointment.scheduledTime || '10:30 AM');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const { success, error } = useToast();

  const timeSlots = [
    '09:00 AM',
    '09:30 AM',
    '10:30 AM',
    '11:30 AM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
  ];

  const windowStart = appointment.followUpWindow?.start || appointment.scheduledDate;
  const windowEnd = appointment.followUpWindow?.end || appointment.scheduledDate;

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSelectedDate(val);

    if (val < windowStart || val > windowEnd) {
      setValidationError(
        `Please select a date within your recommended follow-up window (${formatDate(
          windowStart
        )} – ${formatDate(windowEnd)}).`
      );
    } else {
      setValidationError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      setValidationError('Please select a date and time slot.');
      return;
    }

    if (selectedDate < windowStart || selectedDate > windowEnd) {
      setValidationError(
        `Please select a date within your recommended follow-up window (${formatDate(
          windowStart
        )} – ${formatDate(windowEnd)}).`
      );
      return;
    }

    setLoading(true);
    try {
      await appointmentService.rescheduleAppointment(appointment.appointmentId, {
        newDate: selectedDate,
        newTime: selectedTime,
        reason,
      });

      success(
        `Appointment rescheduled to ${formatDate(selectedDate)} at ${selectedTime}. Updated reminder timeline activated!`,
        'Rescheduled Successfully'
      );
      onRescheduleSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to reschedule appointment.';
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reschedule Follow-Up Consultation"
      subtitle={`Current Appointment: ${formatDate(appointment.scheduledDate)} at ${appointment.scheduledTime}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Recommended Follow-Up Window Notice */}
        <div className="p-3.5 rounded-xl bg-brand-50 border border-brand-200 text-brand-900 text-xs leading-relaxed">
          <div className="font-bold flex items-center gap-1.5 mb-1 text-brand-800">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            Recommended Clinical Follow-Up Window
          </div>
          <p className="text-brand-800">
            Based on your discharge care plan for{' '}
            <strong className="text-brand-950">{appointment.type}</strong>, your recommended window is:
          </p>
          <div className="mt-1 font-bold text-brand-950 font-mono">
            {formatDate(windowStart)} – {formatDate(windowEnd)}
          </div>
        </div>

        {/* Date Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
            Choose Preferred Date
          </label>
          <input
            type="date"
            min={windowStart}
            max={windowEnd}
            value={selectedDate}
            onChange={handleDateChange}
            required
            className="w-full h-10 rounded-xl border border-slate-300 px-3 text-sm font-medium text-slate-900 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
          />
          {validationError && (
            <p className="text-xs text-red-600 font-semibold mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {validationError}
            </p>
          )}
        </div>

        {/* Available Time Slots */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
            Select Time Slot
          </label>
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedTime(slot)}
                className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                  selectedTime === slot
                    ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Reason / Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
            Reason for Rescheduling (Optional)
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Work conflict, transportation arrangement"
            className="w-full h-10 rounded-xl border border-slate-300 px-3 text-xs text-slate-900 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Keep Current
          </Button>
          <Button
            variant="primary"
            size="md"
            type="submit"
            isLoading={loading}
            disabled={!!validationError}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Confirm New Appointment
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RescheduleModal;
