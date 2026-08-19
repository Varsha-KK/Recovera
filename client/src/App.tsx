import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RoleGuard } from './components/layout/RoleGuard';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Patient Pages
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { PatientAppointmentsPage } from './pages/patient/PatientAppointmentsPage';
import { PatientTimelinePage } from './pages/patient/PatientTimelinePage';
import { PatientNotificationsPage } from './pages/patient/PatientNotificationsPage';
import { PatientPreferencesPage } from './pages/patient/PatientPreferencesPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminPatientsPage } from './pages/admin/AdminPatientsPage';
import { AdminPatientDetailPage } from './pages/admin/AdminPatientDetailPage';
import { AdminAppointmentsPage } from './pages/admin/AdminAppointmentsPage';
import { AdminCommunicationsPage } from './pages/admin/AdminCommunicationsPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminIntegrationsPage } from './pages/admin/AdminIntegrationsPage';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Marketing & Auth */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Patient Protected Portal */}
      <Route element={<RoleGuard allowedRoles={['PATIENT']} />}>
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/patient/appointments" element={<PatientAppointmentsPage />} />
        <Route path="/patient/timeline" element={<PatientTimelinePage />} />
        <Route path="/patient/notifications" element={<PatientNotificationsPage />} />
        <Route path="/patient/preferences" element={<PatientPreferencesPage />} />
      </Route>

      {/* Hospital Admin Protected Portal */}
      <Route element={<RoleGuard allowedRoles={['ADMIN', 'COORDINATOR']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/patients" element={<AdminPatientsPage />} />
        <Route path="/admin/patients/:id" element={<AdminPatientDetailPage />} />
        <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
        <Route path="/admin/communications" element={<AdminCommunicationsPage />} />
        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        <Route path="/admin/settings/integrations" element={<AdminIntegrationsPage />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
