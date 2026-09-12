import axios from 'axios';
import { prisma } from '../config/prisma.js';
import {
  generateAppointmentSmsMessage,
  formatAppointmentDate,
  formatAppointmentTime,
} from '../services/appointmentVoiceService.js';

const BASE_URL = 'http://localhost:5000/api';

async function runDynamicSmsTests() {
  console.log('\n======================================================');
  console.log('RECOVERA — DYNAMIC APPOINTMENT SMS VERIFICATION (EXOTEL)');
  console.log('======================================================\n');

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Dynamic Message from Live Database Record (Patient A)
    // -------------------------------------------------------------------------
    console.log('1️⃣ [TEST 1] Testing dynamic appointment SMS for Patient A...');
    const patientA = await prisma.patientProfile.findFirst({
      where: { name: 'Amruta' },
    });

    if (!patientA) {
      throw new Error('Patient Amruta not found in database.');
    }

    const apptId1 = `APT-SMS-${Date.now().toString().slice(-4)}`;
    const testDate1 = new Date('2026-08-20T00:00:00.000Z');
    const testTime1 = '11:30 AM';

    const appointment1 = await prisma.appointment.create({
      data: {
        appointmentId: apptId1,
        patientId: patientA.patientId,
        hospital: 'City Care Hospital',
        department: 'General Medicine',
        doctorName: 'Dr. Sarah Jenkins',
        type: 'Post-Discharge Follow-Up',
        scheduledDate: testDate1,
        scheduledTime: testTime1,
        status: 'SCHEDULED',
      },
      include: { patient: true },
    });

    console.log(`   ✅ Appointment created: ${appointment1.appointmentId}`);
    console.log(`      - Patient:        ${appointment1.patient.name}`);
    console.log(`      - Patient Phone:  ${appointment1.patient.phone}`);
    console.log(`      - Doctor:         ${appointment1.doctorName}`);
    console.log(`      - Scheduled Date: ${formatAppointmentDate(appointment1.scheduledDate)}`);
    console.log(`      - Scheduled Time: ${formatAppointmentTime(appointment1.scheduledTime)}`);

    const dynamicMsg1 = generateAppointmentSmsMessage(appointment1, appointment1.patient);
    console.log(`   📱 Generated Dynamic SMS Text:\n      "${dynamicMsg1}"`);

    console.log('\n   📨 Dispatching Exotel SMS for Patient A...');
    try {
      const smsRes1 = await axios.post(`${BASE_URL}/integrations/exotel/test-sms`, {
        appointmentId: appointment1.appointmentId,
      });

      console.log('   ✅ SMS Dispatched via Exotel:');
      console.log('      - Message SID:    ', smsRes1.data.data?.providerMessageId);
      console.log('      - Recipient Phone:', smsRes1.data.data?.recipient);
      console.log('      - Dispatched Text:', smsRes1.data.data?.text);
    } catch (err: any) {
      console.log('   ℹ️ Exotel Response / Account Status:');
      console.log('      - Code:   ', err.response?.data?.code || err.code);
      console.log('      - Message:', err.response?.data?.message || err.message);
    }

    // -------------------------------------------------------------------------
    // TEST 2: Dynamic Patient B with Different Phone Number
    // -------------------------------------------------------------------------
    console.log('\n2️⃣ [TEST 2] Testing dynamic appointment SMS for Patient B...');
    const patientB = await prisma.patientProfile.findFirst({
      where: { name: { not: 'Amruta' } },
    });

    if (patientB) {
      console.log(`   ✅ Selected Patient B: ${patientB.name} (${patientB.phone})`);
      const apptB = await prisma.appointment.findFirst({
        where: { patientId: patientB.patientId },
        include: { patient: true },
      });

      if (apptB) {
        const dynamicMsgB = generateAppointmentSmsMessage(apptB, patientB);
        console.log(`   📱 Generated Dynamic SMS for Patient B (${patientB.name}):\n      "${dynamicMsgB}"`);

        try {
          const smsResB = await axios.post(`${BASE_URL}/integrations/exotel/test-sms`, {
            appointmentId: apptB.appointmentId,
          });
          console.log('   ✅ Exotel SMS dispatched for Patient B:', smsResB.data.data?.recipient);
        } catch (err: any) {
          console.log('   ℹ️ Exotel Response for Patient B:');
          console.log('      - Message:', err.response?.data?.message || err.message);
        }
      }
    }

    console.log('\n🎉 ========================================================');
    console.log('🎉 DYNAMIC APPOINTMENT SMS TESTS COMPLETED');
    console.log('🎉 ========================================================\n');
  } catch (error: any) {
    console.error('❌ Dynamic SMS Test Failure:', error.response?.data || error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runDynamicSmsTests();
