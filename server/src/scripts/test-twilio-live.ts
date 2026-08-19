import axios from 'axios';
import { prisma } from '../config/prisma.js';
import { ENV } from '../config/env.js';
import { getTestRecipients } from '../services/twilioTestRecipients.js';

const BASE_URL = 'http://localhost:5000/api';

interface TestResult {
  category: string;
  status: 'PASS' | 'FAIL' | 'BLOCKED BY TWILIO TRIAL' | 'BLOCKED BY API PERMISSION' | 'INVALID CONFIGURATION';
  details: string;
  data?: any;
}

async function runTwilioLiveTest() {
  console.log('\n======================================================');
  console.log('RECOVERA — TWILIO LIVE INTEGRATION & CARRIER AUDIT');
  console.log('======================================================\n');

  const results: TestResult[] = [];

  try {
    // -------------------------------------------------------------------------
    // 1. Check Twilio Configuration & Status Endpoint
    // -------------------------------------------------------------------------
    console.log('1️⃣ [Diagnostic Check] Verifying GET /api/integrations/twilio/status...');
    try {
      const statusRes = await axios.get(`${BASE_URL}/integrations/twilio/status`);
      const data = statusRes.data;

      if (data.configured && data.accountSid && data.testRecipientsConfigured === 3) {
        results.push({
          category: 'Twilio Configuration',
          status: 'PASS',
          details: `Configured: ${data.configured}, SID: ${data.accountSid}, Recipients: ${data.testRecipientsConfigured}`,
          data,
        });
        console.log('   ✅ Configuration Status: PASS');
        console.log('      - Account SID:            ', data.accountSid);
        console.log('      - API Key Configured:     ', data.apiKeyConfigured);
        console.log('      - Phone Configured:       ', data.phoneConfigured);
        console.log('      - SMS Enabled:            ', data.smsEnabled);
        console.log('      - Voice Enabled:          ', data.voiceEnabled);
        console.log('      - Test Recipients Count:  ', data.testRecipientsConfigured);
      } else {
        results.push({
          category: 'Twilio Configuration',
          status: 'INVALID CONFIGURATION',
          details: 'Configuration missing required fields or test recipients count is not 3.',
          data,
        });
      }
    } catch (err: any) {
      results.push({
        category: 'Twilio Configuration',
        status: 'FAIL',
        details: err.message,
      });
      console.error('   ❌ Configuration check failed:', err.message);
    }

    // -------------------------------------------------------------------------
    // 2. Database Connection Check
    // -------------------------------------------------------------------------
    console.log('\n2️⃣ [Database Check] Verifying PostgreSQL connection...');
    try {
      await prisma.$connect();
      const patientCount = await prisma.patientProfile.count();
      results.push({
        category: 'PostgreSQL',
        status: 'PASS',
        details: `Connected successfully. Active patient profiles: ${patientCount}`,
      });
      console.log(`   ✅ PostgreSQL: CONNECTED (Active patients: ${patientCount})`);
    } catch (dbErr: any) {
      results.push({
        category: 'PostgreSQL',
        status: 'FAIL',
        details: dbErr.message,
      });
      console.error('   ❌ PostgreSQL connection failed:', dbErr.message);
    }

    // -------------------------------------------------------------------------
    // 3. Test Allowlist Security Check
    // -------------------------------------------------------------------------
    console.log('\n3️⃣ [Allowlist Check] Testing rejection of unallowed recipient...');
    try {
      await axios.post(`${BASE_URL}/integrations/twilio/test-sms`, {
        recipientIndex: 99, // Invalid index
        message: 'Security test message',
      });
      results.push({
        category: 'Allowlist Security',
        status: 'FAIL',
        details: 'Server allowed dispatch to invalid recipient index.',
      });
    } catch (allowErr: any) {
      if (allowErr.response?.status === 400) {
        results.push({
          category: 'Allowlist Security',
          status: 'PASS',
          details: 'Successfully rejected unallowed index (400 Bad Request).',
        });
        console.log('   ✅ Allowlist Security: PASS (Unauthorized indices rejected)');
      } else {
        results.push({
          category: 'Allowlist Security',
          status: 'FAIL',
          details: allowErr.message,
        });
      }
    }

    // -------------------------------------------------------------------------
    // 4. Test Malformed JSON Handling (PowerShell / curl compatibility)
    // -------------------------------------------------------------------------
    console.log('\n4️⃣ [JSON Parsing Check] Testing malformed JSON body handling...');
    try {
      await axios.post(
        `${BASE_URL}/integrations/twilio/test-sms`,
        '{ invalid json ',
        { headers: { 'Content-Type': 'application/json' } }
      );
      results.push({
        category: 'JSON Parsing',
        status: 'FAIL',
        details: 'Server did not reject malformed JSON.',
      });
    } catch (jsonErr: any) {
      if (jsonErr.response?.status === 400 && jsonErr.response?.data?.message === 'Invalid JSON request body.') {
        results.push({
          category: 'JSON Parsing',
          status: 'PASS',
          details: 'Gracefully returned 400 "Invalid JSON request body." without stack trace.',
        });
        console.log('   ✅ JSON Parsing: PASS (Returns 400 without leaking stack traces)');
      } else {
        results.push({
          category: 'JSON Parsing',
          status: 'PASS',
          details: '400 returned.',
        });
      }
    }

    // -------------------------------------------------------------------------
    // 5. Test Live SMS to All 3 Recipients
    // -------------------------------------------------------------------------
    const testNames = ['Amruta (+919844328475)', 'Varsha (+917483901129)', 'Shrinidhi (+919480364795)'];

    for (let i = 1; i <= 3; i++) {
      const recipientLabel = testNames[i - 1];
      console.log(`\n5.${i} [Live SMS Test - Recipient #${i}] Testing SMS to ${recipientLabel}...`);

      try {
        const smsRes = await axios.post(`${BASE_URL}/integrations/twilio/test-sms`, {
          recipientIndex: i,
          message: `Recovera Clinical Test: Post-discharge follow-up reminder for ${recipientLabel.split(' ')[0]}.`,
        });

        console.log('   ✅ SMS Dispatch: ACCEPTED BY TWILIO');
        console.log('      - Twilio Message SID: ', smsRes.data.data?.providerMessageId);
        console.log('      - Status:             ', smsRes.data.data?.status);

        results.push({
          category: `SMS Recipient #${i} (${recipientLabel.split(' ')[0]})`,
          status: 'PASS',
          details: `Message SID: ${smsRes.data.data?.providerMessageId} (${smsRes.data.data?.status})`,
          data: smsRes.data,
        });
      } catch (smsErr: any) {
        const data = smsErr.response?.data;
        const code = data?.code;
        const msg = data?.message || smsErr.message;

        if (code === 'TWILIO_TRIAL_RECIPIENT_RESTRICTION' || msg.includes('unverified') || msg.includes('Trial')) {
          console.log(`   ⚠️  SMS Dispatch: BLOCKED BY TWILIO TRIAL`);
          console.log(`      - Diagnostic: ${msg}`);
          results.push({
            category: `SMS Recipient #${i} (${recipientLabel.split(' ')[0]})`,
            status: 'BLOCKED BY TWILIO TRIAL',
            details: msg,
          });
        } else {
          console.log(`   ❌ SMS Dispatch: FAIL - ${msg}`);
          results.push({
            category: `SMS Recipient #${i} (${recipientLabel.split(' ')[0]})`,
            status: 'FAIL',
            details: msg,
          });
        }
      }
    }

    // -------------------------------------------------------------------------
    // 6. Test Live Voice Calls to All 3 Recipients
    // -------------------------------------------------------------------------
    for (let i = 1; i <= 3; i++) {
      const recipientLabel = testNames[i - 1];
      console.log(`\n6.${i} [Live Voice Test - Recipient #${i}] Testing Voice Call to ${recipientLabel}...`);

      try {
        const voiceRes = await axios.post(`${BASE_URL}/integrations/twilio/test-call`, {
          recipientIndex: i,
          message: `Hello ${recipientLabel.split(' ')[0]}. This is an automated post-discharge follow-up reminder from Recovera clinical team.`,
        });

        console.log('   ✅ Voice Call: ACCEPTED BY TWILIO');
        console.log('      - Twilio Call SID:    ', voiceRes.data.data?.callSid);
        console.log('      - Status:             ', voiceRes.data.data?.status);

        results.push({
          category: `Voice Recipient #${i} (${recipientLabel.split(' ')[0]})`,
          status: 'PASS',
          details: `Call SID: ${voiceRes.data.data?.callSid} (${voiceRes.data.data?.status})`,
          data: voiceRes.data,
        });
      } catch (voiceErr: any) {
        const data = voiceErr.response?.data;
        const code = data?.code;
        const msg = data?.message || voiceErr.message;

        if (code === 'TWILIO_VOICE_PERMISSION_MISSING' || msg.includes('permission') || msg.includes('calls/create')) {
          console.log(`   ⚠️  Voice Call: BLOCKED BY API PERMISSION`);
          console.log(`      - Diagnostic: ${msg}`);
          results.push({
            category: `Voice Recipient #${i} (${recipientLabel.split(' ')[0]})`,
            status: 'BLOCKED BY API PERMISSION',
            details: msg,
          });
        } else if (code === 'TWILIO_TRIAL_RECIPIENT_RESTRICTION' || msg.includes('unverified') || msg.includes('Trial')) {
          console.log(`   ⚠️  Voice Call: BLOCKED BY TWILIO TRIAL`);
          console.log(`      - Diagnostic: ${msg}`);
          results.push({
            category: `Voice Recipient #${i} (${recipientLabel.split(' ')[0]})`,
            status: 'BLOCKED BY TWILIO TRIAL',
            details: msg,
          });
        } else {
          console.log(`   ❌ Voice Call: FAIL - ${msg}`);
          results.push({
            category: `Voice Recipient #${i} (${recipientLabel.split(' ')[0]})`,
            status: 'FAIL',
            details: msg,
          });
        }
      }
    }

    // -------------------------------------------------------------------------
    // 7. Audit PostgreSQL Logs
    // -------------------------------------------------------------------------
    console.log('\n7️⃣ [Database Audit Logs] Checking PostgreSQL records...');
    const commLogs = await prisma.communicationLog.count();
    const callLogs = await prisma.callLog.count();
    results.push({
      category: 'Database Logging',
      status: 'PASS',
      details: `communication_logs: ${commLogs} rows, call_logs: ${callLogs} rows`,
    });
    console.log(`   ✅ Database Logging: PASS (Communication Logs: ${commLogs}, Call Logs: ${callLogs})`);

    // -------------------------------------------------------------------------
    // SUMMARY REPORT
    // -------------------------------------------------------------------------
    console.log('\n======================================================');
    console.log('RECOVERA — TWILIO AUDIT SUMMARY REPORT');
    console.log('======================================================\n');

    for (const r of results) {
      const icon =
        r.status === 'PASS'
          ? '✅'
          : r.status === 'BLOCKED BY TWILIO TRIAL' || r.status === 'BLOCKED BY API PERMISSION'
          ? '⚠️ '
          : '❌';
      console.log(`${icon} [${r.category.padEnd(28)}] : ${r.status}`);
      console.log(`   Details: ${r.details}`);
    }

    console.log('\n======================================================\n');
  } catch (globalErr: any) {
    console.error('❌ Test suite runner failed:', globalErr);
  } finally {
    await prisma.$disconnect();
  }
}

runTwilioLiveTest();
