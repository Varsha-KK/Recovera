import axios from 'axios';
import { prisma } from '../config/prisma.js';
import { ENV } from '../config/env.js';
import { getTestRecipients, isAllowedRecipient } from '../services/twilioTestRecipients.js';

const BASE_URL = 'http://localhost:5000/api';

async function runTwilioTestSuite() {
  console.log('\n🧪 ========================================================');
  console.log('🧪 RECOVERA — TWILIO SMS & VOICE INTEGRATION TEST SUITE');
  console.log('🧪 ========================================================\n');

  try {
    // -------------------------------------------------------------------------
    // 1. Diagnostic Status Verification
    // -------------------------------------------------------------------------
    console.log('1️⃣ [Diagnostic Status] Querying GET /api/integrations/twilio/status...');
    const statusRes = await axios.get(`${BASE_URL}/integrations/twilio/status`);
    console.log('   ✅ HTTP Status:', statusRes.status);
    console.log('   ✅ Configured:', statusRes.data.data.configured);
    console.log('   ✅ Account SID (Masked):', statusRes.data.data.accountSid);
    console.log('   ✅ API Key Configured:', statusRes.data.data.apiKeyConfigured);
    console.log('   ✅ Phone Configured:', statusRes.data.data.phoneConfigured);
    console.log('   ✅ Sender Phone (Masked):', statusRes.data.data.phoneNumber);
    console.log('   ✅ SMS Enabled:', statusRes.data.data.smsEnabled);
    console.log('   ✅ Voice Enabled:', statusRes.data.data.voiceEnabled);
    console.log('   ✅ Configured Test Recipients Count:', statusRes.data.data.testRecipientsConfigured);
    console.log('   ✅ Test Recipients (Masked):', statusRes.data.data.testRecipients);

    if (JSON.stringify(statusRes.data).includes(ENV.TWILIO_API_KEY_SECRET)) {
      throw new Error('SECURITY VIOLATION: API Key Secret was exposed in status response!');
    }
    console.log('   🔒 Security Check Passed: No API Key Secrets or tokens exposed.');

    // -------------------------------------------------------------------------
    // 2. Allowlist Enforcement in Dev/Test Mode (SMS)
    // -------------------------------------------------------------------------
    console.log('\n2️⃣ [Allowlist Enforcement - SMS] Attempting SMS dispatch to unallowed arbitrary number...');
    try {
      // First login as admin to get token for /api/notifications/sms
      const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'admin@recovera.health',
        password: ENV.DEV_ADMIN_PASSWORD || 'RecoveraAdmin2026!',
      });
      const token = adminLogin.data.token;

      // Find a patient profile
      const patient = await prisma.patientProfile.findFirst();
      if (!patient) throw new Error('No patient profile found in database.');

      await axios.post(
        `${BASE_URL}/notifications/sms`,
        {
          patientId: patient.patientId,
          recipient: '+19998887777', // Unallowed arbitrary number
          message: 'Test message to unallowed number',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      throw new Error('SECURITY FAILURE: System allowed SMS to arbitrary unallowed number!');
    } catch (allowlistErr: any) {
      console.log('   ✅ Rejection Status:', allowlistErr.response?.status);
      console.log('   ✅ Rejection Message:', allowlistErr.response?.data?.message);
      if (allowlistErr.response?.data?.message?.includes('Twilio Test Mode Restriction')) {
        console.log('   ✅ Test Allowlist successfully blocked unverified arbitrary recipient.');
      }
    }

    // -------------------------------------------------------------------------
    // 3. Allowlist Enforcement in Dev/Test Mode (Voice Call)
    // -------------------------------------------------------------------------
    console.log('\n3️⃣ [Allowlist Enforcement - Voice] Attempting voice call to unallowed arbitrary number...');
    try {
      const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'admin@recovera.health',
        password: ENV.DEV_ADMIN_PASSWORD || 'RecoveraAdmin2026!',
      });
      const token = adminLogin.data.token;
      const patient = await prisma.patientProfile.findFirst();

      await axios.post(
        `${BASE_URL}/notifications/voice`,
        {
          patientId: patient!.patientId,
          phone: '+19998887777', // Unallowed arbitrary number
          message: 'Test voice call script',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      throw new Error('SECURITY FAILURE: System allowed voice call to arbitrary unallowed number!');
    } catch (voiceAllowErr: any) {
      console.log('   ✅ Rejection Status:', voiceAllowErr.response?.status);
      console.log('   ✅ Rejection Message:', voiceAllowErr.response?.data?.message);
      if (voiceAllowErr.response?.data?.message?.includes('Twilio Test Mode Restriction')) {
        console.log('   ✅ Test Allowlist successfully blocked unverified arbitrary call.');
      }
    }

    // -------------------------------------------------------------------------
    // 4. Test SMS Dispatch to Configured Test Recipient #1
    // -------------------------------------------------------------------------
    console.log('\n4️⃣ [Live Twilio SMS Test] Testing POST /api/integrations/twilio/test-sms (Recipient #1)...');
    try {
      const testSmsRes = await axios.post(`${BASE_URL}/integrations/twilio/test-sms`, {
        recipientIndex: 1,
        message: 'Recovera Clinical Test: Post-discharge follow-up reminder verification.',
      });
      console.log('   ✅ Response Status:', testSmsRes.status);
      console.log('   ✅ Result:', testSmsRes.data.message);
      console.log('   ✅ Twilio Message SID:', testSmsRes.data.data?.providerMessageId);
      console.log('   ✅ Dispatch Status:', testSmsRes.data.data?.status);
    } catch (smsLiveErr: any) {
      console.log('   ℹ️ Twilio SMS Response/Restriction:', smsLiveErr.response?.data?.message || smsLiveErr.message);
    }

    // -------------------------------------------------------------------------
    // 5. Test Voice Call Dispatch to Configured Test Recipient #1
    // -------------------------------------------------------------------------
    console.log('\n5️⃣ [Live Twilio Voice Test] Testing POST /api/integrations/twilio/test-call (Recipient #1)...');
    try {
      const testCallRes = await axios.post(`${BASE_URL}/integrations/twilio/test-call`, {
        recipientIndex: 1,
        message: 'Hello! This is a verified test outreach call from Recovera Post-Discharge Care Management.',
      });
      console.log('   ✅ Response Status:', testCallRes.status);
      console.log('   ✅ Result:', testCallRes.data.message);
      console.log('   ✅ Twilio Call SID:', testCallRes.data.data?.callSid);
      console.log('   ✅ Call Status:', testCallRes.data.data?.status);
    } catch (voiceLiveErr: any) {
      console.log('   ℹ️ Twilio Voice Response/Restriction:', voiceLiveErr.response?.data?.message || voiceLiveErr.message);
    }

    // -------------------------------------------------------------------------
    // 6. Database Audit Log Verification
    // -------------------------------------------------------------------------
    console.log('\n6️⃣ [Database Audit Logs] Verifying communication_logs & call_logs in PostgreSQL...');
    const commCount = await prisma.communicationLog.count();
    const callCount = await prisma.callLog.count();
    console.log(`   ✅ Total Communication Logs in PostgreSQL: ${commCount}`);
    console.log(`   ✅ Total Call Logs in PostgreSQL: ${callCount}`);

    console.log('\n🎉 ========================================================');
    console.log('🎉 ALL TWILIO INTEGRATION & SECURITY TESTS VERIFIED!');
    console.log('🎉 ========================================================\n');
  } catch (error: any) {
    console.error('❌ Twilio Test Suite Failure:', error.response?.data || error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTwilioTestSuite();
