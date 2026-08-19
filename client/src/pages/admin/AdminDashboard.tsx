import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { MetricCards } from '../../components/admin/MetricCards';
import { RiskDonutChart } from '../../components/admin/RiskDonutChart';
import { AdherenceTrendChart } from '../../components/admin/AdherenceTrendChart';
import { PatientsNeedingAttention } from '../../components/admin/PatientsNeedingAttention';
import { TodayFollowUpsWidget } from '../../components/admin/TodayFollowUpsWidget';
import { QuickCommunicationModal } from '../../components/admin/QuickCommunicationModal';
import { VoiceCallModal } from '../../components/voice/VoiceCallModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { PatientProfileData } from '../../types';
import { buildVoiceMessageText } from '../../utils/formatters';
import { HeartPulse } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Outreach Modals
  const [commModalOpen, setCommModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientProfileData | null>(null);
  const [defaultChannel, setDefaultChannel] = useState<'SMS' | 'VOICE'>('SMS');

  // Call modal
  const [callModalOpen, setCallModalOpen] = useState(false);

  const fetchDashboard = async () => {
    try {
      const data = await adminService.getDashboard();
      setDashboardData(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleTriggerSms = (patient: PatientProfileData) => {
    setSelectedPatient(patient);
    setDefaultChannel('SMS');
    setCommModalOpen(true);
  };

  const handleTriggerVoice = (patient: PatientProfileData) => {
    setSelectedPatient(patient);
    setCallModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 min-w-0 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <div className="flex items-center gap-2 text-brand-700 font-bold text-xs mb-1">
                <HeartPulse className="w-4 h-4" />
                <span>Hospital Care Coordination Center</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
                Post-Discharge Care Follow-Up Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                City Care Hospital & Medical Center • Transitional Care & Adherence Intelligence
              </p>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner label="Aggregating clinical cohort intelligence..." size="lg" />
          ) : (
            <>
              {/* Executive KPI Metric Cards */}
              <MetricCards metrics={dashboardData?.metrics} />

              {/* Patients Needing Urgent Staff Attention */}
              <PatientsNeedingAttention
                patients={dashboardData?.patientsNeedingAttention || []}
                onTriggerSms={handleTriggerSms}
                onTriggerVoice={handleTriggerVoice}
              />

              {/* Analytical Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <RiskDonutChart data={dashboardData?.riskDistribution || []} />
                </div>

                <div className="lg:col-span-2">
                  <AdherenceTrendChart data={dashboardData?.adherenceTrend || []} />
                </div>
              </div>

              {/* Today's Consultations Widget */}
              <TodayFollowUpsWidget followUps={dashboardData?.todayFollowUps || []} />
            </>
          )}
        </main>
      </div>

      {/* Quick Outreach Modal */}
      <QuickCommunicationModal
        isOpen={commModalOpen}
        onClose={() => setCommModalOpen(false)}
        patient={selectedPatient}
        defaultChannel={defaultChannel}
        onCommunicationSent={fetchDashboard}
      />

      {/* Voice Call Modal */}
      {selectedPatient && (
        <VoiceCallModal
          isOpen={callModalOpen}
          onClose={() => setCallModalOpen(false)}
          patientId={selectedPatient.patientId}
          patientName={selectedPatient.name}
          phone={selectedPatient.phone}
          messageText={buildVoiceMessageText(
            selectedPatient.name,
            selectedPatient.primaryDoctor,
            selectedPatient.nextAppointment?.scheduledDate,
            selectedPatient.nextAppointment?.scheduledTime
          )}
          onCallCompleted={fetchDashboard}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
