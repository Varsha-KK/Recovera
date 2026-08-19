import React, { useState, useEffect } from 'react';
import { patientService } from '../../services/patientService';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { NotificationData } from '../../types';
import { formatDate } from '../../utils/formatters';
import { Bell, AlertTriangle } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const PatientNotificationsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { success } = useToast();

  const fetchDashboard = async () => {
    try {
      const data = await patientService.getDashboard();
      setNotifications(data.notifications || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleMarkRead = async (id: string) => {
    await patientService.markNotificationRead(id);
    success('Notification marked as read.');
    setNotifications((prev) =>
      prev.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n))
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 min-w-0 space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
              Notification Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              SMS reminders, upcoming checkup alerts, and clinical updates
            </p>
          </div>

          {loading ? (
            <LoadingSpinner label="Loading notifications..." />
          ) : notifications.length === 0 ? (
            <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center">
              <Bell className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold font-display text-slate-900 mb-1">No Notifications</h3>
              <p className="text-xs text-slate-500">You are all caught up on alerts.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.notificationId}
                  className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                    n.isRead
                      ? 'bg-white border-slate-200 text-slate-600'
                      : 'bg-brand-50/50 border-brand-200 text-slate-900 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        n.type === 'RISK_ALERT'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-brand-100 text-brand-700'
                      }`}
                    >
                      {n.type === 'RISK_ALERT' ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <Bell className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mb-2">{n.message}</p>
                      <span className="text-xs font-mono text-slate-400">
                        {formatDate(n.createdAt)}
                      </span>
                    </div>
                  </div>

                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkRead(n.notificationId)}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shrink-0"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PatientNotificationsPage;
