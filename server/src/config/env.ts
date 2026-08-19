import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory or root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  SERVER_URL: process.env.SERVER_URL || 'http://localhost:5000',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/recovera?schema=public',
  JWT_SECRET: process.env.JWT_SECRET || 'recovera_secure_jwt_secret_key_prod_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  DEV_ADMIN_PASSWORD: process.env.DEV_ADMIN_PASSWORD || 'RecoveraAdmin2026!',

  // Twilio Configuration
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
  TWILIO_API_KEY_SID: process.env.TWILIO_API_KEY_SID || '',
  TWILIO_API_KEY_SECRET: process.env.TWILIO_API_KEY_SECRET || '',
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || '',
  TWILIO_PUBLIC_BASE_URL: process.env.TWILIO_PUBLIC_BASE_URL || process.env.TWILIO_TWIML_URL || '',
  TWILIO_TWIML_URL: process.env.TWILIO_TWIML_URL || '',

  // Twilio Test Recipient Allowlist
  TWILIO_TEST_NUMBER_1: process.env.TWILIO_TEST_NUMBER_1 || '',
  TWILIO_TEST_NUMBER_2: process.env.TWILIO_TEST_NUMBER_2 || '',
  TWILIO_TEST_NUMBER_3: process.env.TWILIO_TEST_NUMBER_3 || '',

  // ElevenLabs Voice Configuration
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY || '',
  ELEVENLABS_VOICE_ID: process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM', // Rachel / Healthcare voice

  // Web Push VAPID Configuration
  VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY || '',
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY || '',
  VAPID_SUBJECT: process.env.VAPID_SUBJECT || 'mailto:support@recovera.health',

  // Feature Flags
  SMS_ENABLED:
    process.env.TWILIO_SMS_ENABLED === 'true' ||
    process.env.SMS_ENABLED === 'true' ||
    (process.env.TWILIO_SMS_ENABLED !== 'false' && process.env.SMS_ENABLED !== 'false'),
  VOICE_CALL_ENABLED:
    process.env.VOICE_CALL_ENABLED === 'true' || process.env.VOICE_CALL_ENABLED !== 'false',
  WEB_PUSH_ENABLED:
    process.env.WEB_PUSH_ENABLED === 'true' || process.env.WEB_PUSH_ENABLED !== 'false',
};

// Check service configuration statuses
export const getServiceStatus = () => {
  const isTwilioConfigured = Boolean(
    ENV.TWILIO_ACCOUNT_SID &&
    ENV.TWILIO_API_KEY_SID &&
    ENV.TWILIO_API_KEY_SECRET &&
    ENV.TWILIO_PHONE_NUMBER &&
    !ENV.TWILIO_ACCOUNT_SID.startsWith('AC000000')
  );

  const isElevenLabsConfigured = Boolean(
    ENV.ELEVENLABS_API_KEY &&
    !ENV.ELEVENLABS_API_KEY.startsWith('000000')
  );

  const isWebPushConfigured = Boolean(
    ENV.VAPID_PUBLIC_KEY &&
    ENV.VAPID_PRIVATE_KEY
  );

  // Count configured test numbers
  const testRecipientsCount = [
    ENV.TWILIO_TEST_NUMBER_1,
    ENV.TWILIO_TEST_NUMBER_2,
    ENV.TWILIO_TEST_NUMBER_3,
  ].filter((n) => Boolean(n && n.trim())).length;

  return {
    twilioSms: {
      configured: isTwilioConfigured && ENV.SMS_ENABLED,
      enabled: ENV.SMS_ENABLED,
      accountSid: isTwilioConfigured ? `${ENV.TWILIO_ACCOUNT_SID.slice(0, 4)}••••••••` : null,
      apiKeySid: isTwilioConfigured ? `${ENV.TWILIO_API_KEY_SID.slice(0, 4)}••••••••` : null,
      phoneNumber: isTwilioConfigured && ENV.TWILIO_PHONE_NUMBER ? `+1•••${ENV.TWILIO_PHONE_NUMBER.slice(-4)}` : null,
      testRecipientsConfigured: testRecipientsCount,
    },
    twilioVoice: {
      configured: isTwilioConfigured && ENV.VOICE_CALL_ENABLED,
      enabled: ENV.VOICE_CALL_ENABLED,
      accountSid: isTwilioConfigured ? `${ENV.TWILIO_ACCOUNT_SID.slice(0, 4)}••••••••` : null,
      apiKeySid: isTwilioConfigured ? `${ENV.TWILIO_API_KEY_SID.slice(0, 4)}••••••••` : null,
      phoneNumber: isTwilioConfigured && ENV.TWILIO_PHONE_NUMBER ? `+1•••${ENV.TWILIO_PHONE_NUMBER.slice(-4)}` : null,
      testRecipientsConfigured: testRecipientsCount,
    },
    elevenLabs: {
      configured: isElevenLabsConfigured,
      voiceId: ENV.ELEVENLABS_VOICE_ID,
      maskedKey: isElevenLabsConfigured ? `sk_••••••••${ENV.ELEVENLABS_API_KEY.slice(-4)}` : null,
    },
    webPush: {
      configured: isWebPushConfigured && ENV.WEB_PUSH_ENABLED,
      enabled: ENV.WEB_PUSH_ENABLED,
      subject: ENV.VAPID_SUBJECT,
    },
  };
};

export default ENV;
