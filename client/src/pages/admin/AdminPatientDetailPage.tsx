import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { appointmentService } from '../../services/appointmentService';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { RiskIndicator } from '../../components/common/RiskIndicator';
import { RescheduleModal } from '../../components/patient/RescheduleModal';
import { CancelConfirmModal } from '../../components/patient/CancelConfirmModal';
import { ScheduleAppointmentModal } from '../../components/admin/ScheduleAppointmentModal';
import { QuickCommunicationModal } from '../../components/admin/QuickCommunicationModal';
import { VoiceCallModal } from '../../components/voice/VoiceCallModal';
import { formatDate, getStatusBadgeColor, buildVoiceMessageText } from '../../utils/formatters';
import {
  CalendarDays,
  Clock,
  Building2,
  User,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  MessageSquare,
  PhoneCall,
  History,
  ArrowLeft,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const AdminPatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modals
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [commModalOpen, setCommModalOpen] = useState(false);
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [defaultCommChannel, setDefaultCommChannel] = useState<'SMS' | 'VOICE'>('SMS');

  // Selected appointment
  const [selectedAppt, setSelectedAppt] = useState<any>(null);

  const { success, error } = useToast();

  const fetchPatientDetails = async () => {
    if (!id) return;
    try {
      const data = await adminService.getPatientById(id);
      setPatientData(data);
      if (data.appointments && data.appointments.length > 0) {
        setSelectedAppt(data.appointments[0]);
      }
    } catch (err: any) {
      error('Failed to load patient profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientDetails();
  }, [id]);

  const handleRecalculateRisk = async () => {
    if (!id) return;
    try {
      const res = await adminService.recalculateRisk(id);
      success(res.message, 'Risk Recalculated');
      fetchPatientDetails();
    } catch (err: any) {
      error('Failed to recalculate risk.');
    }
  };

  const handleMarkConfirmed = async (apptId: string) => {
    try {
      await appointmentService.rescheduleAppointment(apptId, {
        newDate: selectedAppt.scheduledDate,
        newTime: selectedAppt.scheduledTime,
        reason: 'Confirmed by clinical care coordinator',
      });
      success('Appointment attendance marked as CONFIRMED.', 'Status Updated');
      fetchPatientDetails();
    } catch (err: any) {
      error('Failed to update status.');
    }
  };

  const handleMarkCompleted = async (apptId: string) => {
    try {
      const res = await appointmentService.completeAppointment(apptId);
      success(res.message, 'Care Loop Closed ✓');
      fetchPatientDetails();
    } catch (err: any) {
      error('Failed to mark completed.');
    }
  };

  const handleMarkNoShow = async (apptId: string) => {
    try {
      const res = await appointmentService.noShowAppointment(apptId);
      success(res.message, 'No-Show Flagged');
      fetchPatientDetails();
    } catch (err: any) {
      error('Failed to record no show.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner label="Loading clinical deep-dive profile..." size="lg" />
        </div>
      </div>
    );
  }

  const patient = patientData?.patient;
  const appointments = patientData?.appointments || [];
  const history = patientData?.appointmentHistory || [];
  const commLogs = patientData?.communicationLogs || [];
  const riskExplanation = patientData?.riskExplanation;

  const currentAppt = appointments.find(
    (a: any) => a.status === 'SCHEDULED' || a.status === 'CONFIRMED' || a.status === 'RESCHEDULED' || a.status === 'NO_SHOW'
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 min-w-0 space-y-6">
          {/* Top Back Navigation & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/admin/patients"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-brand-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Patient Directory
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDefaultCommChannel('SMS');
                  setCommModalOpen(true);
                }}
                leftIcon={<MessageSquare className="w-4 h-4 text-brand-600" />}
              >
                Send Reminder SMS
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCallModalOpen(true)}
                leftIcon={<PhoneCall className="w-4 h-4 text-white" />}
              >
                Call Patient (Twilio Voice)
              </Button>
            </div>
          </div>

          {/* Patient Clinical Overview Header */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
                {patient?.name?.slice(0, 2).toUpperCase()}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold font-display text-slate-900">{patient?.name}</h1>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono text-xs font-bold">
                    {patient?.patientId}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusBadgeColor(
                      patient?.status
                    )}`}
                  >
                    {patient?.status}
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-800">{patient?.diagnosis}</div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                  <span>{patient?.age} yrs • {patient?.gender}</span>
                  <span>Discharged: <strong className="text-slate-700">{formatDate(patient?.dischargeDate)}</strong></span>
                  <span>Attending: <strong className="text-slate-700">Dr. {patient?.primaryDoctor}</strong> ({patient?.department})</span>
                  <span>Phone: <strong className="text-slate-700">{patient?.phone}</strong></span>
                </div>
              </div>
            </div>

            {/* Risk Score Pill */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-4 shrink-0 self-start lg:self-center">
              <RiskIndicator
                score={patient?.riskScore || 20}
                level={patient?.riskLevel || 'LOW'}
                size="lg"
                showLabel={true}
              />
            </div>
          </div>

          {/* Explainable Risk Assessment Box */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-brand-600" />
                <div>
                  <h3 className="text-base font-bold font-display text-slate-900">Explainable Care Follow-Up Risk Model</h3>
                  <p className="text-xs text-slate-500">
                    Transparent rule-based factor weighting (Non-diagnostic administrative assessment)
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleRecalculateRisk}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Recalculate Score
              </Button>
            </div>

            {/* Summary statement */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-4 text-xs text-slate-700 leading-relaxed">
              <strong>Clinical Assessment Summary:</strong> {riskExplanation?.summary || 'Standard monitoring baseline.'}
              <div className="mt-1 text-brand-800 font-bold">
                Recommended Action: {riskExplanation?.recommendedAction || 'Continue automated reminders.'}
              </div>
            </div>

            {/* Factor triggers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {riskExplanation?.factors?.map((f: any) => (
                <div
                  key={f.code}
                  className={`p-3.5 rounded-xl border text-xs flex flex-col justify-between ${
                    f.triggered
                      ? 'bg-red-50/50 border-red-200 text-red-950'
                      : 'bg-white border-slate-200 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold">{f.name}</span>
                    <span
                      className={`font-mono font-bold text-[10px] px-1.5 py-0.5 rounded ${
                        f.triggered ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {f.triggered ? `+${f.impactScore} pts` : '0 pts'}
                    </span>
                  </div>
                  <p className="text-xs leading-snug">{f.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Complete Appointment Management Section */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold font-display text-slate-900 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-brand-600" />
                  Follow-Up Appointment Management
                </h3>
                <p className="text-xs text-slate-500">
                  Primary source of truth for the patient's reminder engine and care timeline
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setScheduleModalOpen(true)}
                leftIcon={<CalendarDays className="w-4 h-4" />}
              >
                Schedule New Appointment
              </Button>
            </div>

            {currentAppt ? (
              <div className="p-6 rounded-2xl bg-slate-900 text-white shadow-xs border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${
                        currentAppt.status === 'CONFIRMED'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : currentAppt.status === 'NO_SHOW'
                          ? 'bg-red-500/20 text-red-300 border-red-500/40'
                          : 'bg-brand-500/20 text-brand-300 border-brand-500/40'
                      }`}
                    >
                      {currentAppt.status}
                    </span>
                    <span className="text-xs font-mono text-slate-400">ID: {currentAppt.appointmentId}</span>
                  </div>

                  <h4 className="text-xl font-bold font-display text-white">{currentAppt.type}</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-brand-400" />
                      <span className="font-bold text-white">{formatDate(currentAppt.scheduledDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-brand-400" />
                      <span className="font-bold text-white">{currentAppt.scheduledTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-brand-400" />
                      <span>{currentAppt.hospital || 'City Care Hospital'} ({currentAppt.department})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-brand-400" />
                      <span>Dr. {currentAppt.doctorName}</span>
                    </div>
                  </div>

                  {currentAppt.followUpWindow && currentAppt.followUpWindow.start && (
                    <div className="text-xs text-brand-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      Recommended Follow-Up Window: {formatDate(currentAppt.followUpWindow.start)} – {formatDate(currentAppt.followUpWindow.end)}
                    </div>
                  )}
                </div>

                {/* Admin Action Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2 shrink-0">
                  {currentAppt.status !== 'CONFIRMED' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleMarkConfirmed(currentAppt.appointmentId)}
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                      className="text-xs"
                    >
                      Mark Confirmed
                    </Button>
                  )}
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleMarkCompleted(currentAppt.appointmentId)}
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    className="text-xs"
                  >
                    Mark Completed
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedAppt(currentAppt);
                      setRescheduleModalOpen(true);
                    }}
                    className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 text-xs"
                  >
                    Reschedule
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleMarkNoShow(currentAppt.appointmentId)}
                    leftIcon={<AlertTriangle className="w-3.5 h-3.5" />}
                    className="text-xs"
                  >
                    Mark No-Show
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedAppt(currentAppt);
                      setCancelModalOpen(true);
                    }}
                    className="text-red-400 hover:bg-red-950/40 text-xs"
                  >
                    Cancel Appt
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                No active appointments currently scheduled.
              </div>
            )}
          </div>

          {/* 2-Column: Appointment History Audit Log & Communications Hub */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold font-display text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-brand-600" />
                Appointment Audit Trail
              </h3>

              {history.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">No schedule changes recorded.</div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {history.map((h: any) => (
                    <div
                      key={h.id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{h.action}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {formatDate(h.timestamp)}
                        </span>
                      </div>
                      <p className="text-slate-600">{h.reason}</p>
                      <div className="text-[10px] text-slate-400">
                        Performed by: <strong>{h.performedBy}</strong> ({h.performedByRole})
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold font-display text-slate-900 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-brand-600" />
                Communication & Call Log History
              </h3>

              {commLogs.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">No communication logs recorded.</div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {commLogs.map((log: any) => (
                    <div
                      key={log.logId}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{log.channel}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              log.status === 'DELIVERED' || log.status === 'ANSWERED' || log.status === 'SENT'
                                ? 'bg-emerald-100 text-emerald-800'
                                : log.status === 'NO_ANSWER'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {log.status}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {formatDate(log.timestamp)}
                        </span>
                      </div>

                      <p className="text-slate-600 italic">"{log.message}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Schedule Modal */}
      <ScheduleAppointmentModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        patient={patient}
        onScheduleSuccess={fetchPatientDetails}
      />

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        appointment={selectedAppt}
        onRescheduleSuccess={fetchPatientDetails}
      />

      {/* Cancel Confirm Modal */}
      <CancelConfirmModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        appointment={selectedAppt}
        onCancelSuccess={fetchPatientDetails}
        onOpenReschedule={() => setRescheduleModalOpen(true)}
      />

      {/* Quick Outreach Modal */}
      <QuickCommunicationModal
        isOpen={commModalOpen}
        onClose={() => setCommModalOpen(false)}
        patient={patient}
        defaultChannel={defaultCommChannel}
        onCommunicationSent={fetchPatientDetails}
      />

      {/* Voice Call Modal */}
      {patient && (
        <VoiceCallModal
          isOpen={callModalOpen}
          onClose={() => setCallModalOpen(false)}
          patientId={patient.patientId}
          patientName={patient.name}
          phone={patient.phone}
          messageText={buildVoiceMessageText(
            patient.name,
            selectedAppt?.doctorName || patient.primaryDoctor,
            selectedAppt?.scheduledDate,
            selectedAppt?.scheduledTime,
            selectedAppt?.hospital
          )}
          onCallCompleted={fetchPatientDetails}
        />
      )}
    </div>
  );
};

export default AdminPatientDetailPage;
