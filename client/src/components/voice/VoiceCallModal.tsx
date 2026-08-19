import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Phone, PhoneCall, AlertCircle, CheckCircle2, User } from 'lucide-react';
import { Button } from '../common/Button';
import { notificationService } from '../../services/notificationService';
import { useToast } from '../../contexts/ToastContext';

interface VoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: string;
  patientName: string;
  phone: string;
  messageText: string;
  purpose?: string;
  onCallCompleted?: () => void;
}

export const VoiceCallModal: React.FC<VoiceCallModalProps> = ({
  isOpen,
  onClose,
  patientId,
  patientName,
  phone,
  messageText,
  purpose = 'Follow-up Appointment Reminder',
  onCallCompleted,
}) => {
  const [loading, setLoading] = useState(false);
  const [callSid, setCallSid] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { success, error } = useToast();

  if (!isOpen) return null;

  const handleInitiateCall = async () => {
    setLoading(true);
    setErrorMsg(null);
    setCallSid(null);

    try {
      let res: any;
      if (patientId) {
        res = await notificationService.triggerVoiceCall({
          patientId,
          message: messageText,
          purpose,
        });
      } else {
        res = await notificationService.triggerTestCall({
          recipientIndex: 1,
          message: messageText,
        });
      }

      const sid = res.callSid || res.data?.callSid;
      setCallSid(sid);
      success(`Twilio outbound PSTN call dispatched (SID: ${sid})`, 'Call Initiated');
      if (onCallCompleted) onCallCompleted();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Twilio call dispatch failed.';
      setErrorMsg(msg);
      error(msg, 'Twilio Carrier Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-md rounded-2xl bg-white text-slate-900 p-6 shadow-xl border border-slate-200 text-center relative overflow-hidden"
      >
        <div className="text-xs font-bold uppercase tracking-wider text-brand-700 mb-1 flex items-center justify-center gap-1.5">
          <PhoneCall className="w-3.5 h-3.5 text-brand-600" /> Twilio PSTN Voice Outreach
        </div>
        <p className="text-xs text-slate-500 mb-4">{purpose}</p>

        {/* Contact Avatar */}
        <div className="relative w-14 h-14 mx-auto mb-3">
          <div className="w-full h-full rounded-full bg-brand-50 border-2 border-brand-200 flex items-center justify-center text-brand-700 shadow-xs">
            <User className="w-7 h-7" />
          </div>
        </div>

        <h3 className="text-lg font-bold font-display text-slate-900 mb-0.5">{patientName}</h3>
        <p className="text-xs text-brand-700 font-mono font-bold mb-4">{phone}</p>

        {/* Message Script to be spoken by Twilio */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-700 leading-relaxed mb-4">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Spoken Telephone Script Preview
          </div>
          "{messageText}"
        </div>

        {/* Status Messages */}
        {callSid && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs text-left mb-4">
            <div className="flex items-center gap-1.5 font-bold mb-1 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Twilio Call Dispatched
            </div>
            <div className="font-mono text-xs text-emerald-700 font-bold mb-1">
              Call SID: {callSid}
            </div>
            <p className="text-xs text-emerald-800 leading-normal">
              Twilio is dialing the patient's physical phone. When answered, Twilio will speak the dynamic appointment message.
            </p>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs text-left mb-4">
            <div className="flex items-center gap-1.5 font-bold mb-1 text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              Twilio Dispatch Notice
            </div>
            <p className="text-xs text-red-700 leading-normal">{errorMsg}</p>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="ghost" size="sm" onClick={onClose}>
            {callSid ? 'Close' : 'Cancel'}
          </Button>

          {!callSid && (
            <Button
              variant="primary"
              size="md"
              onClick={handleInitiateCall}
              isLoading={loading}
              leftIcon={<Phone className="w-4 h-4" />}
            >
              Call Patient's Phone
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default VoiceCallModal;
