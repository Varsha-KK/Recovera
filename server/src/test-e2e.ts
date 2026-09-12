import axios from 'axios';
import { ENV } from './config/env.js';

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

async function runEndToEndVerification() {
  console.log('🧪 Starting Recovera End-to-End API & Workflow Verification...\n');

  try {
    // 1. Health Check
    console.log('1️⃣ Checking Health Endpoint...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('   ✅ Health check passed:', health.data.service);

    // 2. Admin Authentication
    console.log('\n2️⃣ Testing Hospital Coordinator Authentication...');
    const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@recovera.health',
      password: ENV.DEV_ADMIN_PASSWORD || 'RecoveraAdmin2026!',
    });
    const adminToken = adminLogin.data.token;
    console.log('   ✅ Admin JWT Login passed:', adminLogin.data.user.name);

    // 3. Patient Authentication
    console.log('\n3️⃣ Testing Patient Authentication...');
    const patientLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'patient@recovera.health',
      password: 'Patient@123',
    });
    const patientToken = patientLogin.data.token;
    console.log('   ✅ Patient JWT Login passed:', patientLogin.data.user.name);

    // 4. Patient Dashboard
    console.log('\n4️⃣ Testing Patient Dashboard & Next Action Hero Retrieval...');
    const patientDash = await axios.get(`${BASE_URL}/patient/dashboard`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const nextAction = patientDash.data.data.nextAction;
    console.log('   ✅ Patient Dashboard retrieved:');
    console.log('      - Next Action Appointment ID:', nextAction?.appointmentId);
    console.log('      - Status:', nextAction?.status);
    console.log('      - Scheduled Date:', nextAction?.scheduledDate);
    console.log('      - Reminder Jobs Timeline Count:', nextAction?.reminderTimeline?.length);

    // 5. Attendance Confirmation (1-Click)
    if (nextAction?.appointmentId) {
      console.log('\n5️⃣ Testing 1-Click Patient Attendance Confirmation ("I\'ll Attend")...');
      const confirmRes = await axios.post(
        `${BASE_URL}/patient/confirm-attendance`,
        { appointmentId: nextAction.appointmentId },
        { headers: { Authorization: `Bearer ${patientToken}` } }
      );
      console.log('   ✅ Confirmation passed:', confirmRes.data.message);
      console.log('      - Mitigated Risk Score:', confirmRes.data.data.updatedRiskScore);
      console.log('      - Mitigated Risk Level:', confirmRes.data.data.updatedRiskLevel);
    }

    // 6. Admin Dashboard Metrics
    console.log('\n6️⃣ Testing Hospital Admin Dashboard Metrics & Stratification...');
    const adminDash = await axios.get(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('   ✅ Admin Metrics retrieved:');
    console.log('      - Total Patients Tracked:', adminDash.data.data.metrics.totalPatients);
    console.log('      - High Risk Patients Count:', adminDash.data.data.metrics.highRiskCount);
    console.log('      - Follow-Up Success Rate:', adminDash.data.data.metrics.commSuccessRate, '%');

    // 7. Outreach Integrations Status (Masked Secrets)
    console.log('\n7️⃣ Testing Admin Integrations Status Endpoint...');
    const integrationsRes = await axios.get(`${BASE_URL}/admin/integrations/status`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('   ✅ Integrations status retrieved:');
    console.log('      - Exotel SMS Configured:', integrationsRes.data.data.exotelSms?.configured ?? integrationsRes.data.data.twilioSms?.configured);
    console.log('      - Exotel Voice Configured:', integrationsRes.data.data.exotelVoice?.configured ?? integrationsRes.data.data.twilioVoice?.configured);
    console.log('      - ElevenLabs Configured:', integrationsRes.data.data.elevenLabs.configured);
    console.log('      - ElevenLabs Key Masked:', integrationsRes.data.data.elevenLabs.maskedKey);

    // 8. ElevenLabs Voice Synthesis & Audio Serving
    console.log('\n8️⃣ Testing Voice Synthesis & TwiML Webhooks...');
    const previewRes = await axios.post(
      `${BASE_URL}/notifications/voice/preview-audio`,
      { text: 'Hello Maria. This is Recovera reminding you of your clinical checkup tomorrow.' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log('   ✅ Audio synthesis passed:', previewRes.data.audioUrl);

    const twimlRes = await axios.get(`${BASE_URL}/voice/twiml/${previewRes.data.audioId}`);
    console.log('   ✅ TwiML serving passed. XML output snippet:');
    console.log('     ', twimlRes.data.slice(0, 100).replace(/\n/g, ' '));

    console.log('\n🎉 ALL RECOVERA BACKEND WORKFLOWS AND ENDPOINTS VERIFIED SUCCESSFULLY!\n');
  } catch (error: any) {
    console.error('❌ E2E Verification failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

runEndToEndVerification();
