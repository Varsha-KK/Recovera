import { Router } from 'express';
import {
  getTwilioStatus,
  sendTestSms,
  sendTestCall,
  getSimpleTwiml,
} from '../controllers/integrationController.js';

const router = Router();

// Twilio Diagnostic Status
router.get('/twilio/status', getTwilioStatus);

// Twilio Simple TwiML Endpoint (Supports both GET and POST webhooks from Twilio)
router.all('/twilio/simple-twiml', getSimpleTwiml);

// Twilio Safe Test Endpoints (Development / Testing)
router.post('/twilio/test-sms', sendTestSms);
router.post('/twilio/test-call', sendTestCall);

export default router;
