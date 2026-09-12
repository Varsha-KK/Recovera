import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { IntegrationStatus } from '../../types';
import {
  ShieldCheck,
  PhoneCall,
  MessageSquare,
  Volume2,
  Bell,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const AdminIntegrationsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { error } = useToast();

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data = await adminService.getIntegrationStatus();
      setStatus(data);
    } catch (err: any) {
      error('Failed to load integration statuses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const isSmsConfigured = Boolean(status?.exotelSms?.configured || status?.twilioSms?.configured);
  const smsAccountSid = status?.exotelSms?.accountSid || status?.twilioSms?.accountSid || 'Not provided';
  const smsSenderId = status?.exotelSms?.senderId || status?.twilioSms?.phoneNumber || 'Not provided';

  const isVoiceConfigured = Boolean(status?.exotelVoice?.configured || status?.twilioVoice?.configured);
  const voiceExoPhone = status?.exotelVoice?.exoPhone || status?.twilioVoice?.phoneNumber || 'Not provided';
  const voiceAppId = status?.exotelVoice?.appId || '1338862';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 min-w-0 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-brand-700 font-bold text-xs mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Security & Infrastructure</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
                Outreach & Communication Integrations
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Verified connection status of Exotel SMS, Exotel Voice, ElevenLabs AI, and Web Push services
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchStatus}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh Status
            </Button>
          </div>

          {loading ? (
            <LoadingSpinner label="Validating API credentials and provider health..." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Exotel SMS */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold font-display text-slate-900">Exotel SMS</h3>
                        <p className="text-xs text-slate-500">Clinical SMS Text Messaging</p>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                        isSmsConfigured
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {isSmsConfigured ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Connected
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-amber-600" /> Not Configured
                        </>
                      )}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Dispatches automated reminder texts, appointment check-ins, and dynamic notifications via Exotel.
                  </p>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Account SID:</span>
                      <span className="text-slate-800 font-bold">{smsAccountSid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sender ID / Header:</span>
                      <span className="text-slate-800 font-bold">{smsSenderId}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 text-xs text-slate-400">
                  Configure via <code className="text-slate-600 font-mono">EXOTEL_ACCOUNT_SID</code>, <code className="text-slate-600 font-mono">EXOTEL_SMS_SENDER_ID</code>
                </div>
              </div>

              {/* Exotel Voice */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
                        <PhoneCall className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold font-display text-slate-900">Exotel Voice</h3>
                        <p className="text-xs text-slate-500">Automated Follow-Up Voice Dispatcher</p>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                        isVoiceConfigured
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {isVoiceConfigured ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Connected
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-amber-600" /> Not Configured
                        </>
                      )}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Dials outbound calls to patient phones, connecting patients to the configured Recovera voice flow.
                  </p>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Caller ID (ExoPhone):</span>
                      <span className="text-slate-800 font-bold">{voiceExoPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Voice App ID:</span>
                      <span className="text-slate-800 font-bold">{voiceAppId}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 text-xs text-slate-400">
                  Configure via <code className="text-slate-600 font-mono">EXOTEL_VOICE_EXOPHONE</code>, <code className="text-slate-600 font-mono">EXOTEL_VOICE_APP_ID</code>
                </div>
              </div>

              {/* ElevenLabs Voice */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                        <Volume2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold font-display text-slate-900">ElevenLabs Voice AI</h3>
                        <p className="text-xs text-slate-500">Empathetic Healthcare Voice Model</p>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                        status?.elevenLabs.configured
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {status?.elevenLabs.configured ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Connected
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-amber-600" /> Not Configured
                        </>
                      )}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Synthesizes natural voice audio for clinical staff preview playback and reminder scripts.
                  </p>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">API Key:</span>
                      <span className="text-slate-800 font-bold">{status?.elevenLabs.maskedKey || '••••••••••••'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Voice ID:</span>
                      <span className="text-slate-800 font-bold">{status?.elevenLabs.voiceId}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 text-xs text-slate-400">
                  Configure via <code className="text-slate-600 font-mono">ELEVENLABS_API_KEY</code>
                </div>
              </div>

              {/* Web Push */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
                        <Bell className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold font-display text-slate-900">Web Push Notifications</h3>
                        <p className="text-xs text-slate-500">Browser Push & In-App Alerts</p>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                        status?.webPush.configured
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {status?.webPush.configured ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Configured
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-amber-600" /> Not Configured
                        </>
                      )}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Delivers real-time browser push notifications and in-app milestone alerts directly to patient devices.
                  </p>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">VAPID Protocol:</span>
                      <span className="text-slate-800 font-bold">{status?.webPush.configured ? 'Active' : 'Unconfigured'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Subject:</span>
                      <span className="text-slate-800 font-bold truncate max-w-[180px]">{status?.webPush.subject}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 text-xs text-slate-400">
                  Configure via <code className="text-slate-600 font-mono">VAPID_PUBLIC_KEY</code>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminIntegrationsPage;
