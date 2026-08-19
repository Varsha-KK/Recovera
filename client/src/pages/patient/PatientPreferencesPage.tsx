import React, { useState, useEffect } from 'react';
import { patientService } from '../../services/patientService';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { useToast } from '../../contexts/ToastContext';
import { MessageSquare, PhoneCall, Bell, Clock, CheckCircle2, Shield } from 'lucide-react';

export const PatientPreferencesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [sms, setSms] = useState(true);
  const [voice, setVoice] = useState(true);
  const [push, setPush] = useState(true);
  const [preferredTime, setPreferredTime] = useState('10:00 AM');

  const { success, error } = useToast();

  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const data = await patientService.getDashboard();
        const prefs = data?.patient?.reminderPreferences;
        if (prefs) {
          setSms(prefs.sms ?? true);
          setVoice(prefs.voice ?? true);
          setPush(prefs.push ?? true);
          setPreferredTime(prefs.preferredTime || '10:00 AM');
        }
      } finally {
        setLoading(false);
      }
    };
    loadPrefs();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await patientService.updatePreferences({ sms, voice, push, preferredTime });
      success('Reminder preferences updated successfully.', 'Preferences Saved');
    } catch (err: any) {
      error('Failed to save preferences.');
    } finally {
      setSaving(false);
    }
  };

  const timeOptions = ['08:00 AM', '09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '04:00 PM', '06:00 PM'];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 min-w-0 max-w-2xl space-y-6">
          <div>
            {/* Main Headline in Baskervville Bold */}
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
              Reminder & Communication Preferences
            </h1>
            {/* Subtitle in Comic Sans MS */}
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Choose how and when Recovera reaches out for follow-up checkups and medication reviews
            </p>
          </div>

          {loading ? (
            <LoadingSpinner label="Loading preferences..." />
          ) : (
            <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
              {/* Channel Toggles */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold font-display text-slate-800 uppercase tracking-wider">
                  Active Reminder Channels
                </h3>

                {/* SMS Toggle */}
                <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold font-display text-slate-900">SMS Text Messages</h4>
                      <p className="text-xs text-slate-500">Receive text reminders with appointment details</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sms}
                      onChange={(e) => setSms(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                  </label>
                </div>

                {/* Voice Call Toggle */}
                <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                      <PhoneCall className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold font-display text-slate-900">Automated Voice Calls</h4>
                      <p className="text-xs text-slate-500">Automated follow-up voice call prior to consultations</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={voice}
                      onChange={(e) => setVoice(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                  </label>
                </div>

                {/* Web Push Toggle */}
                <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold font-display text-slate-900">Browser & App Push Alerts</h4>
                      <p className="text-xs text-slate-500">Real-time alerts for scheduled appointments & required lab tests</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={push}
                      onChange={(e) => setPush(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                  </label>
                </div>
              </div>

              {/* Preferred Time */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-600" />
                  Preferred Call & Reminder Time
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {timeOptions.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setPreferredTime(t)}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                        preferredTime === t
                          ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Privacy-Conscious Communication</span>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={saving}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Save Preferences
                </Button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
};

export default PatientPreferencesPage;
