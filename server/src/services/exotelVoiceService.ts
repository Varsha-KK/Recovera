import axios from 'axios';
import { ENV } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import {
  getExotelAuthHeaders,
  isExotelConfigured,
  parseExotelError,
} from './exotelClient.js';
import { normalizePhoneNumber } from './phoneUtils.js';
import {
  generateAppointmentVoiceMessage,
  resolveDynamicMessageForCall,
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

export class ExotelVoiceService {
  /**
   * Places a real outbound Exotel voice call for an appointment.
   * Patient phone number is taken dynamically from PostgreSQL.
   */
  static async makeAppointmentCall(params: {
    appointmentId: string;
    phoneOverride?: string;
  }) {
    const { appointmentId, phoneOverride } = params;

    const appointment = await prisma.appointment.findUnique({
      where: { appointmentId },
      include: { patient: true },
    });

    if (!appointment) {
      throw new Error(
        `Appointment not found in database with ID: ${appointmentId} `
      );
    }

    if (!appointment.patient) {
      throw new Error(
        `No associated patient found for appointment ${appointmentId}`
      );
    }

    const patient = appointment.patient;

    // Patient phone is taken dynamically from the database.
    const rawRecipient =
      phoneOverride || patient.phone;

    if (!rawRecipient) {
      throw new Error(
        `No phone number available for patient ${patient.name}(${patient.patientId})`
      );
    }

    // Generate appointment-specific voice message.
    const dynamicMessage =
      generateAppointmentVoiceMessage(
        appointment,
        patient
      );

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
   * Initiates an outbound Exotel voice call.
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

    // ---------------------------------------------------------
    // 1. Check voice calling
    // ---------------------------------------------------------

    if (!ENV.VOICE_CALL_ENABLED) {
      throw new Error(
        'Voice call service is disabled in server configuration (VOICE_CALL_ENABLED=false).'
      );
    }

    // ---------------------------------------------------------
    // 2. Check Exotel credentials
    // ---------------------------------------------------------

    if (!isExotelConfigured()) {
      throw new Error(
        'Voice service is not configured. Please configure Exotel credentials in server/.env.'
      );
    }

    // ---------------------------------------------------------
    // 3. Exotel virtual number
    // ---------------------------------------------------------

    const callerId =
      ENV.EXOTEL_VOICE_EXOPHONE;

    if (!callerId) {
      throw new Error(
        'EXOTEL_VOICE_EXOPHONE is not configured in server/.env. ' +
        'An Exotel virtual number (ExoPhone) is required as CallerId.'
      );
    }

    // ---------------------------------------------------------
    // 4. Normalize patient phone
    // ---------------------------------------------------------

    const normalizedRecipient =
      normalizePhoneNumber(rawRecipient);

    if (!normalizedRecipient) {
      throw new Error(
        `Invalid phone number format: "${rawRecipient}". ` +
        'Phone numbers must be valid (for example +919844328475).'
      );
    }

    // ---------------------------------------------------------
    // 5. Check Exotel Flow/App ID
    // ---------------------------------------------------------

    if (!ENV.EXOTEL_VOICE_APP_ID) {
      throw new Error(
        'EXOTEL_VOICE_APP_ID is not configured in server/.env.'
      );
    }

    // ---------------------------------------------------------
    // 6. Exotel Flow URL
    // ---------------------------------------------------------

    const flowUrl =
      `http://my.exotel.com/${ENV.EXOTEL_ACCOUNT_SID}` +
      `/exoml/start_voice/${ENV.EXOTEL_VOICE_APP_ID}`;

    // ---------------------------------------------------------
    // 7. Internal Recovera CallLog ID
    // ---------------------------------------------------------

    const callLogId =
      `CALL-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 6)}`;

    // ---------------------------------------------------------
    // 8. Resolve dynamic message
    // ---------------------------------------------------------

    let messageText =
      initialMessage;

    if (!messageText) {
      messageText =
        await resolveDynamicMessageForCall({
          appointmentId,
          patientId,
        });
    }

    // ---------------------------------------------------------
    // 9. Find patient ID for logging
    // ---------------------------------------------------------

    let effectivePatientId =
      patientId;

    if (!effectivePatientId) {
      const matched =
        await prisma.patientProfile.findFirst({
          where: {
            phone: normalizedRecipient,
          },
        });

      if (matched) {
        effectivePatientId =
          matched.patientId;
      }
    }

    // ---------------------------------------------------------
    // 10. Create initial CallLog
    // ---------------------------------------------------------

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
      });
    }

    // ---------------------------------------------------------
    // 11. Exotel API endpoint
    // ---------------------------------------------------------

    /*
     * IMPORTANT:
     *
     * This endpoint is the same endpoint that worked
     * in the successful PowerShell test.
     */
    const endpoint =
      `https://${ENV.EXOTEL_SUBDOMAIN}` +
      `/v1/Accounts/${ENV.EXOTEL_ACCOUNT_SID}` +
      `/Calls/connect`;

    // ---------------------------------------------------------
    // 12. Exotel authentication
    // ---------------------------------------------------------

    const headers =
      getExotelAuthHeaders();

    // ---------------------------------------------------------
    // 13. Build Exotel request body
    // ---------------------------------------------------------

    const requestBody =
      new URLSearchParams();

    /*
     * IMPORTANT:
     *
     * From     = patient's phone number
     * CallerId = Recovera ExoPhone
     *
     * These parameter names match the successful
     * PowerShell request.
     */

    requestBody.append(
      'From',
      normalizedRecipient
    );

    requestBody.append(
      'CallerId',
      callerId
    );

    requestBody.append(
      'CallType',
      'trans'
    );

    requestBody.append(
      'Url',
      flowUrl
    );

    /*
     * Optional information for Recovera.
     *
     * This does NOT affect the patient number.
     */
    requestBody.append(
      'CustomField',
      callLogId
    );

    // ---------------------------------------------------------
    // 14. Log exact request
    // ---------------------------------------------------------

    console.log(
      '[Exotel Voice] Initiating outbound call',
      {
        toPatient:
          normalizedRecipient,
        callerId,
        flowUrl,
        appId:
          ENV.EXOTEL_VOICE_APP_ID,
        callLogId,
      }
    );

    console.log(
      '[Exotel Voice] Request details:',
      {
        endpoint,
        From: normalizedRecipient,
        CallerId: callerId,
        CallType: 'trans',
        Url: flowUrl,
        CustomField: callLogId,
      }
    );
    // ---------------------------------------------------------
    // 15. Send request to Exotel
    // ---------------------------------------------------------

    try {
      console.log(
        `📞 [Exotel Voice] Calling patient ${normalizedRecipient}...`
      );

      const response =
        await axios.post(
          endpoint,
          requestBody.toString(),
          {
            headers: {
              ...headers,
              'Content-Type':
                'application/x-www-form-urlencoded',
              Accept:
                'application/json',
            },
            timeout:
              30000,
          }
        );

      // -------------------------------------------------------
      // 16. Exotel response
      // -------------------------------------------------------

      const data = response.data;

      console.log(
        '[Exotel Voice] API response:',
        data
      );

      // Exotel returns XML for the Flow API.
      // Extract the real Call SID and status from the XML.
      const xmlData = String(data);

      const sidMatch =
        xmlData.match(
          /<Sid>([^<]+)<\/Sid>/i
        );

      const statusMatch =
        xmlData.match(
          /<Status>([^<]+)<\/Status>/i
        );

      const callSid =
        sidMatch?.[1]?.trim();

      const exotelStatus =
        statusMatch?.[1]?.trim();

      if (!callSid) {
        throw new Error(
          'Exotel response did not contain a Call SID.'
        );
      }

      const status =
        exotelStatus
          ? exotelStatus.toUpperCase()
          : 'QUEUED';

      console.log(
        '[Exotel Voice] Parsed Exotel response:',
        {
          callSid,
          status,
        }
      );

      // -------------------------------------------------------
      // 17. Update CallLog
      // -------------------------------------------------------

      const updatedCallLog = await prisma.callLog.update({
        where: {
          callId: callLogId,
        },
        data: {
          callSid,
          status,
        },
      });

      console.log('[Exotel Voice] CallLog mapped to Exotel CallSid:', {
        callLogId: updatedCallLog.callId,
        callSid: updatedCallLog.callSid,
        patientName: updatedCallLog.patientName,
      });
      // -------------------------------------------------------
      // 18. Return success
      // -------------------------------------------------------

      return {
        success:
          true,
        message:
          'Voice call initiated successfully via Exotel.',
        callSid,
        to:
          normalizedRecipient,
        status,
        callId:
          callLogId,
        appointmentId,
        messageText,
      };

    } catch (err: any) {

      // -------------------------------------------------------
      // 19. Parse Exotel error
      // -------------------------------------------------------

      const parsedError =
        parseExotelError(err);

      const friendlyMessage =
        parsedError.message;

      console.error(
        `❌ [Exotel Voice Error] ${friendlyMessage}`,
        parsedError.statusCode
          ? `(HTTP ${parsedError.statusCode})`
          : ''
      );

      // Log complete error for backend debugging.
      console.error(
        '[Exotel Voice Error Details]',
        err?.response?.data ||
        err?.message ||
        err
      );

      // -------------------------------------------------------
      // 20. Update failed CallLog
      // -------------------------------------------------------

      if (effectivePatientId) {
        await prisma.callLog
          .updateMany({
            where: {
              callId:
                callLogId,
            },
            data: {
              status:
                'FAILED',
            },
          })
          .catch(() => { });
      }

      throw new Error(
        `Exotel Voice call failed: ${friendlyMessage}`
      );
    }
  }

  /**
   * General patient outreach call.
   */
  static async initiateOutboundCall(
    params: InitiateVoiceCallParams
  ) {
    const {
      patientId,
      appointmentId,
      textMessage,
      purpose =
      'Automated Post-Discharge Reminder',
    } = params;

    const patient =
      await prisma.patientProfile.findUnique({
        where: {
          patientId,
        },
      });

    if (!patient) {
      throw new Error(
        `Patient not found with ID: ${patientId}`
      );
    }

    // Dynamic patient phone.
    const rawRecipient =
      params.phone ||
      patient.phone;

    const patientName =
      params.patientName ||
      patient.name;

    let messageToUse =
      textMessage;

    // Generate appointment-specific message.
    if (
      !messageToUse &&
      appointmentId
    ) {
      const appt =
        await prisma.appointment.findUnique({
          where: {
            appointmentId,
          },
        });

      if (appt) {
        messageToUse =
          generateAppointmentVoiceMessage(
            appt,
            patient
          );
      }
    }

    return this.makeSimpleCall({
      recipient:
        rawRecipient,
      message:
        messageToUse,
      patientName,
      patientId,
      appointmentId,
      purpose,
    });
  }

  /**
   * Direct voice call.
   */
  static async initiateDirectCall(
    params: DirectVoiceCallParams
  ) {
    const {
      recipient:
      rawRecipient,
      textMessage,
      patientName,
      patientId,
      appointmentId,
      purpose,
    } = params;

    return this.makeSimpleCall({
      recipient:
        rawRecipient,
      message:
        textMessage,
      patientName,
      patientId,
      appointmentId,
      purpose,
    });
  }

  /**
   * Handle Exotel call status callback.
   */
  static async handleStatusCallback(
    queryLogId: string,
    body: any
  ) {
    const callSid =
      body?.CallSid ||
      body?.callSid ||
      body?.Sid ||
      body?.sid;

    const callStatus =
      body?.Status ||
      body?.status ||
      body?.CallStatus;

    const duration =
      body?.Duration ||
      body?.duration ||
      body?.Legs?.[0]?.Duration;

    const durationSeconds =
      parseInt(
        duration || '0',
        10
      );

    const mappedStatus =
      callStatus
        ? String(
          callStatus
        ).toUpperCase()
        : 'COMPLETED';

    const existingLog =
      await prisma.callLog.findFirst({
        where: {
          OR: [
            {
              callId:
                queryLogId,
            },
            {
              callSid,
            },
          ],
        },
      });

    if (!existingLog) {
      return null;
    }

    const isCompleted =
      mappedStatus ===
      'COMPLETED' ||
      mappedStatus ===
      'NO-ANSWER' ||
      mappedStatus ===
      'BUSY' ||
      mappedStatus ===
      'FAILED';

    const updated =
      await prisma.callLog.update({
        where: {
          id:
            existingLog.id,
        },
        data: {
          status:
            mappedStatus ===
              'NO-ANSWER'
              ? 'NO_ANSWER'
              : mappedStatus,

          durationSeconds:
            durationSeconds ||
            existingLog.durationSeconds,

          endedAt:
            isCompleted
              ? new Date()
              : existingLog.endedAt,
        },
      });

    return updated;
  }
}

export default ExotelVoiceService;
