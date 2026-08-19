import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function testAuth() {
  console.log('--- Testing Auth Flow ---');

  const testEmail = `test.patient.${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  try {
    console.log('1. Registering Patient:', testEmail);
    const regRes = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test Patient',
      email: testEmail,
      password: testPassword,
      phone: '+919844328475',
      role: 'PATIENT',
    });

    console.log('Registration Status:', regRes.status);
    console.log('Registration Response:', JSON.stringify(regRes.data, null, 2));

    console.log('\n2. Logging in with new credentials...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: testPassword,
    });
    console.log('Login Status:', loginRes.status);
    console.log('Login Response:', JSON.stringify(loginRes.data, null, 2));

    console.log('\n3. Testing /auth/me with JWT...');
    const meRes = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${loginRes.data.token}` },
    });
    console.log('/auth/me Status:', meRes.status);
    console.log('/auth/me Response:', JSON.stringify(meRes.data, null, 2));

    console.log('\n4. Testing duplicate registration (should return 409)...');
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Test Patient',
        email: testEmail,
        password: testPassword,
        phone: '+919844328475',
        role: 'PATIENT',
      });
      console.error('FAILED: Duplicate registration did not throw an error');
    } catch (dupErr: any) {
      console.log('Duplicate Email Error Status:', dupErr.response?.status);
      console.log('Duplicate Email Error Data:', dupErr.response?.data);
    }

    console.log('\n5. Testing wrong password login (should return 401)...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: testEmail,
        password: 'WrongPassword123!',
      });
      console.error('FAILED: Wrong password login did not throw an error');
    } catch (pwErr: any) {
      console.log('Wrong Password Error Status:', pwErr.response?.status);
      console.log('Wrong Password Error Data:', pwErr.response?.data);
    }

    console.log('\n--- Auth Flow Tests Completed Successfully! ---');
  } catch (err: any) {
    console.error('Auth Test Failed:', err.response?.data || err.message);
  }
}

testAuth();
