import { Router } from 'express';
import {
  sendSms,
  triggerVoiceCall,
  previewAudio,
  getCommunicationLogs,
  getCallLogs,
  serveTwiML,
  serveAudio,
  handleVoiceStatusCallback,
} from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

// Protected communication actions (Authenticated staff & patient)
router.post('/sms', authenticateToken, sendSms);
router.post('/voice', authenticateToken, triggerVoiceCall);
router.post('/voice-preview', authenticateToken, previewAudio);
router.post('/voice/preview-audio', authenticateToken, previewAudio);
router.get('/logs', authenticateToken, getCommunicationLogs);
router.get('/calls', authenticateToken, getCallLogs);
router.get('/call-logs', authenticateToken, getCallLogs);

// Public Webhooks for Twilio Voice & Audio Integration
router.all('/twiml/:audioId', serveTwiML);
router.all('/twiml', serveTwiML);
router.all('/voice/twiml/:audioId', serveTwiML);
router.all('/voice/twiml', serveTwiML);

router.get('/audio/:audioId', serveAudio);
router.get('/voice/audio/:audioId', serveAudio);

router.post('/status-callback', handleVoiceStatusCallback);
router.post('/voice/status-callback', handleVoiceStatusCallback);

export default router;
