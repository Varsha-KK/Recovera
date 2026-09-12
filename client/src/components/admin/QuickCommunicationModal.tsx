import React, { useState, useEffect } from 'react';
import { MessageSquare, PhoneCall, Send } from 'lucide-react';
import { PatientProfileData } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { notificationService } from '../../services/notificationService';
import { useToast } from '../../contexts/ToastContext';
import { AudioPreviewPlayer } from '../voice/AudioPreviewPlayer';
import { buildAppointmentSmsText, buildVoiceMessageText } from '../../utils/formatters';

interface QuickCommunicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfileData | null;
  defaultChannel?: 'SMS' | 'VOICE';
  onCommunicationSent?: () => void;
}

export const QuickCommunicationModal: React.FC<QuickCommunicationModalProps> = ({
  isOpen,
  onClose,
  patient,
  defaultChannel = 'SMS',
  onCommunicationSent,
}) => {
  if (!patient) return null;

  const [channel, setChannel] = useState<'SMS' | 'VOICE'>(defaultChannel);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const defaultMsg =
      defaultChannel === 'SMS'
        ? buildAppointmentSmsText(
            patient.name,
            patient.primaryDoctor,
            patient.nextAppointment?.scheduledDate,
            patient.nextAppointment?.scheduledTime
          )
        : buildVoiceMessageText(
            patient.name,
            patient.primaryDoctor,
            patient.nextAppointment?.scheduledDate,
            patient.nextAppointment?.scheduledTime
          );

    setMessage(defaultMsg);
  }, [patient, defaultChannel]);

  const handleChannelSwitch = (targetChannel: 'SMS' | 'VOICE') => {
    setChannel(targetChannel);
    if (targetChannel === 'SMS') {
      setMessage(
        buildAppointmentSmsText(
          patient.name,
          patient.primaryDoctor,
          patient.nextAppointment?.scheduledDate,
          patient.nextAppointment?.scheduledTime
        )
      );
    } else {
      setMessage(
        buildVoiceMessageText(
          patient.name,
          patient.primaryDoctor,
          patient.nextAppointment?.scheduledDate,
          patient.nextAppointment?.scheduledTime
        )
      );
    }
  };

  const { success, error } = useToast();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (channel === 'SMS') {
        const res = await notificationService.sendSms({
          patientId: patient.patientId,
          message,
        });
        success(res.message, 'SMS Dispatched');
      } else {
        const res = await notificationService.triggerVoiceCall({
          patientId: patient.patientId,
          message,
          purpose: 'Clinical Staff Follow-Up Call',
        });
        success(res.message, 'Voice Call Initiated');
      }

      if (onCommunicationSent) onCommunicationSent();
      onClose();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to dispatch communication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Initiate Patient Outreach"
      subtitle={`Recipient: ${patient.name} (${patient.phone}) • ${patient.diagnosis}`}
      maxWidth="md"
    >
      <form onSubmit={handleSend} className="space-y-4">
        {/* Channel Selector */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => handleChannelSwitch('SMS')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              channel === 'SMS'
                ? 'bg-white text-brand-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Exotel SMS Text
          </button>
          <button
            type="button"
            onClick={() => handleChannelSwitch('VOICE')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              channel === 'VOICE'
                ? 'bg-white text-brand-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            Exotel Voice Call
          </button>
        </div>

        {/* Message Content */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
            {channel === 'SMS' ? 'SMS Message Body' : 'Spoken Voice Message Script'}
          </label>
          <textarea
            rows={4}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 leading-relaxed"
          />
        </div>

        {/* Live Speech Preview for Voice Calls */}
        {channel === 'VOICE' && (
          <AudioPreviewPlayer text={message} patientName={patient.name} />
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            type="submit"
            isLoading={loading}
            leftIcon={channel === 'SMS' ? <Send className="w-4 h-4" /> : <PhoneCall className="w-4 h-4" />}
          >
            {channel === 'SMS' ? 'Send Reminder SMS' : 'Trigger Voice Call'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default QuickCommunicationModal;
