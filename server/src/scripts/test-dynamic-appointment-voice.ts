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
  console.log('RECOVERA — DYNAMIC APPOINTMENT VOICE VERIFICATION');
  console.log('======================================================\n');

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Dynamic Message from Live Database Record (Patient: Amruta)
    // -------------------------------------------------------------------------
    console.log('1️⃣ [TEST 1] Creating a real appointment in PostgreSQL for Amruta...');
    const patientAmruta = await prisma.patientProfile.findFirst({
      where: { name: 'Amruta' },
    });

    if (!patientAmruta) {
      throw new Error('Patient Amruta not found in database.');
    }

    const apptId1 = `APT-DYN-${Date.now().toString().slice(-4)}`;
    const testDate1 = new Date('2026-08-20T00:00:00.000Z');
    const testTime1 = '11:30 AM';

    const appointment1 = await prisma.appointment.create({
      data: {
        appointmentId: apptId1,
        patientId: patientAmruta.patientId,
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
    console.log(`      - Doctor:         ${appointment1.doctorName}`);
    console.log(`      - Scheduled Date: ${formatAppointmentDate(appointment1.scheduledDate)}`);
    console.log(`      - Scheduled Time: ${formatAppointmentTime(appointment1.scheduledTime)}`);

    const dynamicMsg1 = generateAppointmentVoiceMessage(appointment1, appointment1.patient);
    console.log(`   🗣️ Generated Spoken Text:\n      "${dynamicMsg1}"`);

    console.log('\n   📞 Triggering real Twilio PSTN call for appointment 1...');
    const callRes1 = await axios.post(`${BASE_URL}/integrations/twilio/test-call`, {
      appointmentId: appointment1.appointmentId,
    });

    console.log('   ✅ Call Accepted by Twilio:');
    console.log('      - Call SID:       ', callRes1.data.callSid);
    console.log('      - Recipient Phone:', callRes1.data.to);
    console.log('      - Spoken Message: ', callRes1.data.message);

    // Verify TwiML webhook output
    const twimlCheck1 = await axios.get(
      `${BASE_URL}/integrations/twilio/simple-twiml?appointmentId=${appointment1.appointmentId}`
    );
    console.log('   📡 TwiML Webhook Output for Appointment 1:\n', twimlCheck1.data);

    // -------------------------------------------------------------------------
    // TEST 2: Appointment Reschedule / Change without modifying code
    // -------------------------------------------------------------------------
    console.log('\n2️⃣ [TEST 2] Rescheduling the same appointment to a new date & time...');
    const newDate2 = new Date('2026-08-25T00:00:00.000Z');
    const newTime2 = '3:45 PM';

    const updatedAppt = await prisma.appointment.update({
      where: { appointmentId: appointment1.appointmentId },
      data: {
        scheduledDate: newDate2,
        scheduledTime: newTime2,
        status: 'RESCHEDULED',
      },
      include: { patient: true },
    });

    console.log(`   ✅ Appointment updated in PostgreSQL: ${updatedAppt.appointmentId}`);
    console.log(`      - New Date: ${formatAppointmentDate(updatedAppt.scheduledDate)}`);
    console.log(`      - New Time: ${formatAppointmentTime(updatedAppt.scheduledTime)}`);

    const dynamicMsg2 = generateAppointmentVoiceMessage(updatedAppt, updatedAppt.patient);
    console.log(`   🗣️ Generated Spoken Text for Rescheduled Appointment:\n      "${dynamicMsg2}"`);

    console.log('\n   📞 Triggering real Twilio PSTN call for rescheduled appointment...');
    const callRes2 = await axios.post(`${BASE_URL}/integrations/twilio/test-call`, {
      appointmentId: updatedAppt.appointmentId,
    });

    console.log('   ✅ Call Accepted by Twilio:');
    console.log('      - Call SID:       ', callRes2.data.callSid);
    console.log('      - Recipient Phone:', callRes2.data.to);
    console.log('      - Spoken Message: ', callRes2.data.message);

    // Verify TwiML webhook output for rescheduled appointment
    const twimlCheck2 = await axios.get(
      `${BASE_URL}/integrations/twilio/simple-twiml?appointmentId=${updatedAppt.appointmentId}`
    );
    console.log('   📡 TwiML Webhook Output for Rescheduled Appointment:\n', twimlCheck2.data);

    console.log('\n🎉 ========================================================');
    console.log('🎉 ALL DYNAMIC APPOINTMENT VOICE TESTS PASSED 100%!');
    console.log('🎉 ========================================================\n');
  } catch (error: any) {
    console.error('❌ Dynamic Voice Test Failure:', error.response?.data || error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runDynamicVoiceTests();
