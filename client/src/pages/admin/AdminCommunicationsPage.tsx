import React, { useState, useEffect } from 'react';
import { notificationService } from '../../services/notificationService';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { CommunicationLogData, CallLogData } from '../../types';
import { formatDate } from '../../utils/formatters';
import {
  MessageSquare,
  PhoneCall,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const AdminCommunicationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'SMS' | 'VOICE'>('SMS');
  const [loading, setLoading] = useState(true);
  const [commLogs, setCommLogs] = useState<CommunicationLogData[]>([]);
  const [callLogs, setCallLogs] = useState<CallLogData[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { error } = useToast();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const [comms, calls] = await Promise.all([
        notificationService.getCommunicationLogs(),
        notificationService.getCallLogs(),
      ]);
      setCommLogs(comms.data);
      setCallLogs(calls.data);
    } catch (err: any) {
      error('Failed to load communication history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 min-w-0 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
                Outreach Logs & Call Records
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Audit trail of Twilio 2-way SMS texts, automated Twilio Voice calls, and patient responses
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchLogs}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh Logs
            </Button>
          </div>

          {/* Tab Selection */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab('SMS')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'SMS'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              SMS Communication Trail ({commLogs.length})
            </button>
            <button
              onClick={() => setActiveTab('VOICE')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'VOICE'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Voice Checkup Records ({callLogs.length})
            </button>
          </div>

          {loading ? (
            <LoadingSpinner label="Loading communications log..." />
          ) : activeTab === 'SMS' ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-5">Timestamp</th>
                    <th className="py-3.5 px-4">Patient</th>
                    <th className="py-3.5 px-4">Channel</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-5">Message Content</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {commLogs.map((c) => (
                    <tr key={c.logId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-5 font-mono text-xs text-slate-400">
                        {formatDate(c.timestamp)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{c.patientName}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">{c.channel}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            c.status === 'DELIVERED' || c.status === 'SENT'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-slate-600 max-w-md truncate">
                        "{c.message}"
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-5">Date & Time</th>
                    <th className="py-3.5 px-4">Patient</th>
                    <th className="py-3.5 px-4">Phone</th>
                    <th className="py-3.5 px-4">Outcome</th>
                    <th className="py-3.5 px-4">Duration</th>
                    <th className="py-3.5 px-5">Call SID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {callLogs.map((call) => (
                    <tr key={call.callId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-5 font-mono text-xs text-slate-400">
                        {call.date} {call.time}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{call.patientName}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{call.phone}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            call.status === 'ANSWERED' || call.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : call.status === 'NO_ANSWER'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-brand-50 text-brand-800 border border-brand-200'
                          }`}
                        >
                          {call.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {call.durationSeconds}s
                      </td>
                      <td className="py-3.5 px-5 font-mono text-xs text-slate-400">
                        {call.callSid || 'CA_twilio_sid'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminCommunicationsPage;
