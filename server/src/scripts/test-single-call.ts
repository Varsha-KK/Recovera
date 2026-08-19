import axios from 'axios';

async function testSingleCall() {
  console.log('1️⃣ Testing GET http://localhost:5000/api/integrations/twilio/simple-twiml...');
  const twimlRes = await axios.get('http://localhost:5000/api/integrations/twilio/simple-twiml');
  console.log('Content-Type:', twimlRes.headers['content-type']);
  console.log('TwiML XML Payload:\n' + twimlRes.data);

  console.log('\n2️⃣ Testing POST http://localhost:5000/api/integrations/twilio/test-call...');
  try {
    const res = await axios.post('http://localhost:5000/api/integrations/twilio/test-call', {
      recipientIndex: 1,
    });
    console.log('✅ Twilio Call Accepted Response:');
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err: any) {
    console.log('ℹ️ Twilio Call Response / Error:');
    console.log('HTTP Status:', err.response?.status);
    console.log('Data:', err.response?.data);
  }
}

testSingleCall();
