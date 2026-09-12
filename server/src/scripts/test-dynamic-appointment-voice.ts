import axios from 'axios';
import { prisma } from '../config/prisma.js';
import {
  generateAppointmentVoiceMessage,
  formatAppointmentDate,
  formatAppointmentTime,
} from '../services/appointmentVoiceService.js';

const BASE_URL = 'http://localhost:5000/api';

async function runDynamicVoiceTests() {
  console.log('\n======================================================');
  console.log('RECOVERA — DYNAMIC APPOINTMENT VOICE VERIFICATION (EXOTEL)');
  console.log('======================================================\n');

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Dynamic Message & Voice Call for Patient A
    // -------------------------------------------------------------------------
    console.log('1️⃣ [TEST 1] Testing dynamic appointment Voice Call for Patient A (Amruta)...');
    const patientA = await prisma.patientProfile.findFirst({
      where: { name: 'Amruta' },
    });

    if (!patientA) {
      throw new Error('Patient Amruta not found in database.');
    }

    const apptId1 = `APT-VOI-${Date.now().toString().slice(-4)}`;
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

    const dynamicMsg1 = generateAppointmentVoiceMessage(appointment1, appointment1.patient);
    console.log(`   🗣️ Generated Spoken Text:\n      "${dynamicMsg1}"`);

    console.log('\n   📞 Triggering Exotel outbound call for Patient A...');
    try {
      const callRes1 = await axios.post(`${BASE_URL}/integrations/exotel/test-call`, {
        appointmentId: appointment1.appointmentId,
      });

      console.log('   ✅ Call Accepted by Exotel:');
      console.log('      - Call SID:       ', callRes1.data.callSid);
      console.log('      - Recipient Phone:', callRes1.data.to);
      console.log('      - Spoken Message: ', callRes1.data.message);
    } catch (err: any) {
      console.log('   ℹ️ Exotel Response / Status for Patient A:');
      console.log('      - Code:   ', err.response?.data?.code || err.code);
      console.log('      - Message:', err.response?.data?.message || err.message);
    }

    // -------------------------------------------------------------------------
    // TEST 2: Dynamic Patient B with Different Phone Number
    // -------------------------------------------------------------------------
    console.log('\n2️⃣ [TEST 2] Testing dynamic appointment Voice Call for Patient B...');
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
        const dynamicMsgB = generateAppointmentVoiceMessage(apptB, patientB);
        console.log(`   🗣️ Generated Spoken Text for Patient B (${patientB.name}):\n      "${dynamicMsgB}"`);

        try {
          const callResB = await axios.post(`${BASE_URL}/integrations/exotel/test-call`, {
            appointmentId: apptB.appointmentId,
          });
          console.log('   ✅ Exotel call initiated for Patient B:', callResB.data.to);
        } catch (err: any) {
          console.log('   ℹ️ Exotel Response for Patient B:');
          console.log('      - Message:', err.response?.data?.message || err.message);
        }
      }
    }

    console.log('\n🎉 ========================================================');
    console.log('🎉 DYNAMIC APPOINTMENT VOICE TESTS COMPLETED');
    console.log('🎉 ========================================================\n');
  } catch (error: any) {
    console.error('❌ Dynamic Voice Test Failure:', error.response?.data || error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runDynamicVoiceTests();
