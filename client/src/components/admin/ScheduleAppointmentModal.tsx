import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { PatientProfileData } from '../../types';
import { formatDate } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useToast } from '../../contexts/ToastContext';
import { appointmentService } from '../../services/appointmentService';

interface ScheduleAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfileData | null;
  onScheduleSuccess: () => void;
}

export const ScheduleAppointmentModal: React.FC<ScheduleAppointmentModalProps> = ({
  isOpen,
  onClose,
  patient,
  onScheduleSuccess,
}) => {
  if (!patient) return null;

  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:30 AM');
  const [type, setType] = useState('Post-Discharge Clinical Follow-Up');
  const [doctorName, setDoctorName] = useState(patient.primaryDoctor || 'Dr. Sarah Jenkins');
  const [department, setDepartment] = useState(patient.department || 'General Medicine');
  const [patientNotes, setPatientNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const { success, error } = useToast();

  const timeSlots = ['09:00 AM', '09:30 AM', '10:30 AM', '11:30 AM', '02:00 PM', '03:00 PM', '04:00 PM'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      error('Please select an appointment date.');
      return;
    }

    setLoading(true);
    try {
      await appointmentService.createAppointment({
        patientId: patient.patientId,
        doctorName,
        department,
        type,
        scheduledDate: date,
        scheduledTime: time,
        patientNotes,
      });

      success(
        `Follow-up consultation scheduled for ${formatDate(date)} at ${time}. Multi-channel reminder timeline activated.`,
        'Appointment Scheduled'
      );
      onScheduleSuccess();
      onClose();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to schedule appointment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Follow-Up Consultation"
      subtitle={`Patient: ${patient.name} (${patient.patientId}) • ${patient.diagnosis}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
            Consultation Type
          </label>
          <input
            type="text"
            required
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full h-10 rounded-xl border border-slate-300 px-3 text-xs text-slate-900 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Physician
            </label>
            <input
              type="text"
              required
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-300 px-3 text-xs text-slate-900 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Department
            </label>
            <input
              type="text"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-300 px-3 text-xs text-slate-900 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
            Appointment Date
          </label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full h-10 rounded-xl border border-slate-300 px-3 text-sm font-medium text-slate-900 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
            Select Time Slot
          </label>
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setTime(slot)}
                className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                  time === slot
                    ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
            Clinical Notes / Instructions
          </label>
          <textarea
            rows={2}
            value={patientNotes}
            onChange={(e) => setPatientNotes(e.target.value)}
            placeholder="Special instructions for patient pre-visit..."
            className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            type="submit"
            isLoading={loading}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Schedule & Generate Reminders
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ScheduleAppointmentModal;
