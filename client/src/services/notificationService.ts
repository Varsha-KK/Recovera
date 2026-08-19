import { api } from './api';
import { CommunicationLogData, CallLogData } from '../types';

export const notificationService = {
  sendSms: async (data: { patientId: string; message?: string; appointmentId?: string }) => {
    const response = await api.post('/notifications/sms', data);
    return response.data;
  },

  triggerVoiceCall: async (data: { patientId: string; phone?: string; message?: string; purpose?: string }) => {
    const response = await api.post('/notifications/voice', data);
    return response.data;
  },

  triggerTestCall: async (data: { recipientIndex?: number; message?: string }) => {
    const response = await api.post('/integrations/twilio/test-call', data);
    return response.data;
  },

  sendPush: async (data: { patientId: string; title?: string; body?: string; appointmentId?: string }) => {
    const response = await api.post('/notifications/push', data);
    return response.data;
  },

  getCommunicationLogs: async (params?: {
    channel?: string;
    status?: string;
    patientId?: string;
    search?: string;
  }): Promise<{ count: number; data: CommunicationLogData[] }> => {
    const response = await api.get('/notifications/logs', { params });
    return response.data;
  },

  getCallLogs: async (params?: { patientId?: string }): Promise<{ count: number; data: CallLogData[] }> => {
    const response = await api.get('/notifications/calls', { params });
    return response.data;
  },

  generateVoicePreview: async (text: string, voiceId?: string) => {
    const response = await api.post('/notifications/voice-preview', { text, voiceId });
    return response.data.data;
  },
};
