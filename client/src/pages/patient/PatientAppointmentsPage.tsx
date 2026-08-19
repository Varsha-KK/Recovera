import React, { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { appointmentService } from '../../services/appointmentService';
import { patientService } from '../../services/patientService';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { RescheduleModal } from '../../components/patient/RescheduleModal';
import { CancelConfirmModal } from '../../components/patient/CancelConfirmModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { AppointmentData } from '../../types';
import { formatDate, getStatusBadgeColor } from '../../utils/formatters';
import {
  CalendarDays,
  Clock,
  Building2,
  User,
  CheckCircle2,
} from 'lucide-react';

export const PatientAppointmentsPage: React.FC = () => {
  const { success, error } = useToast();

  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Selected appointment for modal action
  const [selectedAppt, setSelectedAppt] = useState<AppointmentData | null>(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const fetchAppointments = async () => {
    try {
      const res = await appointmentService.getAppointments();
      setAppointments(res.data);
    } catch (err: any) {
      error('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleConfirm = async (apptId: string) => {
    try {
      const res = await patientService.confirmAttendance(apptId);
      success(res.message, 'Attendance Confirmed');
      fetchAppointments();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to confirm attendance.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 min-w-0 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
                Follow-Up Appointments
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Manage your scheduled clinical checkups, confirmations, and follow-up window preferences
              </p>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner label="Loading your appointment history..." />
          ) : appointments.length === 0 ? (
            <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center">
              <CalendarDays className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold font-display text-slate-900 mb-1">No Appointments Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You do not have any active or past follow-up appointments recorded.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {appointments.map((appt) => {
                const isConfirmed = appt.status === 'CONFIRMED';
                const isCompleted = appt.status === 'COMPLETED';
                const isCancelled = appt.status === 'CANCELLED';

                return (
                  <div
                    key={appt.appointmentId}
                    className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-slate-300 transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-3 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusBadgeColor(
                            appt.status
                          )}`}
                        >
                          {appt.status}
                        </span>
                        <span className="text-xs font-mono font-medium text-slate-400">
                          ID: {appt.appointmentId}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold font-display text-slate-900">{appt.type}</h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-brand-600" />
                          <span>{appt.hospital || 'City Care Hospital'} ({appt.department})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-brand-600" />
                          <span>Dr. {appt.doctorName}</span>
                        </div>
                        <div className="flex items-center gap-2 font-bold text-slate-900">
                          <CalendarDays className="w-3.5 h-3.5 text-brand-600" />
                          <span>{formatDate(appt.scheduledDate)}</span>
                        </div>
                        <div className="flex items-center gap-2 font-bold text-slate-900">
                          <Clock className="w-3.5 h-3.5 text-brand-600" />
                          <span>{appt.scheduledTime}</span>
                        </div>
                      </div>

                      {appt.followUpWindow && (
                        <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          Recommended Window: <strong className="text-slate-900">{formatDate(appt.followUpWindow.start)} – {formatDate(appt.followUpWindow.end)}</strong>
                        </div>
                      )}
                    </div>

                    {/* Action Controls */}
                    {!isCompleted && !isCancelled && (
                      <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:w-44 shrink-0">
                        {!isConfirmed && (
                          <Button
                            variant="primary"
                            size="sm"
                            className="w-full text-xs"
                            onClick={() => handleConfirm(appt.appointmentId)}
                            leftIcon={<CheckCircle2 className="w-4 h-4" />}
                          >
                            I'll Attend
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => {
                            setSelectedAppt(appt);
                            setRescheduleOpen(true);
                          }}
                        >
                          Reschedule
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-xs text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setSelectedAppt(appt);
                            setCancelOpen(true);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <RescheduleModal
        isOpen={rescheduleOpen}
        onClose={() => setRescheduleOpen(false)}
        appointment={selectedAppt}
        onRescheduleSuccess={fetchAppointments}
      />

      <CancelConfirmModal
        isOpen={cancelOpen}
        onClose={() => setCancelOpen(false)}
        appointment={selectedAppt}
        onCancelSuccess={fetchAppointments}
        onOpenReschedule={() => setRescheduleOpen(true)}
      />
    </div>
  );
};

export default PatientAppointmentsPage;
