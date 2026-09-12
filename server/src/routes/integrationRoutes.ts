import { Router } from 'express';
import { exotelVoiceGreeting } from '../controllers/exotelVoiceController.js';
import {
  getExotelStatus,
  sendTestSms,
  sendTestCall,
  getSimpleTwiml,
} from '../controllers/integrationController.js';

const router = Router();

// Exotel Diagnostic Status
router.get('/exotel/status', getExotelStatus);
router.get('/exotel/voice-greeting', exotelVoiceGreeting);
router.get('/twilio/status', getExotelStatus); // Compatibility alias

// Audio / TwiML Endpoint
router.all('/twilio/simple-twiml', getSimpleTwiml);

// Test Endpoints
router.post('/exotel/test-sms', sendTestSms);

router.post('/exotel/test-call', sendTestCall);

router.post('/twilio/test-sms', sendTestSms);

router.post('/twilio/test-call', sendTestCall);

export default router;