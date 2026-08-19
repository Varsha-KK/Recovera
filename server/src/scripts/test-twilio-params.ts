import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import twilio from 'twilio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const client = twilio(process.env.TWILIO_API_KEY_SID, process.env.TWILIO_API_KEY_SECRET, {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
});

async function testWithUrl() {
  console.log('Testing with url: http://demo.twilio.com/docs/voice.xml ...');
  try {
    const call = await client.calls.create({
      to: '+919844328475',
      from: process.env.TWILIO_PHONE_NUMBER,
      url: 'http://demo.twilio.com/docs/voice.xml',
    });
    console.log('✅ Call created successfully with url! Call SID:', call.sid, 'Status:', call.status);
  } catch (err: any) {
    console.error('❌ Error with url:', err.message, 'Code:', err.code);
  }
}

testWithUrl();
