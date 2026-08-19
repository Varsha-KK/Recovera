import { prisma } from '../config/prisma.js';

export interface FormattableAppointment {
  appointmentId?: string;
  scheduledDate: Date | string;
  scheduledTime: string;
  doctorName?: string | null;
  department?: string | null;
  hospital?: string | null;
  type?: string | null;
}

export interface FormattablePatient {
  patientId?: string;
  name: string;
  phone?: string;
  primaryDoctor?: string;
}

/**
 * Dynamically formats an appointment date into a natural, spoken string
 * e.g. "Thursday, August 20, 2026"
 */
export function formatAppointmentDate(dateInput: Date | string): string {
  if (!dateInput) return 'your scheduled date';

  try {
    const dateStr = typeof dateInput === 'string' ? dateInput : dateInput.toISOString();
    const parts = dateStr.split('T')[0].split('-');

    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(Date.UTC(year, month, day));

      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      });
    }

    const d = new Date(dateInput);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    });
  } catch {
    return String(dateInput);
  }
}

/**
 * Dynamically formats appointment time into spoken 12-hour format with AM/PM
 * e.g. "11:30 AM", "3:45 PM"
 */
export function formatAppointmentTime(timeInput: string): string {
  if (!timeInput) return 'your scheduled time';

  const trimmed = timeInput.trim();

  // Already in "11:30 AM" or "3:45 PM" format
  if (/^\d{1,2}:\d{2}\s*(AM|PM|am|pm)$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  // Convert "14:30" or "09:00" to "2:30 PM" or "9:00 AM"
  const match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  }

  return trimmed;
}

/**
 * Escapes sensitive XML characters for safe TwiML output
 */
export function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates the dynamic appointment voice message using live database records
 * Format: "Hello {patientName}. This is an automated follow-up reminder from Recovera and {hospital} regarding your upcoming consultation with {doctorName}. Your appointment is scheduled for {formattedDate} at {formattedTime}. Please confirm your checkup or visit your Recovera portal. Thank you."
 */
export function generateAppointmentVoiceMessage(
  appointment: FormattableAppointment,
  patient: FormattablePatient
): string {
  const patientName = patient?.name?.trim() || 'Patient';
  const rawDoctor = appointment?.doctorName || patient?.primaryDoctor || 'Dr. Sarah Jenkins';
  const doctorName = rawDoctor.startsWith('Dr.') ? rawDoctor : `Dr. ${rawDoctor}`;
  const hospital = appointment?.hospital?.trim() || 'City Care Hospital';
  const formattedDate = formatAppointmentDate(appointment.scheduledDate);
  const formattedTime = formatAppointmentTime(appointment.scheduledTime);

  return `Hello ${patientName}. This is an automated follow-up reminder from Recovera and ${hospital} regarding your upcoming consultation with ${doctorName}. Your appointment is scheduled for ${formattedDate} at ${formattedTime}. Please confirm your checkup or visit your Recovera portal. Thank you.`;
}

/**
 * Generates the dynamic appointment SMS message using live database records
 * Format: "Recovera Follow-Up: Hello {patientName}. Your appointment is scheduled for {formattedDate} at {formattedTime}{doctorPart}. Please be available at the scheduled time. Thank you."
 */
export function generateAppointmentSmsMessage(
  appointment: FormattableAppointment,
  patient: FormattablePatient
): string {
  const patientName = patient?.name?.trim() || 'Patient';
  const formattedDate = formatAppointmentDate(appointment.scheduledDate);
  const formattedTime = formatAppointmentTime(appointment.scheduledTime);

  const rawDoctor = appointment?.doctorName || patient?.primaryDoctor;
  let doctorPart = '';
  if (rawDoctor && rawDoctor.trim()) {
    const doc = rawDoctor.trim().startsWith('Dr.') ? rawDoctor.trim() : `Dr. ${rawDoctor.trim()}`;
    doctorPart = ` with ${doc}`;
  }

  return `Recovera Follow-Up: Hello ${patientName}. Your appointment is scheduled for ${formattedDate} at ${formattedTime}${doctorPart}. Please be available at the scheduled time. Thank you.`;
}

/**
 * Generates valid TwiML XML with dynamic message
 */
export function generateDynamicTwiML(message: string): string {
  const safeMessage = escapeXml(message);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Say>${safeMessage}</Say>\n</Response>`;
}

/**
 * Resolves current appointment & patient from PostgreSQL and builds dynamic message
 */
export async function resolveDynamicMessageForCall(params: {
  callId?: string;
  appointmentId?: string;
  patientId?: string;
}): Promise<string> {
  const { callId, appointmentId, patientId } = params;

  // 1. If callId is provided, look up callLog
  if (callId) {
    const callLog = await prisma.callLog.findUnique({
      where: { callId },
      include: {
        appointment: {
          include: { patient: true },
        },
        patient: true,
      },
    });

    if (callLog) {
      // If callLog has an associated appointment, resolve its CURRENT record in DB (handles reschedule!)
      if (callLog.appointmentId) {
        const currentAppt = await prisma.appointment.findUnique({
          where: { appointmentId: callLog.appointmentId },
          include: { patient: true },
        });

        if (currentAppt && currentAppt.patient) {
          return generateAppointmentVoiceMessage(currentAppt, currentAppt.patient);
        }
      }

      // If callLog has an associated patient, resolve their latest appointment
      if (callLog.patientId) {
        const currentPatient = await prisma.patientProfile.findUnique({
          where: { patientId: callLog.patientId },
          include: {
            appointments: {
              orderBy: { scheduledDate: 'desc' },
              take: 1,
            },
          },
        });

        if (currentPatient && currentPatient.appointments.length > 0) {
          return generateAppointmentVoiceMessage(currentPatient.appointments[0], currentPatient);
        }
      }

      // If callLog has transcription text
      if (callLog.transcription) {
        return callLog.transcription;
      }
    }
  }

  // 2. If appointmentId is provided, resolve current appointment from PostgreSQL
  if (appointmentId) {
    const appt = await prisma.appointment.findUnique({
      where: { appointmentId },
      include: { patient: true },
    });

    if (appt && appt.patient) {
      return generateAppointmentVoiceMessage(appt, appt.patient);
    }
  }

  // 3. If patientId is provided, resolve current patient & their latest appointment from PostgreSQL
  if (patientId) {
    const patient = await prisma.patientProfile.findUnique({
      where: { patientId },
      include: {
        appointments: {
          orderBy: { scheduledDate: 'desc' },
          take: 1,
        },
      },
    });

    if (patient) {
      const latestAppt = patient.appointments[0];
      if (latestAppt) {
        return generateAppointmentVoiceMessage(latestAppt, patient);
      }
      return `Hello ${patient.name}. This is an automated follow-up reminder from Recovera and City Care Hospital regarding your clinical consultation. Please check your patient portal for your upcoming schedule. Thank you.`;
    }
  }

  // 4. Default fallback if no identifiers provided
  return 'Hello. This is an automated follow-up reminder from Recovera and City Care Hospital. Please check your patient portal for your upcoming appointment schedule. Thank you.';
}

export default {
  formatAppointmentDate,
  formatAppointmentTime,
  escapeXml,
  generateAppointmentVoiceMessage,
  generateAppointmentSmsMessage,
  generateDynamicTwiML,
  resolveDynamicMessageForCall,
};
