import axios from 'axios';
import { ENV } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import {
  getExotelAuthHeaders,
  isExotelConfigured,
  parseExotelError,
} from './exotelClient.js';
import { normalizePhoneNumber } from './phoneUtils.js';
import { generateAppointmentSmsMessage } from './appointmentVoiceService.js';

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

export class ExotelSmsService {
  /**
   * Sends dynamic appointment SMS to a patient
   * using the current PostgreSQL patient record.
   */
  static async sendAppointmentSMS(params: {
    appointmentId: string;
    phoneOverride?: string;
    patientId?: string;
  }) {
    const { appointmentId, phoneOverride } = params;

    const appointment = await prisma.appointment.findUnique({
      where: { appointmentId },
      include: { patient: true },
    });

    if (!appointment) {
      throw new Error(
        `Appointment not found in database with ID: ${appointmentId}`
      );
    }

    if (!appointment.patient) {
      throw new Error(
        `No associated patient found for appointment ${appointmentId}`
      );
    }

    const patient = appointment.patient;

    // Dynamic patient number from database.
    // phoneOverride is used only when explicitly supplied by the existing caller.
    const rawRecipient = phoneOverride || patient.phone;

    if (!rawRecipient) {
      throw new Error(
        `No phone number available for patient ${patient.name} (${patient.patientId})`
      );
    }

    // Generate appointment message dynamically from current database data.
    const dynamicMessage = generateAppointmentSmsMessage(
      appointment,
      patient
    );

    return this.sendDirectSMS({
      recipient: rawRecipient,
      message: dynamicMessage,
      patientId: patient.patientId,
      appointmentId: appointment.appointmentId,
    });
  }

  /**
   * Dispatches SMS message to a patient via Exotel
   * and logs the result in PostgreSQL.
   */
  static async sendSMS(params: SendSmsParams) {
    const {
      patientId,
      appointmentId,
      message: initialMessage,
    } = params;

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

    // Dynamic patient number.
    const rawRecipient = params.recipient || patient.phone;

    let messageToSend = initialMessage;

    // If appointmentId is supplied, generate the message
    // using that appointment's current database information.
    if (appointmentId) {
      const appt = await prisma.appointment.findUnique({
        where: { appointmentId },
      });

      if (appt) {
        messageToSend = generateAppointmentSmsMessage(
          appt,
          patient
        );
      }
    } else if (!messageToSend && patient.appointments.length > 0) {
      messageToSend = generateAppointmentSmsMessage(
        patient.appointments[0],
        patient
      );
    }

    // Fallback message if no appointment-specific message exists.
    if (!messageToSend) {
      messageToSend =
        `Recovera Follow-Up: Hello ${patient.name}. ` +
        `Please visit your Recovera portal for your upcoming schedule. Thank you.`;
    }

    return this.sendDirectSMS({
      recipient: rawRecipient,
      message: messageToSend,
      patientId,
      appointmentId:
        appointmentId || patient.appointments[0]?.appointmentId,
    });
  }

  /**
   * Sends SMS through Exotel REST API
   * and records an audit log in PostgreSQL.
   */
  static async sendDirectSMS(params: DirectSmsParams) {
    const {
      recipient: rawRecipient,
      message,
      patientId,
      appointmentId,
    } = params;

    const logId =
      `CL-SMS-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    // ---------------------------------------------------------
    // 1. Validate SMS service
    // ---------------------------------------------------------
    if (!ENV.SMS_ENABLED) {
      throw new Error(
        'SMS service is disabled in server configuration (SMS_ENABLED=false).'
      );
    }

    // ---------------------------------------------------------
    // 2. Validate Exotel credentials
    // ---------------------------------------------------------
    if (!isExotelConfigured()) {
      if (patientId) {
        await prisma.communicationLog
          .create({
            data: {
              logId,
              patientId,
              appointmentId: appointmentId || null,
              channel: 'SMS',
              recipient: rawRecipient || 'UNKNOWN',
              message,
              status: 'FAILED',
              metadata: {
                error:
                  'Exotel credentials not configured on backend ' +
                  '(EXOTEL_ACCOUNT_SID, EXOTEL_API_KEY, EXOTEL_API_TOKEN).',
              },
            },
          })
          .catch(() => { });
      }

      throw new Error(
        'SMS service is not configured. Please configure Exotel credentials in server/.env.'
      );
    }

    // ---------------------------------------------------------
    // 3. Validate Exotel SMS Sender ID
    // ---------------------------------------------------------
    const senderId = ENV.EXOTEL_SMS_SENDER_ID;

    if (!senderId) {
      const errMsg =
        'EXOTEL_SMS_SENDER_ID is not configured in server/.env. ' +
        'An approved SMS Sender ID or ExoPhone is required.';

      if (patientId) {
        await prisma.communicationLog
          .create({
            data: {
              logId,
              patientId,
              appointmentId: appointmentId || null,
              channel: 'SMS',
              recipient: rawRecipient || 'UNKNOWN',
              message,
              status: 'FAILED',
              metadata: {
                error: errMsg,
              },
            },
          })
          .catch(() => { });
      }

      throw new Error(errMsg);
    }

    // ---------------------------------------------------------
    // 4. Validate and normalize patient's phone number
    // ---------------------------------------------------------
    const normalizedRecipient =
      normalizePhoneNumber(rawRecipient);

    if (!normalizedRecipient) {
      throw new Error(
        `Invalid phone number format: "${rawRecipient}". ` +
        `Destination must be a valid phone number (e.g. +919844328475).`
      );
    }

    // ---------------------------------------------------------
    // 5. Exotel SMS API endpoint
    // ---------------------------------------------------------
    const endpoint =
      `https://${ENV.EXOTEL_SUBDOMAIN}` +
      `/v1/accounts/${ENV.EXOTEL_ACCOUNT_SID}/sms/send`;

    const headers = getExotelAuthHeaders();

    // Exotel SMS API expects form-urlencoded data.
    const requestBody = new URLSearchParams();

    requestBody.append('From', senderId);
    requestBody.append('To', normalizedRecipient);
    requestBody.append('Body', message);

    // Add DLT information only when configured.
    if (ENV.EXOTEL_DLT_ENTITY_ID) {
      requestBody.append(
        'dltentityid',
        ENV.EXOTEL_DLT_ENTITY_ID
      );
    }

    if (ENV.EXOTEL_DLT_TEMPLATE_ID) {
      requestBody.append(
        'dlttemplateid',
        ENV.EXOTEL_DLT_TEMPLATE_ID
      );
    }

    // ---------------------------------------------------------
    // 6. Send SMS through Exotel
    // ---------------------------------------------------------
    try {
      console.log(
        `📱 [Exotel SMS] Sending message from ${senderId} ` +
        `to ${normalizedRecipient}...`
      );

      const response = await axios.post(
        endpoint,
        requestBody.toString(),
        { headers }
      );

      const data = response.data;

      // Exotel response:
      // { SMSMessage: { Sid: "...", Status: "queued", ... } }
      const smsPayload =
        data?.SMSMessage ||
        data?.smsmessage ||
        data;

      const messageSid =
        smsPayload?.Sid ||
        smsPayload?.sid ||
        `EXO-SMS-${Date.now()}`;

      const status = (
        smsPayload?.Status ||
        smsPayload?.status ||
        'SENT'
      ).toUpperCase();

      const initialStatus =
        status === 'DELIVERED'
          ? 'DELIVERED'
          : 'SENT';

      // -------------------------------------------------------
      // 7. Save successful communication log
      // -------------------------------------------------------
      if (patientId) {
        await prisma.communicationLog
          .create({
            data: {
              logId,
              patientId,
              appointmentId: appointmentId || null,
              channel: 'SMS',
              recipient: normalizedRecipient,
              message,
              status: initialStatus,
              providerMessageId: messageSid,
              metadata: {
                accountSid: ENV.EXOTEL_ACCOUNT_SID,
                senderId,
                dateSent:
                  smsPayload?.DateSent ||
                  new Date().toISOString(),
                smsUnits:
                  smsPayload?.SmsUnits || 1,
                exotelResponse: data,
              },
            },
          })
          .catch(() => { });
      }

      return {
        success: true,
        message: 'SMS sent successfully via Exotel.',
        providerMessageId: messageSid,
        status: initialStatus,
        recipient: normalizedRecipient,
        logId,
        text: message,
        appointmentId,
      };
    } catch (err: any) {
      // -------------------------------------------------------
      // 8. Handle Exotel API errors
      // -------------------------------------------------------
      const parsedError = parseExotelError(err);

      const friendlyMessage =
        parsedError.message;

      console.error(
        `❌ [Exotel SMS Error] ${friendlyMessage}`,
        parsedError.statusCode
          ? `(HTTP ${parsedError.statusCode})`
          : ''
      );

      // -------------------------------------------------------
      // 9. Save failed communication log
      // -------------------------------------------------------
      if (patientId) {
        await prisma.communicationLog
          .create({
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
                code: parsedError.code,
                statusCode: parsedError.statusCode,
              },
            },
          })
          .catch(() => { });
      }

      throw new Error(
        `Exotel SMS dispatch failed: ${friendlyMessage}`
      );
    }
  }
}

export default ExotelSmsService;