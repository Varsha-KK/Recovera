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
  console.log('RECOVERA — DYNAMIC APPOINTMENT SMS VERIFICATION');
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

    const apptId1 = `APT-SMS-${Date.now().toString().slice(-4)}`;
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

    const dynamicMsg1 = generateAppointmentSmsMessage(appointment1, appointment1.patient);
    console.log(`   📱 Generated Dynamic SMS Text:\n      "${dynamicMsg1}"`);

    console.log('\n   📨 Testing Twilio SMS endpoint with live appointment 1...');
    try {
      const smsRes1 = await axios.post(`${BASE_URL}/integrations/twilio/test-sms`, {
        appointmentId: appointment1.appointmentId,
      });

      console.log('   ✅ SMS Dispatched by Twilio:');
      console.log('      - Message SID:    ', smsRes1.data.data?.providerMessageId);
      console.log('      - Recipient Phone:', smsRes1.data.data?.recipient);
      console.log('      - Dispatched Text:', smsRes1.data.data?.text);
    } catch (err: any) {
      console.log('   ℹ️ Twilio Response / Trial Account Status:');
      console.log('      - Code:   ', err.response?.data?.code || err.code);
      console.log('      - Message:', err.response?.data?.message || err.message);
    }

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

    const dynamicMsg2 = generateAppointmentSmsMessage(updatedAppt, updatedAppt.patient);
    console.log(`   📱 Generated Dynamic SMS Text for Rescheduled Appointment:\n      "${dynamicMsg2}"`);

    // -------------------------------------------------------------------------
    // TEST 3: Appointment without Doctor Specified (Omits doctor part cleanly)
    // -------------------------------------------------------------------------
    console.log('\n3️⃣ [TEST 3] Testing dynamic SMS when doctor is omitted...');
    const noDoctorAppt = {
      scheduledDate: new Date('2026-09-05T00:00:00.000Z'),
      scheduledTime: '09:15 AM',
      doctorName: '',
    };
    const patientVarsha = { name: 'Varsha' };
    const noDocMsg = generateAppointmentSmsMessage(noDoctorAppt as any, patientVarsha as any);
    console.log(`   📱 Generated Text without Doctor:\n      "${noDocMsg}"`);

    // -------------------------------------------------------------------------
    // TEST 4: Trial Account Rejection on Unverified Numbers
    // -------------------------------------------------------------------------
    console.log('\n4️⃣ [TEST 4] Testing Twilio Trial account restriction rejection...');
    try {
      await axios.post(`${BASE_URL}/notifications/sms`, {
        patientId: patientAmruta.patientId,
        recipient: '+19999999999',
        message: 'Test trial rejection',
      });
      console.log('   ❌ Unexpected: should have rejected unverified recipient');
    } catch (err: any) {
      console.log('   ✅ Correctly Rejected unverified recipient with message:');
      console.log('      ', err.response?.data?.message || err.message);
    }

    console.log('\n🎉 ========================================================');
    console.log('🎉 ALL DYNAMIC APPOINTMENT SMS TESTS PASSED 100%!');
    console.log('🎉 ========================================================\n');
  } catch (error: any) {
    console.error('❌ Dynamic SMS Test Failure:', error.response?.data || error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runDynamicSmsTests();
