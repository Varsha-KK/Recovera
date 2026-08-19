import { api } from './api';
import { AppointmentData, AppointmentHistoryItem } from '../types';

export const appointmentService = {
  getAppointments: async (params?: {
    filter?: string;
    status?: string;
    department?: string;
    search?: string;
    patientId?: string;
  }): Promise<{ count: number; data: AppointmentData[] }> => {
    const response = await api.get('/appointments', { params });
    return response.data;
  },

  getAppointmentById: async (id: string): Promise<{ data: AppointmentData & { history: AppointmentHistoryItem[] } }> => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  createAppointment: async (data: {
    patientId: string;
    doctorName?: string;
    department?: string;
    type?: string;
    scheduledDate: string;
    scheduledTime: string;
    windowStart?: string;
    windowEnd?: string;
    patientNotes?: string;
  }) => {
    const response = await api.post('/appointments', data);
    return response.data;
  },

  rescheduleAppointment: async (
    id: string,
    data: { newDate: string; newTime: string; reason?: string }
  ) => {
    const response = await api.post(`/appointments/${id}/reschedule`, data);
    return response.data;
  },

  cancelAppointment: async (id: string, reason?: string) => {
    const response = await api.post(`/appointments/${id}/cancel`, { reason });
    return response.data;
  },

  completeAppointment: async (id: string) => {
    const response = await api.post(`/appointments/${id}/complete`);
    return response.data;
  },

  noShowAppointment: async (id: string) => {
    const response = await api.post(`/appointments/${id}/no-show`);
    return response.data;
  },

  getAppointmentHistory: async (id: string): Promise<{ data: AppointmentHistoryItem[] }> => {
    const response = await api.get(`/appointments/${id}/history`);
    return response.data;
  },
};
