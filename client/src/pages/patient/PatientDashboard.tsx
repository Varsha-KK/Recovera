import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { patientService } from '../../services/patientService';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { NextActionHeroCard } from '../../components/patient/NextActionHeroCard';
import { RescheduleModal } from '../../components/patient/RescheduleModal';
import { CancelConfirmModal } from '../../components/patient/CancelConfirmModal';
import { CareTimeline } from '../../components/patient/CareTimeline';
import { MedicationList } from '../../components/patient/MedicationList';
import { PendingTestsCard } from '../../components/patient/PendingTestsCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { RiskIndicator } from '../../components/common/RiskIndicator';
import {
  CalendarDays,
  Pill,
  Activity,
  HeartPulse,
  Sparkles,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [timelineItems, setTimelineItems] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modals
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [dashData, timelineData] = await Promise.all([
        patientService.getDashboard(),
        patientService.getTimeline(),
      ]);
      setData(dashData);
      setTimelineItems(timelineData);
    } catch (err: any) {
      console.error('Failed to load patient dashboard:', err);
      error('Failed to load your care dashboard. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleConfirmAttendance = async () => {
    if (!data?.nextAction?.appointmentId) return;
    try {
      const res = await patientService.confirmAttendance(data.nextAction.appointmentId);
      success(res.message, 'Attendance Confirmed');
      await fetchDashboardData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to confirm attendance.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner label="Loading your personalized care dashboard..." size="lg" />
        </div>
      </div>
    );
  }

  const patient = data?.patient;
  const nextAction = data?.nextAction;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 min-w-0 space-y-6">
          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <div className="flex items-center gap-2 text-brand-700 font-bold text-xs mb-1">
                <HeartPulse className="w-4 h-4" />
                <span>Patient Transitional Care Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
                Good morning, {patient?.name || user?.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Discharged on <strong className="text-slate-700">{patient?.formattedDischargeDate || formatDate(patient?.dischargeDate)}</strong> • Under care of{' '}
                <strong className="text-slate-700">{patient?.primaryDoctor}</strong> ({patient?.department})
              </p>
            </div>

            {/* Risk Status Indicator */}
            {patient && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-4 shrink-0">
                <RiskIndicator
                  score={patient.riskScore || 20}
                  level={patient.riskLevel || 'LOW'}
                  size="md"
                  showLabel={true}
                />
              </div>
            )}
          </div>

          {/* Prominent Next Action Hero Card */}
          <NextActionHeroCard
            appointment={nextAction}
            onConfirm={handleConfirmAttendance}
            onReschedule={() => setRescheduleModalOpen(true)}
            onCancel={() => setCancelModalOpen(true)}
          />

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Follow-Up Status</div>
                <div className="text-sm font-bold text-slate-900">
                  {nextAction?.status || 'None Scheduled'}
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Medications</div>
                <div className="text-sm font-bold text-slate-900">
                  {patient?.medications?.length || 0} Prescriptions
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pre-Visit Lab Tests</div>
                <div className="text-sm font-bold text-slate-900">
                  {data?.pendingTests?.length || 0} Pending
                </div>
              </div>
            </div>
          </div>

          {/* Main 2-Column Content: Care Timeline + Prescriptions / Tests */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold font-display text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  Your Care Recovery Timeline
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {timelineItems.length} Milestones
                </span>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
                <CareTimeline items={timelineItems} />
              </div>
            </div>

            <div className="space-y-6">
              <PendingTestsCard tests={data?.pendingTests || []} />
              <MedicationList medications={patient?.medications || []} />
            </div>
          </div>
        </main>
      </div>

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        appointment={nextAction}
        onRescheduleSuccess={fetchDashboardData}
      />

      {/* Cancellation Modal */}
      <CancelConfirmModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        appointment={nextAction}
        onCancelSuccess={fetchDashboardData}
        onOpenReschedule={() => setRescheduleModalOpen(true)}
      />
    </div>
  );
};

export default PatientDashboard;
