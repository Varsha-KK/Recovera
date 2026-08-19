import { api } from './api';
import { PatientProfileData, IntegrationStatus } from '../types';

export const adminService = {
  async getDashboard() {
    const res = await api.get('/admin/dashboard');
    return res.data.data;
  },

  async getPatients(params?: {
    riskLevel?: string;
    condition?: string;
    search?: string;
    overdueOnly?: boolean;
  }) {
    const res = await api.get('/admin/patients', { params });
    return res.data;
  },

  async getPatientById(id: string) {
    const res = await api.get(`/admin/patients/${id}`);
    return res.data.data;
  },

  async createPatient(data: any) {
    const res = await api.post('/admin/patients', data);
    return res.data;
  },

  async getAnalytics() {
    const res = await api.get('/admin/analytics');
    return res.data.data;
  },

  async getIntegrationStatus(): Promise<IntegrationStatus> {
    const res = await api.get('/admin/integrations/status');
    return res.data.data;
  },

  async recalculateRisk(patientId: string) {
    const res = await api.post(`/risk/recalculate/${patientId}`);
    return res.data;
  },
};

export default adminService;
