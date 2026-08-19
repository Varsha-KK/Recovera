import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log('SID:', process.env.TWILIO_ACCOUNT_SID ? 'SET' : 'MISSING');
console.log('API KEY SID:', process.env.TWILIO_API_KEY_SID ? 'SET' : 'MISSING');
console.log('API KEY SECRET:', process.env.TWILIO_API_KEY_SECRET ? 'SET' : 'MISSING');
console.log('PHONE:', process.env.TWILIO_PHONE_NUMBER || 'MISSING');
console.log('TEST NUMBER 1:', process.env.TWILIO_TEST_NUMBER_1 ? 'SET' : 'MISSING');
console.log('TEST NUMBER 2:', process.env.TWILIO_TEST_NUMBER_2 ? 'SET' : 'MISSING');
console.log('TEST NUMBER 3:', process.env.TWILIO_TEST_NUMBER_3 ? 'SET' : 'MISSING');
console.log('SMS ENABLED:', process.env.TWILIO_SMS_ENABLED === 'true' || process.env.SMS_ENABLED === 'true' ? 'ENABLED' : 'DISABLED');
console.log('VOICE ENABLED:', process.env.VOICE_CALL_ENABLED === 'true' ? 'ENABLED' : 'DISABLED');
