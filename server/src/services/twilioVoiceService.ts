import twilio from 'twilio';
import { ENV } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { getTwilioClient, isTwilioConfigured, mapTwilioError } from './twilioClient.js';
import {
  normalizeToE164,
  isAllowedRecipient,
  getTestRecipients,
} from './twilioTestRecipients.js';
import {
  generateAppointmentVoiceMessage,
  resolveDynamicMessageForCall,
  escapeXml,
} from './appointmentVoiceService.js';

export interface InitiateVoiceCallParams {
  patientId: string;
  appointmentId?: string;
  phone?: string;
  patientName?: string;
  textMessage?: string;
  purpose?: string;
}

export interface DirectVoiceCallParams {
  recipient: string;
  textMessage?: string;
  patientName?: string;
  patientId?: string;
  appointmentId?: string;
  purpose?: string;
}

export class TwilioVoiceService {
  /**
   * Places a real outbound Twilio PSTN call for an actual appointment in PostgreSQL
   * Dynamically generates the spoken date, time, and patient name from the database.
   */
  static async makeAppointmentCall(params: { appointmentId: string; phoneOverride?: string }) {
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

    // Generate dynamic message from real appointment and patient data
    const dynamicMessage = generateAppointmentVoiceMessage(appointment, patient);

    return this.makeSimpleCall({
      recipient: rawRecipient,
      message: dynamicMessage,
      appointmentId: appointment.appointmentId,
      patientId: patient.patientId,
      patientName: patient.name,
      purpose: 'Appointment Confirmation Voice Call',
    });
  }

  /**
   * Outbound PSTN telephone call using public HTTPS TwiML callback URL
   * Compatible with Twilio Trial accounts (no restricted advanced parameters)
   */
  static async makeSimpleCall(params: {
    recipient: string;
    message?: string;
    appointmentId?: string;
    patientId?: string;
    patientName?: string;
    purpose?: string;
  }) {
    const {
      recipient: rawRecipient,
      message: initialMessage,
      appointmentId,
      patientId,
      patientName = 'Patient',
      purpose = 'Post-Discharge Outreach Call',
    } = params;

    // 1. Validate Voice Feature Enabled
    if (!ENV.VOICE_CALL_ENABLED) {
      throw new Error('Twilio Voice call service is disabled in server configuration (VOICE_CALL_ENABLED=false).');
    }

    // 2. Validate Twilio Credentials
    if (!isTwilioConfigured()) {
      throw new Error('Voice service is not configured. Please configure Twilio credentials in server/.env.');
    }

    // 3. Normalize recipient phone
    const normalizedRecipient = normalizeToE164(rawRecipient);
    if (!normalizedRecipient) {
      throw new Error(
        `Invalid phone number format: "${rawRecipient}". Phone numbers must be in E.164 format (e.g. +919844328475).`
      );
    }

    // 4. Enforce test allowlist in development/testing mode
    if (!isAllowedRecipient(normalizedRecipient)) {
      const allowed = getTestRecipients();
      const allowlistMsg = allowed.length > 0 ? allowed.join(', ') : 'None configured';
      throw new Error(
        `Twilio Test Mode Restriction: Recipient (${normalizedRecipient}) is not in the configured test allowlist. Configured test numbers: [${allowlistMsg}]`
      );
    }

    // 5. Construct & Validate Public HTTPS TwiML URL
    const publicBaseUrl = ENV.TWILIO_PUBLIC_BASE_URL?.replace(/\/+$/, '');
    if (!publicBaseUrl) {
      throw new Error(
        'TWILIO_PUBLIC_BASE_URL is required for outbound Twilio Voice calls (e.g. TWILIO_PUBLIC_BASE_URL=https://cryptic-enviably-unsterile.ngrok-free.dev in server/.env). Twilio cannot access localhost directly.'
      );
    }

    const callLogId = `CALL-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const twimlUrl = `${publicBaseUrl}/api/integrations/twilio/simple-twiml?callId=${callLogId}`;

    // 6. Resolve message text if not provided
    let messageText = initialMessage;
    if (!messageText) {
      messageText = await resolveDynamicMessageForCall({
        appointmentId,
        patientId,
      });
    }

    // 7. Record initial CallLog in PostgreSQL
    let effectivePatientId = patientId;
    if (!effectivePatientId) {
      // Find patient matching phone if possible
      const matched = await prisma.patientProfile.findFirst({
        where: { phone: normalizedRecipient },
      });
      if (matched) effectivePatientId = matched.patientId;
    }

    if (effectivePatientId) {
      await prisma.callLog.create({
        data: {
          callId: callLogId,
          patientId: effectivePatientId,
          appointmentId: appointmentId || null,
          phone: normalizedRecipient,
          patientName,
          purpose,
          status: 'QUEUED',
          transcription: messageText,
          durationSeconds: 0,
        },
      }).catch(() => { });
    }

    console.log('[Twilio Voice] Creating PSTN call', {
      to: normalizedRecipient,
      from: ENV.TWILIO_PHONE_NUMBER,
      twimlUrl,
      callLogId,
    });

    // 8. Place Outbound Call via Twilio REST API
    try {
      const twilioClient = getTwilioClient();

      const call = await twilioClient.calls.create({
        to: normalizedRecipient,
        from: ENV.TWILIO_PHONE_NUMBER,
        url: twimlUrl,
      });

      // Update CallLog with real Twilio callSid
      if (effectivePatientId) {
        await prisma.callLog.updateMany({
          where: { callId: callLogId },
          data: {
            callSid: call.sid,
            status: call.status ? call.status.toUpperCase() : 'QUEUED',
          },
        }).catch(() => { });
      }

      return {
        success: true,
        callSid: call.sid,
        to: normalizedRecipient,
        status: call.status,
        callId: callLogId,
        appointmentId,
        message: messageText,
      };
    } catch (err: any) {
      const friendlyMessage = mapTwilioError(err);
      console.error(`❌ [Twilio Voice Error] ${friendlyMessage}`, err.code ? `(Code: ${err.code})` : '');

      if (effectivePatientId) {
        await prisma.callLog.updateMany({
          where: { callId: callLogId },
          data: {
            status: 'FAILED',
          },
        }).catch(() => { });
      }

      throw new Error(friendlyMessage);
    }
  }

  /**
   * Generates dynamic TwiML XML or speaks specific text
   */
  static generateTwiML(textToSpeak: string): string {
    const safeText = escapeXml(textToSpeak);
    return `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Say>${safeText}</Say>\n</Response>`;
  }

  /**
   * Handles Twilio outbound call initiation for general patient outreach
   */
  static async initiateOutboundCall(params: InitiateVoiceCallParams) {
    const { patientId, appointmentId, textMessage, purpose = 'Automated Post-Discharge Reminder' } = params;

    const patient = await prisma.patientProfile.findUnique({
      where: { patientId },
    });

    if (!patient) {
      throw new Error(`Patient not found with ID: ${patientId}`);
    }

    const rawRecipient = params.phone || patient.phone;
    const patientName = params.patientName || patient.name;

    let messageToUse = textMessage;
    if (!messageToUse && appointmentId) {
      const appt = await prisma.appointment.findUnique({
        where: { appointmentId },
      });
      if (appt) {
        messageToUse = generateAppointmentVoiceMessage(appt, patient);
      }
    }

    return this.makeSimpleCall({
      recipient: rawRecipient,
      message: messageToUse,
      patientName,
      patientId,
      appointmentId,
      purpose,
    });
  }

  /**
   * Direct voice call alias
   */
  static async initiateDirectCall(params: DirectVoiceCallParams) {
    const {
      recipient: rawRecipient,
      textMessage,
      patientName,
      patientId,
      appointmentId,
      purpose,
    } = params;

    return this.makeSimpleCall({
      recipient: rawRecipient,
      message: textMessage,
      patientName,
      patientId,
      appointmentId,
      purpose,
    });
  }

  /**
   * Handles Twilio status callback webhooks and updates PostgreSQL CallLog
   */
  static async handleStatusCallback(queryLogId: string, body: any) {
    const { CallSid, CallStatus, CallDuration, Duration } = body;

    const durationSeconds = parseInt(CallDuration || Duration || '0', 10);
    const mappedStatus = CallStatus ? CallStatus.toUpperCase() : 'COMPLETED';

    const existingLog = await prisma.callLog.findFirst({
      where: {
        OR: [
          { callId: queryLogId },
          { callSid: CallSid },
        ],
      },
    });

    if (!existingLog) {
      return null;
    }

    const isCompleted = mappedStatus === 'COMPLETED' || mappedStatus === 'NO-ANSWER' || mappedStatus === 'BUSY' || mappedStatus === 'FAILED';

    const updated = await prisma.callLog.update({
      where: { id: existingLog.id },
      data: {
        status: mappedStatus === 'NO-ANSWER' ? 'NO_ANSWER' : mappedStatus,
        durationSeconds: durationSeconds || existingLog.durationSeconds,
        endedAt: isCompleted ? new Date() : existingLog.endedAt,
      },
    });

    return updated;
  }
}

export default TwilioVoiceService;
