import axios from 'axios';
import { prisma } from './config/prisma.js';
import bcrypt from 'bcrypt';

const BASE_URL = 'http://localhost:5000/api';

async function runAuthTestSuite() {
  console.log('🧪 ========================================================');
  console.log('🧪 RECOVERA COMPLETE AUTHENTICATION & SECURITY TEST SUITE');
  console.log('🧪 ========================================================\n');

  const timestamp = Date.now();
  const patientEmail = `patient.test.${timestamp}@recovera.test`;
  const coordinatorEmail = `coordinator.test.${timestamp}@recovera.test`;
  const testPassword = 'SecurePassword123!';

  try {
    // TEST 1: Register New Patient
    console.log('1️⃣ [Patient Registration] Registering patient with Indian phone format...');
    const patientReg = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Rajesh Kumar',
      email: patientEmail,
      password: testPassword,
      phone: '+919844328475',
      role: 'PATIENT',
    });

    console.log('   ✅ Patient Registration Response Status:', patientReg.status);
    console.log('   ✅ User ID:', patientReg.data.user.id);
    console.log('   ✅ Role:', patientReg.data.user.role);
    console.log('   ✅ Patient ID Linked:', patientReg.data.user.patientId);
    console.log('   ✅ JWT Generated:', !!patientReg.data.token);

    // Verify in PostgreSQL via Prisma
    const dbUser = await prisma.user.findUnique({
      where: { email: patientEmail },
      include: { patientProfile: true },
    });

    if (!dbUser) throw new Error('Database verification failed: User not found in PostgreSQL!');
    if (!dbUser.password.startsWith('$2')) throw new Error('Password security violation: Plaintext detected!');
    const isPasswordHashed = await bcrypt.compare(testPassword, dbUser.password);
    if (!isPasswordHashed) throw new Error('Bcrypt hash comparison failed!');
    console.log('   ✅ PostgreSQL Database Verification Passed (Bcrypt hash verified, plain password NOT stored)');
    console.log('   ✅ PatientProfile Record Verified:', dbUser.patientProfile?.patientId);

    // TEST 2: Register New Care Coordinator
    console.log('\n2️⃣ [Care Coordinator Registration] Registering hospital staff user...');
    const coordReg = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Dr. Emily Watson',
      email: coordinatorEmail,
      password: testPassword,
      phone: '+1 (555) 888-9999',
      role: 'ADMIN',
    });

    console.log('   ✅ Coordinator Registration Response Status:', coordReg.status);
    console.log('   ✅ Coordinator Role:', coordReg.data.user.role);
    console.log('   ✅ JWT Generated:', !!coordReg.data.token);

    // TEST 3: Sign In with Patient
    console.log('\n3️⃣ [Patient Sign In] Authenticating patient credentials...');
    const patientLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: patientEmail,
      password: testPassword,
    });
    console.log('   ✅ Patient Login Status:', patientLogin.status);
    console.log('   ✅ Returned Token:', !!patientLogin.data.token);

    // TEST 4: Session Restoration via /auth/me
    console.log('\n4️⃣ [Session Restoration] Fetching /auth/me with Bearer token...');
    const meResponse = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${patientLogin.data.token}` },
    });
    console.log('   ✅ /auth/me Status:', meResponse.status);
    console.log('   ✅ Restored User Name:', meResponse.data.user.name);
    console.log('   ✅ Restored Role:', meResponse.data.user.role);

    // TEST 5: Sign In with Care Coordinator
    console.log('\n5️⃣ [Coordinator Sign In] Authenticating coordinator credentials...');
    const coordLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: coordinatorEmail,
      password: testPassword,
    });
    console.log('   ✅ Coordinator Login Status:', coordLogin.status);
    console.log('   ✅ Coordinator Role:', coordLogin.data.user.role);

    // TEST 6: Duplicate Email Handling (409 Conflict)
    console.log('\n6️⃣ [Duplicate Email Check] Testing registration with already registered email...');
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Duplicate Patient',
        email: patientEmail,
        password: testPassword,
        phone: '+919844328475',
        role: 'PATIENT',
      });
      throw new Error('FAILED: Server allowed duplicate email registration!');
    } catch (dupErr: any) {
      if (dupErr.response?.status === 409) {
        console.log('   ✅ HTTP 409 Conflict returned as expected:', dupErr.response.data.message);
      } else {
        throw dupErr;
      }
    }

    // TEST 7: Invalid Password Handling (401 Unauthorized)
    console.log('\n7️⃣ [Security Check] Testing login with incorrect password...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: patientEmail,
        password: 'TotallyWrongPassword!',
      });
      throw new Error('FAILED: Server allowed login with incorrect password!');
    } catch (pwErr: any) {
      if (pwErr.response?.status === 401) {
        console.log('   ✅ HTTP 401 Unauthorized returned as expected:', pwErr.response.data.message);
      } else {
        throw pwErr;
      }
    }

    // TEST 8: Validation Error Handling (400 Bad Request)
    console.log('\n8️⃣ [Validation Check] Testing registration with password shorter than 6 chars...');
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Short PW',
        email: `short.${timestamp}@example.com`,
        password: '123',
        role: 'PATIENT',
      });
      throw new Error('FAILED: Server allowed weak password under 6 characters!');
    } catch (valErr: any) {
      if (valErr.response?.status === 400) {
        console.log('   ✅ HTTP 400 Bad Request returned as expected:', valErr.response.data.message);
      } else {
        throw valErr;
      }
    }

    console.log('\n🎉 ========================================================');
    console.log('🎉 ALL 8 AUTHENTICATION & PERSISTENCE TESTS PASSED 100%!');
    console.log('🎉 ========================================================\n');
  } catch (error: any) {
    console.error('❌ Test Suite Execution Failed:', error.response?.data || error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runAuthTestSuite();
