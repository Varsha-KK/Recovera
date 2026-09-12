import React, { useState } from 'react';
import { MessageSquare, PhoneCall, Bell, Sparkles, Volume2 } from 'lucide-react';
import { AudioPreviewPlayer } from '../voice/AudioPreviewPlayer';

export const ChannelsShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'SMS' | 'VOICE' | 'PUSH'>('VOICE');

  return (
    <section id="channels" className="py-20 md:py-28 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Channel Outreach</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 tracking-tight">
            Meet patients wherever they are
          </h2>
          <p className="text-base text-slate-600">
            Intelligent escalation across Exotel SMS, automated ElevenLabs Voice calls, and Web Push notifications
          </p>
        </div>

        {/* Channel Selector */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl gap-1">
            <button
              onClick={() => setActiveTab('VOICE')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'VOICE'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PhoneCall className="w-4 h-4 text-teal-600" />
              ElevenLabs AI Voice
            </button>
            <button
              onClick={() => setActiveTab('SMS')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'SMS'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-brand-600" />
              Exotel SMS Text
            </button>
            <button
              onClick={() => setActiveTab('PUSH')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'PUSH'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bell className="w-4 h-4 text-indigo-600" />
              Web Push
            </button>
          </div>
        </div>

        {/* Channel Preview Content */}
        <div className="max-w-3xl mx-auto">
          {activeTab === 'VOICE' && (
            <div className="p-8 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Automated Voice Reminder</h3>
                    <p className="text-xs text-slate-400">Natural voice synthesis for high-risk patients 24h prior</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  ElevenLabs + Exotel Voice
                </span>
              </div>

              <AudioPreviewPlayer
                text="Hello Maria. This is an automated follow-up reminder from Recovera and City Care Hospital regarding your upcoming clinical consultation with Dr. Sarah Jenkins tomorrow at 10:30 AM. Please visit your Recovera patient portal to confirm your checkup. Thank you."
                patientName="Maria Gonzalez"
              />
            </div>
          )}

          {activeTab === 'SMS' && (
            <div className="p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Exotel SMS Outreach</h3>
                    <p className="text-xs text-slate-400">Automated check-ins with 1-click confirmation links</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  Exotel SMS
                </span>
              </div>

              <div className="max-w-md mx-auto space-y-3 font-sans">
                <div className="p-4 rounded-2xl rounded-tl-sm bg-slate-800 border border-slate-700 text-xs text-slate-200 leading-relaxed">
                  Recovera Follow-Up: Hello Maria, your checkup with Dr. Sarah Jenkins is scheduled for Aug 25 at 10:30 AM. Reply YES to confirm or visit: https://recovera.health/p/APT-1001
                </div>
                <div className="p-3 rounded-2xl rounded-tr-sm bg-brand-600 text-white text-xs w-fit ml-auto">
                  YES, I will attend
                </div>
                <div className="p-4 rounded-2xl rounded-tl-sm bg-slate-800 border border-slate-700 text-xs text-slate-200 leading-relaxed">
                  Thank you! Your attendance is confirmed. Remember to complete your fasting lab test 2 days prior at City Care Lab.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'PUSH' && (
            <div className="p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Web Push Notification</h3>
                    <p className="text-xs text-slate-400">Direct real-time notification to patient's device</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Web Push API
                </span>
              </div>

              <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-800/90 border border-slate-700 shadow-lg flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  R
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">Recovera • Upcoming Checkup</span>
                    <span className="text-[10px] text-slate-400 font-mono">Just now</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Your follow-up with Dr. Sarah Jenkins is coming up in 2 days. Tap to review pre-visit instructions.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ChannelsShowcase;
