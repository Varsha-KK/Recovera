import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { prisma } from '../config/prisma.js';
import { TwilioSmsService } from '../services/twilioSmsService.js';
import { TwilioVoiceService } from '../services/twilioVoiceService.js';
import { ElevenLabsService, audioStore } from '../services/elevenLabsService.js';

export const sendSms = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { patientId, appointmentId, message, recipient } = req.body;

    if (!patientId || !message) {
      res.status(400).json({ success: false, message: 'patientId and message are required.' });
      return;
    }

    const result = await TwilioSmsService.sendSMS({
      patientId,
      appointmentId,
      message,
      recipient,
    });

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Send SMS error:', error.message);
    res.status(400).json({ success: false, message: error.message || 'Failed to dispatch SMS.' });
  }
};

export const triggerVoiceCall = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { patientId, appointmentId, phone, patientName, message, purpose } = req.body;

    if (!patientId) {
      res.status(400).json({ success: false, message: 'patientId is required.' });
      return;
    }

    const textToSpeak = message || 'Hello. This is an automated follow-up reminder from Recovera regarding your upcoming clinical consultation. Please check your Recovera dashboard for details. Thank you.';

    const result = await TwilioVoiceService.initiateOutboundCall({
      patientId,
      appointmentId,
      phone,
      patientName,
      textMessage: textToSpeak,
      purpose: purpose || 'Clinical Outreach Call',
    });

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Trigger voice call error:', error.message);
    res.status(400).json({ success: false, message: error.message || 'Failed to trigger voice call.' });
  }
};

export const previewAudio = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { text } = req.body;

    if (!text) {
      res.status(400).json({ success: false, message: 'text is required.' });
      return;
    }

    const result = await ElevenLabsService.generateReminderAudio(text);

    res.status(200).json({
      success: true,
      audioId: result.audioId,
      audioUrl: result.audioUrl,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Audio synthesis preview failed.' });
  }
};

export const getCommunicationLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { patientId, channel } = req.query;

    const where: any = {};
    if (patientId) where.patientId = String(patientId);
    if (channel && channel !== 'ALL') where.channel = String(channel);

    const logs = await prisma.communicationLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      include: { patient: true },
      take: 50,
    });

    const formatted = logs.map((l) => ({
      logId: l.logId,
      patientId: l.patientId,
      patientName: l.patient?.name || 'Patient',
      appointmentId: l.appointmentId,
      channel: l.channel,
      recipient: l.recipient,
      message: l.message,
      status: l.status,
      timestamp: new Date(l.timestamp).toISOString(),
      metadata: l.metadata,
    }));

    res.status(200).json({ success: true, count: formatted.length, data: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve communication logs.' });
  }
};

export const getCallLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { patientId } = req.query;

    const where: any = {};
    if (patientId) where.patientId = String(patientId);

    const logs = await prisma.callLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { patient: true },
      take: 50,
    });

    const formatted = logs.map((l) => ({
      callId: l.callId,
      patientId: l.patientId,
      patientName: l.patient?.name || l.patientName,
      phone: l.phone,
      purpose: l.purpose,
      callSid: l.callSid,
      status: l.status,
      durationSeconds: l.durationSeconds,
      transcription: l.transcription,
      audioUrl: l.audioUrl,
      date: new Date(l.createdAt).toISOString().split('T')[0],
      time: new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));

    res.status(200).json({ success: true, count: formatted.length, data: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve call logs.' });
  }
};

// ============================================================
// Public Voice Webhooks (Twilio Inbound Audio & Status)
// ============================================================

export const serveTwiML = (req: Request, res: Response): void => {
  const audioId = req.params.audioId ? String(req.params.audioId) : undefined;
  const fallbackText = req.query.text as string | undefined;

  const twiml = TwilioVoiceService.generateTwiML(audioId, fallbackText);
  res.type('text/xml');
  res.send(twiml);
};

export const serveAudio = (req: Request, res: Response): void => {
  const audioId = String(req.params.audioId);
  const cleanedId = audioId.replace(/\.mp3$/, '');

  const buffer = ElevenLabsService.getAudioBuffer(cleanedId);

  if (!buffer) {
    res.status(404).send('Audio file not found or expired.');
    return;
  }

  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Content-Length', buffer.length);
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(buffer);
};

export const handleVoiceStatusCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const callLogId = (req.query.callLogId as string) || '';
    await TwilioVoiceService.handleStatusCallback(callLogId, req.body);
    res.status(200).send('<Response></Response>');
  } catch (error) {
    console.error('Status callback error:', error);
    res.status(200).send('<Response></Response>');
  }
};
