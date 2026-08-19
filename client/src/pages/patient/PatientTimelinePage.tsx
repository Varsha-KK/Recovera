import React, { useState, useEffect } from 'react';
import { patientService } from '../../services/patientService';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { CareTimeline } from '../../components/patient/CareTimeline';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const PatientTimelinePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [timelineItems, setTimelineItems] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const data = await patientService.getTimeline();
        setTimelineItems(data);
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 min-w-0 space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
              Care Recovery Timeline
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Your end-to-end post-discharge milestones, medication schedules, and clinical consultations
            </p>
          </div>

          {loading ? (
            <LoadingSpinner label="Loading your care journey..." />
          ) : (
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs">
              <CareTimeline items={timelineItems} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PatientTimelinePage;
