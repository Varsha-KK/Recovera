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

  // Exotel Configuration (SMS & Voice Calls)
  EXOTEL_ACCOUNT_SID: process.env.EXOTEL_ACCOUNT_SID || 'recovera1',
  EXOTEL_SUBDOMAIN: process.env.EXOTEL_SUBDOMAIN || 'api.exotel.com',
  EXOTEL_API_KEY: process.env.EXOTEL_API_KEY || '',
  EXOTEL_API_TOKEN: process.env.EXOTEL_API_TOKEN || '',
  EXOTEL_VOICE_APP_ID: process.env.EXOTEL_VOICE_APP_ID || '1338862',
  EXOTEL_VOICE_GREETING_URL:
    process.env.EXOTEL_VOICE_GREETING_URL || '',


  // Exotel SMS Sender & Voice ExoPhone
  EXOTEL_SMS_SENDER_ID: process.env.EXOTEL_SMS_SENDER_ID || '',
  EXOTEL_VOICE_EXOPHONE: process.env.EXOTEL_VOICE_EXOPHONE || '',

  // Optional TRAI / India DLT Configuration
  EXOTEL_DLT_ENTITY_ID: process.env.EXOTEL_DLT_ENTITY_ID || '',
  EXOTEL_DLT_TEMPLATE_ID: process.env.EXOTEL_DLT_TEMPLATE_ID || '',

  // ElevenLabs Voice Configuration
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY || '',
  ELEVENLABS_VOICE_ID: process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM', // Rachel / Healthcare voice

  // Web Push VAPID Configuration
  VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY || '',
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY || '',
  VAPID_SUBJECT: process.env.VAPID_SUBJECT || 'mailto:support@recovera.health',

  // Feature Flags
  SMS_ENABLED:
    process.env.SMS_ENABLED === 'true' ||
    (process.env.SMS_ENABLED !== 'false'),
  VOICE_CALL_ENABLED:
    process.env.VOICE_CALL_ENABLED === 'true' || process.env.VOICE_CALL_ENABLED !== 'false',
  WEB_PUSH_ENABLED:
    process.env.WEB_PUSH_ENABLED === 'true' || process.env.WEB_PUSH_ENABLED !== 'false',
};

// Check service configuration statuses
export const getServiceStatus = () => {
  const isExotelConfigured = Boolean(
    ENV.EXOTEL_ACCOUNT_SID &&
    ENV.EXOTEL_API_KEY &&
    ENV.EXOTEL_API_TOKEN
  );

  const isElevenLabsConfigured = Boolean(
    ENV.ELEVENLABS_API_KEY &&
    !ENV.ELEVENLABS_API_KEY.startsWith('000000')
  );

  const isWebPushConfigured = Boolean(
    ENV.VAPID_PUBLIC_KEY &&
    ENV.VAPID_PRIVATE_KEY
  );

  const exotelSmsStatus = {
    configured: isExotelConfigured && Boolean(ENV.EXOTEL_SMS_SENDER_ID) && ENV.SMS_ENABLED,
    enabled: ENV.SMS_ENABLED,
    accountSid: isExotelConfigured ? `${ENV.EXOTEL_ACCOUNT_SID.slice(0, 4)}••••` : null,
    subdomain: ENV.EXOTEL_SUBDOMAIN,
    senderId: ENV.EXOTEL_SMS_SENDER_ID || null,
    dltConfigured: Boolean(ENV.EXOTEL_DLT_ENTITY_ID),
  };

  const exotelVoiceStatus = {
    configured: isExotelConfigured && Boolean(ENV.EXOTEL_VOICE_EXOPHONE) && ENV.VOICE_CALL_ENABLED,
    enabled: ENV.VOICE_CALL_ENABLED,
    accountSid: isExotelConfigured ? `${ENV.EXOTEL_ACCOUNT_SID.slice(0, 4)}••••` : null,
    subdomain: ENV.EXOTEL_SUBDOMAIN,
    exoPhone: ENV.EXOTEL_VOICE_EXOPHONE ? `•••${ENV.EXOTEL_VOICE_EXOPHONE.slice(-4)}` : null,
    appId: ENV.EXOTEL_VOICE_APP_ID,
  };

  return {
    exotelSms: exotelSmsStatus,
    exotelVoice: exotelVoiceStatus,
    // Aliases to ensure backward compatibility with existing consumers
    twilioSms: {
      ...exotelSmsStatus,
      phoneNumber: exotelSmsStatus.senderId,
    },
    twilioVoice: {
      ...exotelVoiceStatus,
      phoneNumber: exotelVoiceStatus.exoPhone,
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
