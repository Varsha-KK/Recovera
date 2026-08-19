import React, { useState } from 'react';
import { AlertTriangle, CalendarDays, HeartHandshake, XCircle } from 'lucide-react';
import { AppointmentData } from '../../types';
import { formatDate } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useToast } from '../../contexts/ToastContext';
import { appointmentService } from '../../services/appointmentService';

interface CancelConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentData | null;
  onCancelSuccess: () => void;
  onOpenReschedule: () => void;
}

export const CancelConfirmModal: React.FC<CancelConfirmModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onCancelSuccess,
  onOpenReschedule,
}) => {
  if (!appointment) return null;

  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'CONFIRM' | 'RECOVERY'>('CONFIRM');

  const { success, error } = useToast();

  const handleCancelSubmit = async () => {
    setLoading(true);
    try {
      await appointmentService.cancelAppointment(appointment.appointmentId, reason);
      success('Appointment cancelled. Reminder schedule paused.', 'Status Updated');
      setStep('RECOVERY');
      onCancelSuccess();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to cancel appointment.');
    } finally {
      setLoading(false);
    }
  };

  const handleChooseNewDate = () => {
    onClose();
    onOpenReschedule();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 'CONFIRM' ? 'Cancel Follow-Up Appointment?' : 'Stay Connected to Your Care'}
      maxWidth="sm"
    >
      {step === 'CONFIRM' ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-950 text-xs">
            <div className="flex items-center gap-2 font-bold text-red-800 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>Current Appointment Details</span>
            </div>
            <p className="text-slate-800">
              <strong>{appointment.type}</strong> on {formatDate(appointment.scheduledDate)} at{' '}
              {appointment.scheduledTime} with Dr. {appointment.doctorName}.
            </p>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Missing scheduled follow-ups increases the risk of complications. If this time is inconvenient, we encourage you to reschedule instead of cancelling.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Reason for Cancellation
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Scheduling conflict, transportation arrangement"
              className="w-full h-10 rounded-xl border border-slate-300 px-3 text-xs text-slate-900 focus:border-red-600 focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={onClose}>
              Keep Appointment
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={loading}
              onClick={handleCancelSubmit}
              leftIcon={<XCircle className="w-4 h-4" />}
            >
              Cancel Appointment
            </Button>
          </div>
        </div>
      ) : (
        /* Retention Recovery Step */
        <div className="text-center space-y-4 py-2">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <HeartHandshake className="w-6 h-6" />
          </div>

          <div>
            <h4 className="text-base font-bold text-slate-900">
              Would you like to choose a new follow-up date?
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Your clinical care team recommends completing this checkup before{' '}
              {formatDate(appointment.followUpWindow?.end)}.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Button
              variant="primary"
              size="md"
              onClick={handleChooseNewDate}
              leftIcon={<CalendarDays className="w-4 h-4" />}
            >
              Choose New Follow-Up Date
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              I'll Do It Later
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CancelConfirmModal;
