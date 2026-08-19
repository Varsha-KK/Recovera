import { api } from './api';

export const patientService = {
  getDashboard: async () => {
    const response = await api.get('/patient/dashboard');
    return response.data.data;
  },

  getTimeline: async () => {
    const response = await api.get('/patient/timeline');
    return response.data.data;
  },

  confirmAttendance: async (appointmentId: string) => {
    const response = await api.post('/patient/confirm-attendance', { appointmentId });
    return response.data;
  },

  updatePreferences: async (preferences: {
    sms?: boolean;
    voice?: boolean;
    push?: boolean;
    preferredTime?: string;
  }) => {
    const response = await api.patch('/patient/preferences', preferences);
    return response.data;
  },

  markNotificationRead: async (notificationId: string) => {
    const response = await api.patch(`/patient/notifications/${notificationId}/read`);
    return response.data;
  },
};
