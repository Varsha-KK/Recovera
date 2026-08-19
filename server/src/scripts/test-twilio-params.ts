import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import twilio from 'twilio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
});

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const apiKeySid = process.env.TWILIO_API_KEY_SID;
const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;
const twilioPhoneNumber: string = process.env.TWILIO_PHONE_NUMBER ?? '';

if (!accountSid) {
  throw new Error('TWILIO_ACCOUNT_SID is not configured.');
}

if (!apiKeySid) {
  throw new Error('TWILIO_API_KEY_SID is not configured.');
}

if (!apiKeySecret) {
  throw new Error('TWILIO_API_KEY_SECRET is not configured.');
}

if (!twilioPhoneNumber) {
  throw new Error('TWILIO_PHONE_NUMBER is not configured.');
}

const client = twilio(apiKeySid, apiKeySecret, {
  accountSid,
});

async function testWithUrl(): Promise<void> {
  console.log(
    'Testing with url: http://demo.twilio.com/docs/voice.xml ...'
  );

  try {
    const call = await client.calls.create({
      to: '+919844328475',
      from: twilioPhoneNumber,
      url: 'http://demo.twilio.com/docs/voice.xml',
    });

    console.log(
      '✅ Call created successfully with url!',
      'Call SID:',
      call.sid,
      'Status:',
      call.status
    );
  } catch (err: unknown) {
    const error = err as {
      message?: string;
      code?: string | number;
    };

    console.error(
      '❌ Error with url:',
      error.message ?? 'Unknown error',
      'Code:',
      error.code ?? 'Unknown'
    );
  }
}

testWithUrl();