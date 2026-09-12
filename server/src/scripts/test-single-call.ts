import axios from 'axios';

async function testSingleCall() {
  console.log('\n1️⃣ Testing POST http://localhost:5000/api/integrations/exotel/test-call...');
  try {
    const res = await axios.post('http://localhost:5000/api/integrations/exotel/test-call', {
      phone: '+919844328475',
      message: 'Hello. This is Recovera regarding your upcoming clinical follow-up consultation.',
    });
    console.log('✅ Exotel Call Response:');
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err: any) {
    console.log('ℹ️ Exotel Call Response / Status:');
    console.log('HTTP Status:', err.response?.status);
    console.log('Data:', err.response?.data);
  }
}

testSingleCall();
