import { Request, Response } from 'express';
import { ENV } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { isTwilioConfigured, parseTwilioError } from '../services/twilioClient.js';
import {
  getTestRecipients,
  getTestRecipientsCount,
  getTestRecipientByIndex,
  maskPhoneNumber,
} from '../services/twilioTestRecipients.js';
import { TwilioSmsService } from '../services/twilioSmsService.js';
import { TwilioVoiceService } from '../services/twilioVoiceService.js';
import {
  resolveDynamicMessageForCall,
  generateDynamicTwiML,
} from '../services/appointmentVoiceService.js';

/**
 * Dynamic public TwiML endpoint for Twilio Voice calls
 * (GET or POST /api/integrations/twilio/simple-twiml)
 * Dynamically resolves the patient and appointment from PostgreSQL and generates the voice message.
 */
export const getSimpleTwiml = async (req: Request, res: Response): Promise<void> => {
  try {
    const callId = (req.query.callId as string) || (req.body?.callId as string);
    const appointmentId = (req.query.appointmentId as string) || (req.body?.appointmentId as string);
    const patientId = (req.query.patientId as string) || (req.body?.patientId as string);

    console.log('📡 [Twilio Webhook] Received TwiML request for callId:', callId || 'none');

    const dynamicMessage = await resolveDynamicMessageForCall({
      callId,
      appointmentId,
      patientId,
    });

    console.log(`🗣️ [Twilio Voice Dynamic Text]: "${dynamicMessage}"`);

    const twimlXml = generateDynamicTwiML(dynamicMessage);

    res.setHeader('Content-Type', 'text/xml; charset=utf-8');
    res.status(200).send(twimlXml);
  } catch (error: any) {
    console.error('❌ [TwiML Endpoint Error]:', error.message);
    const fallbackXml = generateDynamicTwiML(
      'Hello. This is Recovera. Please check your patient portal for your upcoming appointments. Thank you.'
    );
    res.setHeader('Content-Type', 'text/xml; charset=utf-8');
    res.status(200).send(fallbackXml);
  }
};

/**
 * Returns safe diagnostic status of Twilio integration
 * (GET /api/integrations/twilio/status)
 */
export const getTwilioStatus = async (_req: Request, res: Response): Promise<void> => {
  try {
    const configured = isTwilioConfigured();
    const publicBaseUrl = ENV.TWILIO_PUBLIC_BASE_URL?.replace(/\/+$/, '');
    const twimlUrl = publicBaseUrl ? `${publicBaseUrl}/api/integrations/twilio/simple-twiml` : null;

    res.status(200).json({
      success: true,
      configured,
      voiceEnabled: ENV.VOICE_CALL_ENABLED,
      smsEnabled: ENV.SMS_ENABLED,
      publicBaseUrlConfigured: Boolean(publicBaseUrl),
      twimlUrl,
      accountSid: configured ? `${ENV.TWILIO_ACCOUNT_SID.slice(0, 4)}••••••••` : null,
      apiKeyConfigured: Boolean(ENV.TWILIO_API_KEY_SID && ENV.TWILIO_API_KEY_SECRET),
      phoneConfigured: Boolean(ENV.TWILIO_PHONE_NUMBER),
      testRecipientsConfigured: getTestRecipientsCount(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve Twilio integration status.',
    });
  }
};

/**
 * Sends a live test SMS to one of the configured test recipient indices or for an appointment in PostgreSQL
 * (POST /api/integrations/twilio/test-sms)
 */
export const sendTestSms = async (req: Request, res: Response): Promise<void> => {
  try {
    const { recipientIndex, appointmentId, patientId, message } = req.body || {};

    // 1. If appointmentId is provided
    if (appointmentId) {
      const result = await TwilioSmsService.sendAppointmentSMS({
        appointmentId,
      });

      res.status(200).json({
        success: true,
        message: 'SMS sent successfully.',
        data: {
          providerMessageId: result.providerMessageId,
          status: result.status,
          recipient: maskPhoneNumber(result.recipient),
          text: result.text,
          appointmentId: result.appointmentId,
        },
      });
      return;
    }

    // 2. If recipientIndex is provided
    if (recipientIndex !== undefined) {
      const index = parseInt(recipientIndex, 10);
      if (!index || index < 1 || index > 3) {
        res.status(400).json({
          success: false,
          message: 'recipientIndex must be 1, 2, or 3.',
        });
        return;
      }

      const targetRecipient = getTestRecipientByIndex(index);

      if (!targetRecipient) {
        res.status(400).json({
          success: false,
          message: `Recipient index ${index} is not configured in server/.env (TWILIO_TEST_NUMBER_${index}).`,
        });
        return;
      }

      // Check if this patient has an appointment in PostgreSQL
      const patient = await prisma.patientProfile.findFirst({
        where: { phone: targetRecipient },
        include: {
          appointments: {
            orderBy: { scheduledDate: 'desc' },
            take: 1,
          },
        },
      });

      if (patient && patient.appointments.length > 0 && !message) {
        const latestAppt = patient.appointments[0];
        const result = await TwilioSmsService.sendAppointmentSMS({
          appointmentId: latestAppt.appointmentId,
          phoneOverride: targetRecipient,
        });

        res.status(200).json({
          success: true,
          message: 'SMS sent successfully.',
          data: {
            providerMessageId: result.providerMessageId,
            status: result.status,
            recipient: maskPhoneNumber(targetRecipient),
            text: result.text,
            appointmentId: result.appointmentId,
          },
        });
        return;
      }

      const result = await TwilioSmsService.sendDirectSMS({
        recipient: targetRecipient,
        message: message || 'Recovera test reminder.',
        patientId: patient?.patientId,
      });

      res.status(200).json({
        success: true,
        message: 'SMS sent successfully.',
        data: {
          providerMessageId: result.providerMessageId,
          status: result.status,
          recipient: maskPhoneNumber(targetRecipient),
          text: result.text,
        },
      });
      return;
    }

    // 3. If patientId is provided
    if (patientId) {
      const result = await TwilioSmsService.sendSMS({
        patientId,
        appointmentId,
        message,
      });

      res.status(200).json({
        success: true,
        message: 'SMS sent successfully.',
        data: {
          providerMessageId: result.providerMessageId,
          status: result.status,
          recipient: maskPhoneNumber(result.recipient),
          text: result.text,
          appointmentId: result.appointmentId,
        },
      });
      return;
    }

    res.status(400).json({
      success: false,
      message: 'Please provide appointmentId, recipientIndex (1, 2, or 3), or patientId.',
    });
  } catch (error: any) {
    const parsed = parseTwilioError(error);
    res.status(400).json({
      success: false,
      code: parsed.code,
      message: parsed.message,
    });
  }
};

/**
 * Initiates a dynamic live PSTN voice call to a patient for an appointment in PostgreSQL
 * (POST /api/integrations/twilio/test-call)
 */
export const sendTestCall = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      recipientIndex,
      appointmentId,
      patientId,
      message,
    } = req.body || {};

    // 1. If explicit appointmentId is provided, trigger call directly from PostgreSQL appointment
    if (appointmentId) {
      const result = await TwilioVoiceService.makeAppointmentCall({
        appointmentId,
      });

      res.status(200).json({
        success: true,
        callSid: result.callSid,
        to: result.to,
        appointmentId: result.appointmentId,
        message: result.message,
      });
      return;
    }

    // 2. If recipientIndex is provided, resolve recipient and search for their latest appointment
    if (recipientIndex !== undefined) {
      const index = parseInt(recipientIndex, 10);
      if (!index || index < 1 || index > 3) {
        res.status(400).json({
          success: false,
          message: 'recipientIndex must be 1, 2, or 3.',
        });
        return;
      }

      const targetRecipient = getTestRecipientByIndex(index);
      if (!targetRecipient) {
        res.status(400).json({
          success: false,
          message: `Recipient index ${index} is not configured in server/.env (TWILIO_TEST_NUMBER_${index}).`,
        });
        return;
      }

      // Check if this patient has an appointment in PostgreSQL
      const patient = await prisma.patientProfile.findFirst({
        where: { phone: targetRecipient },
        include: {
          appointments: {
            orderBy: { scheduledDate: 'desc' },
            take: 1,
          },
        },
      });

      if (patient && patient.appointments.length > 0 && !message) {
        const latestAppt = patient.appointments[0];
        const result = await TwilioVoiceService.makeAppointmentCall({
          appointmentId: latestAppt.appointmentId,
          phoneOverride: targetRecipient,
        });

        res.status(200).json({
          success: true,
          callSid: result.callSid,
          to: result.to,
          appointmentId: result.appointmentId,
          message: result.message,
        });
        return;
      }

      // If no appointment found or custom message provided
      const result = await TwilioVoiceService.makeSimpleCall({
        recipient: targetRecipient,
        message,
        patientId: patient?.patientId,
        patientName: patient?.name || 'Patient',
      });

      res.status(200).json({
        success: true,
        callSid: result.callSid,
        to: targetRecipient,
        message: result.message,
      });
      return;
    }

    // 3. If patientId is provided
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

      if (!patient) {
        res.status(404).json({
          success: false,
          message: `Patient not found with ID: ${patientId}`,
        });
        return;
      }

      if (patient.appointments.length > 0) {
        const latestAppt = patient.appointments[0];
        const result = await TwilioVoiceService.makeAppointmentCall({
          appointmentId: latestAppt.appointmentId,
        });

        res.status(200).json({
          success: true,
          callSid: result.callSid,
          to: result.to,
          appointmentId: result.appointmentId,
          message: result.message,
        });
        return;
      }

      const result = await TwilioVoiceService.makeSimpleCall({
        recipient: patient.phone,
        message,
        patientId: patient.patientId,
        patientName: patient.name,
      });

      res.status(200).json({
        success: true,
        callSid: result.callSid,
        to: result.to,
        message: result.message,
      });
      return;
    }

    res.status(400).json({
      success: false,
      message: 'Please provide appointmentId, recipientIndex (1, 2, or 3), or patientId.',
    });
  } catch (error: any) {
    const parsed = parseTwilioError(error);
    res.status(400).json({
      success: false,
      code: parsed.code,
      message: parsed.message,
    });
  }
};
