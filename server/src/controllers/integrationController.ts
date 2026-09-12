import { Request, Response } from 'express';
import { ENV } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { isExotelConfigured, parseExotelError } from '../services/exotelClient.js';
import { maskPhoneNumber, normalizePhoneNumber } from '../services/phoneUtils.js';
import { ExotelSmsService } from '../services/exotelSmsService.js';
import { ExotelVoiceService } from '../services/exotelVoiceService.js';
import {
  resolveDynamicMessageForCall,
  generateDynamicTwiML,
} from '../services/appointmentVoiceService.js';

/**
 * Dynamic TwiML / Audio endpoint (GET or POST /api/integrations/twilio/simple-twiml)
 */
export const getSimpleTwiml = async (req: Request, res: Response): Promise<void> => {
  try {
    const callId = (req.query.callId as string) || (req.body?.callId as string);
    const appointmentId = (req.query.appointmentId as string) || (req.body?.appointmentId as string);
    const patientId = (req.query.patientId as string) || (req.body?.patientId as string);

    const dynamicMessage = await resolveDynamicMessageForCall({
      callId,
      appointmentId,
      patientId,
    });

    const twimlXml = generateDynamicTwiML(dynamicMessage);
    res.setHeader('Content-Type', 'text/xml; charset=utf-8');
    res.status(200).send(twimlXml);
  } catch (error: any) {
    const fallbackXml = generateDynamicTwiML(
      'Hello. This is Recovera. Please check your patient portal for your upcoming appointments. Thank you.'
    );
    res.setHeader('Content-Type', 'text/xml; charset=utf-8');
    res.status(200).send(fallbackXml);
  }
};

/**
 * Returns safe diagnostic status of Exotel integration
 * (GET /api/integrations/exotel/status or GET /api/integrations/twilio/status)
 */
export const getExotelStatus = async (_req: Request, res: Response): Promise<void> => {
  try {
    const configured = isExotelConfigured();

    res.status(200).json({
      success: true,
      configured,
      voiceEnabled: ENV.VOICE_CALL_ENABLED,
      smsEnabled: ENV.SMS_ENABLED,
      accountSid: configured ? `${ENV.EXOTEL_ACCOUNT_SID.slice(0, 4)}••••` : null,
      subdomain: ENV.EXOTEL_SUBDOMAIN,
      smsSenderConfigured: Boolean(ENV.EXOTEL_SMS_SENDER_ID),
      smsSenderId: ENV.EXOTEL_SMS_SENDER_ID || null,
      voiceExoPhoneConfigured: Boolean(ENV.EXOTEL_VOICE_EXOPHONE),
      voiceExoPhone: ENV.EXOTEL_VOICE_EXOPHONE ? maskPhoneNumber(ENV.EXOTEL_VOICE_EXOPHONE) : null,
      voiceAppId: ENV.EXOTEL_VOICE_APP_ID,
      dltConfigured: Boolean(ENV.EXOTEL_DLT_ENTITY_ID),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve Exotel integration status.',
    });
  }
};

export const getTwilioStatus = getExotelStatus;

/**
 * Sends a live SMS for an appointment in PostgreSQL or specified patient via Exotel
 * (POST /api/integrations/exotel/test-sms or POST /api/integrations/twilio/test-sms)
 */
export const sendTestSms = async (req: Request, res: Response): Promise<void> => {
  try {
    const { appointmentId, patientId, phone, message } = req.body || {};

    // 1. If appointmentId is provided
    if (appointmentId) {
      const result = await ExotelSmsService.sendAppointmentSMS({
        appointmentId,
        phoneOverride: phone,
      });

      res.status(200).json({
        success: true,
        message: 'SMS sent successfully via Exotel.',
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

    // 2. If patientId is provided
    if (patientId) {
      const result = await ExotelSmsService.sendSMS({
        patientId,
        appointmentId,
        message,
        recipient: phone,
      });

      res.status(200).json({
        success: true,
        message: 'SMS sent successfully via Exotel.',
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

    // 3. If direct phone is provided
    if (phone) {
      const normalized = normalizePhoneNumber(phone);
      if (!normalized) {
        res.status(400).json({
          success: false,
          message: `Invalid phone format: ${phone}. Must be a valid phone number (e.g. +919844328475).`,
        });
        return;
      }

      const result = await ExotelSmsService.sendDirectSMS({
        recipient: normalized,
        message: message || 'Recovera appointment follow-up reminder.',
      });

      res.status(200).json({
        success: true,
        message: 'SMS sent successfully via Exotel.',
        data: {
          providerMessageId: result.providerMessageId,
          status: result.status,
          recipient: maskPhoneNumber(result.recipient),
          text: result.text,
        },
      });
      return;
    }

    res.status(400).json({
      success: false,
      message: 'Please provide appointmentId, patientId, or phone.',
    });
  } catch (error: any) {
    const parsed = parseExotelError(error);
    res.status(400).json({
      success: false,
      code: parsed.code,
      message: parsed.message,
    });
  }
};

/**
 * Initiates an outbound Exotel voice call for an appointment in PostgreSQL or specified patient
 * (POST /api/integrations/exotel/test-call or POST /api/integrations/twilio/test-call)
 */
export const sendTestCall = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      appointmentId,
      patientId,
      phone,
      message,
    } = req.body || {};

    // 1. If explicit appointmentId is provided
    if (appointmentId) {
      const result = await ExotelVoiceService.makeAppointmentCall({
        appointmentId,
        phoneOverride: phone,
      });

      res.status(200).json({
        success: true,
        callSid: result.callSid,
        to: result.to,
        appointmentId: result.appointmentId,
        message: result.messageText,
      });
      return;
    }

    // 2. If patientId is provided
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
        const result = await ExotelVoiceService.makeAppointmentCall({
          appointmentId: latestAppt.appointmentId,
          phoneOverride: phone,
        });

        res.status(200).json({
          success: true,
          callSid: result.callSid,
          to: result.to,
          appointmentId: result.appointmentId,
          message: result.messageText,
        });
        return;
      }

      const result = await ExotelVoiceService.makeSimpleCall({
        recipient: phone || patient.phone,
        message,
        patientId: patient.patientId,
        patientName: patient.name,
      });

      res.status(200).json({
        success: true,
        callSid: result.callSid,
        to: result.to,
        message: result.messageText,
      });
      return;
    }

    // 3. If direct phone is provided
    if (phone) {
      const normalized = normalizePhoneNumber(phone);
      if (!normalized) {
        res.status(400).json({
          success: false,
          message: `Invalid phone format: ${phone}. Must be a valid phone number (e.g. +919844328475).`,
        });
        return;
      }

      const result = await ExotelVoiceService.makeSimpleCall({
        recipient: normalized,
        message: message || 'Hello. This is Recovera regarding your upcoming clinical follow-up consultation.',
        patientName: 'Patient',
      });

      res.status(200).json({
        success: true,
        callSid: result.callSid,
        to: result.to,
        message: result.messageText,
      });
      return;
    }

    res.status(400).json({
      success: false,
      message: 'Please provide appointmentId, patientId, or phone.',
    });
  } catch (error: any) {
    const parsed = parseExotelError(error);
    res.status(400).json({
      success: false,
      code: parsed.code,
      message: parsed.message,
    });
  }
};
