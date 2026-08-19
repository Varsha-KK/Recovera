import { ENV } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { getTwilioClient, isTwilioConfigured, mapTwilioError } from './twilioClient.js';
import {
  normalizeToE164,
  isAllowedRecipient,
  getTestRecipients,
} from './twilioTestRecipients.js';
import {
  generateAppointmentSmsMessage,
} from './appointmentVoiceService.js';

export interface SendSmsParams {
  patientId: string;
  appointmentId?: string;
  recipient?: string;
  message?: string;
}

export interface DirectSmsParams {
  recipient: string;
  message: string;
  patientId?: string;
  appointmentId?: string;
}

export class TwilioSmsService {
  /**
   * Sends dynamic appointment SMS to a patient using live PostgreSQL record
   * Format: "Recovera Follow-Up: Hello {patientName}. Your appointment is scheduled for {formattedDate} at {formattedTime} with {doctorName}. Please be available at the scheduled time. Thank you."
   */
  static async sendAppointmentSMS(params: { appointmentId: string; phoneOverride?: string; patientId?: string }) {
    const { appointmentId, phoneOverride } = params;

    const appointment = await prisma.appointment.findUnique({
      where: { appointmentId },
      include: { patient: true },
    });

    if (!appointment) {
      throw new Error(`Appointment not found in database with ID: ${appointmentId}`);
    }

    if (!appointment.patient) {
      throw new Error(`No associated patient found for appointment ${appointmentId}`);
    }

    const patient = appointment.patient;
    const rawRecipient = phoneOverride || patient.phone;

    if (!rawRecipient) {
      throw new Error(`No phone number available for patient ${patient.name} (${patient.patientId})`);
    }

    // Dynamically generate message from CURRENT appointment & patient in PostgreSQL
    const dynamicMessage = generateAppointmentSmsMessage(appointment, patient);

    return this.sendDirectSMS({
      recipient: rawRecipient,
      message: dynamicMessage,
      patientId: patient.patientId,
      appointmentId: appointment.appointmentId,
    });
  }

  /**
   * Dispatches SMS message to a patient via Twilio and logs result in PostgreSQL
   */
  static async sendSMS(params: SendSmsParams) {
    const { patientId, appointmentId, message: initialMessage } = params;

    const patient = await prisma.patientProfile.findUnique({
      where: { patientId },
      include: {
        appointments: {
          orderBy: { scheduledDate: 'desc' },
          take: 1,
        },
      },
    });

    if (!patient) {
      throw new Error(`Patient not found with ID: ${patientId}`);
    }

    const rawRecipient = params.recipient || patient.phone;

    let messageToSend = initialMessage;

    // If explicit appointmentId is passed, dynamically generate from that appointment
    if (appointmentId) {
      const appt = await prisma.appointment.findUnique({
        where: { appointmentId },
      });
      if (appt) {
        messageToSend = generateAppointmentSmsMessage(appt, patient);
      }
    } else if (!messageToSend && patient.appointments.length > 0) {
      messageToSend = generateAppointmentSmsMessage(patient.appointments[0], patient);
    }

    if (!messageToSend) {
      messageToSend = `Recovera Follow-Up: Hello ${patient.name}. Please visit your Recovera portal for your upcoming schedule. Thank you.`;
    }

    return this.sendDirectSMS({
      recipient: rawRecipient,
      message: messageToSend,
      patientId,
      appointmentId: appointmentId || patient.appointments[0]?.appointmentId,
    });
  }

  /**
   * Sends direct SMS with test recipient allowlist enforcement and audit logging
   */
  static async sendDirectSMS(params: DirectSmsParams) {
    const { recipient: rawRecipient, message, patientId, appointmentId } = params;
    const logId = `CL-SMS-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    // 1. Validate Service Enabled
    if (!ENV.SMS_ENABLED) {
      throw new Error('Twilio SMS service is disabled in server configuration (TWILIO_SMS_ENABLED=false).');
    }

    // 2. Validate Twilio Credentials
    if (!isTwilioConfigured()) {
      if (patientId) {
        await prisma.communicationLog.create({
          data: {
            logId,
            patientId,
            appointmentId: appointmentId || null,
            channel: 'SMS',
            recipient: rawRecipient || 'UNKNOWN',
            message,
            status: 'FAILED',
            metadata: { error: 'Twilio credentials not configured on backend.' },
          },
        }).catch(() => {});
      }
      throw new Error('SMS service is not configured. Please configure Twilio credentials in server/.env.');
    }

    // 3. Validate and normalize recipient phone
    const normalizedRecipient = normalizeToE164(rawRecipient);
    if (!normalizedRecipient) {
      throw new Error(
        `Invalid phone number format: "${rawRecipient}". Phone numbers must be in E.164 format (e.g. +17372212163 or +919844328475).`
      );
    }

    // 4. Enforce test-recipient allowlist in development/test environments
    if (!isAllowedRecipient(normalizedRecipient)) {
      const allowed = getTestRecipients();
      const allowlistMsg = allowed.length > 0 ? allowed.join(', ') : 'None configured';
      const rejectionError = `Twilio Test Mode Restriction: Recipient (${normalizedRecipient}) is not in the configured test allowlist (TWILIO_TEST_NUMBER_1, TWILIO_TEST_NUMBER_2, TWILIO_TEST_NUMBER_3 in server/.env). Configured test numbers: [${allowlistMsg}]`;

      if (patientId) {
        await prisma.communicationLog.create({
          data: {
            logId,
            patientId,
            appointmentId: appointmentId || null,
            channel: 'SMS',
            recipient: normalizedRecipient,
            message,
            status: 'FAILED',
            metadata: { error: rejectionError, testAllowlistEnforced: true },
          },
        }).catch(() => {});
      }

      throw new Error(rejectionError);
    }

    // 5. Dispatch Live SMS via Twilio Messages API
    try {
      const twilioClient = getTwilioClient();
      console.log(`📱 [Twilio SMS] Sending live message from ${ENV.TWILIO_PHONE_NUMBER} to ${normalizedRecipient}...`);

      const response = await twilioClient.messages.create({
        body: message,
        from: ENV.TWILIO_PHONE_NUMBER,
        to: normalizedRecipient,
      });

      const initialStatus = response.status.toUpperCase() === 'DELIVERED' ? 'DELIVERED' : 'SENT';

      // Save audit record in PostgreSQL
      if (patientId) {
        await prisma.communicationLog.create({
          data: {
            logId,
            patientId,
            appointmentId: appointmentId || null,
            channel: 'SMS',
            recipient: normalizedRecipient,
            message,
            status: initialStatus,
            providerMessageId: response.sid,
            metadata: {
              accountSid: response.accountSid,
              direction: response.direction,
              dateCreated: response.dateCreated,
              numSegments: response.numSegments,
            },
          },
        }).catch(() => {});
      }

      return {
        success: true,
        message: 'SMS sent successfully.',
        providerMessageId: response.sid,
        status: response.status,
        recipient: normalizedRecipient,
        logId,
        text: message,
        appointmentId,
      };
    } catch (err: any) {
      const friendlyMessage = mapTwilioError(err);
      console.error(`❌ [Twilio SMS Error] ${friendlyMessage}`, err.code ? `(Code: ${err.code})` : '');

      if (patientId) {
        await prisma.communicationLog.create({
          data: {
            logId,
            patientId,
            appointmentId: appointmentId || null,
            channel: 'SMS',
            recipient: normalizedRecipient,
            message,
            status: 'FAILED',
            metadata: {
              error: friendlyMessage,
              twilioErrorCode: err.code,
              rawMessage: err.message,
            },
          },
        }).catch(() => {});
      }

      throw new Error(`Twilio SMS dispatch failed: ${friendlyMessage}`);
    }
  }

  /**
   * Retrieves message delivery status from Twilio REST API
   */
  static async getSMSStatus(messageSid: string) {
    const twilioClient = getTwilioClient();
    const message = await twilioClient.messages(messageSid).fetch();
    return {
      sid: message.sid,
      status: message.status,
      dateSent: message.dateSent,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage,
    };
  }
}

export default TwilioSmsService;
