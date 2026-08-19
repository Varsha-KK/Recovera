import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentService } from '../../services/appointmentService';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { RescheduleModal } from '../../components/patient/RescheduleModal';
import { CancelConfirmModal } from '../../components/patient/CancelConfirmModal';
import { AppointmentData } from '../../types';
import { formatDate, getStatusBadgeColor } from '../../utils/formatters';
import {
  CalendarDays,
  Search,
  CheckCircle2,
  AlertTriangle,
  Building2,
  User,
  Clock,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const AdminAppointmentsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filters
  const [filter, setFilter] = useState<'ALL' | 'TODAY' | 'TOMORROW' | 'THIS_WEEK' | 'OVERDUE'>('ALL');
  const [status, setStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  // Modals
  const [selectedAppt, setSelectedAppt] = useState<AppointmentData | null>(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const { success, error } = useToast();

  const fetchAppointments = async () => {
    try {
      const res = await appointmentService.getAppointments({
        filter: filter !== 'ALL' ? filter : undefined,
        status: status !== 'ALL' ? status : undefined,
        search: search || undefined,
      });
      setAppointments(res.data);
    } catch (err: any) {
      error('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [filter, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAppointments();
  };

  const handleMarkCompleted = async (apptId: string) => {
    try {
      const res = await appointmentService.completeAppointment(apptId);
      success(res.message, 'Care Loop Closed ✓');
      fetchAppointments();
    } catch (err: any) {
      error('Failed to complete appointment.');
    }
  };

  const handleMarkNoShow = async (apptId: string) => {
    try {
      const res = await appointmentService.noShowAppointment(apptId);
      success(res.message, 'No-Show Escalated');
      fetchAppointments();
    } catch (err: any) {
      error('Failed to record no show.');
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
                Hospital Follow-Up Schedule
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Centralized consultation schedule, attendance verifications, and clinical window compliance
              </p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px]">
              <Input
                placeholder="Search patient, ID, doctor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                className="py-2 text-xs"
              />
            </form>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    filter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('TODAY')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    filter === 'TODAY' ? 'bg-white text-brand-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Due Today
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('THIS_WEEK')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    filter === 'THIS_WEEK' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  This Week
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('OVERDUE')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    filter === 'OVERDUE' ? 'bg-red-50 text-red-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Overdue
                </button>
              </div>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="ALL">All Statuses</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="RESCHEDULED">Rescheduled</option>
                <option value="COMPLETED">Completed</option>
                <option value="NO_SHOW">No Show</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Appointments Grid */}
          {loading ? (
            <LoadingSpinner label="Loading follow-up schedule..." />
          ) : appointments.length === 0 ? (
            <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center">
              <CalendarDays className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold font-display text-slate-900 mb-1">No Consultations Found</h3>
              <p className="text-xs text-slate-500">No appointments matched the current query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {appointments.map((a) => (
                <div
                  key={a.appointmentId}
                  className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-slate-300 transition-all"
                >
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusBadgeColor(
                          a.status
                        )}`}
                      >
                        {a.status}
                      </span>
                      {a.isOverdue && (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-xs font-bold border border-red-200">
                          OVERDUE
                        </span>
                      )}
                      <span className="text-xs font-mono text-slate-400">ID: {a.appointmentId}</span>
                    </div>

                    <div>
                      <Link
                        to={`/admin/patients/${a.patientId}`}
                        className="text-base font-bold text-slate-900 hover:text-brand-700 transition-colors"
                      >
                        {a.patientName}
                      </Link>
                      <div className="text-xs text-slate-500 font-bold">{a.type}</div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-3.5 h-3.5 text-brand-600" />
                        <span className="font-bold text-slate-900">{formatDate(a.scheduledDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-brand-600" />
                        <span className="font-bold text-slate-900">{a.scheduledTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{a.department}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Dr. {a.doctorName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Link to={`/admin/patients/${a.patientId}`}>
                      <Button variant="outline" size="sm" className="text-xs">
                        View Profile
                      </Button>
                    </Link>
                    {a.status !== 'COMPLETED' && (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleMarkCompleted(a.appointmentId)}
                          leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          className="text-xs"
                        >
                          Complete
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAppt(a);
                            setRescheduleOpen(true);
                          }}
                          className="text-xs"
                        >
                          Reschedule
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleMarkNoShow(a.appointmentId)}
                          leftIcon={<AlertTriangle className="w-3.5 h-3.5" />}
                          className="text-xs"
                        >
                          No-Show
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
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

export default AdminAppointmentsPage;
