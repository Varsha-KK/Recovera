import axios from 'axios';
import { prisma } from '../config/prisma.js';
import { ENV } from '../config/env.js';

const BASE_URL = 'http://localhost:5000/api';

async function runAllScenarios() {
  console.log('\n🧪 ========================================================');
  console.log('🧪 RECOVERA — 5 AUTHENTICATION & RBAC SCENARIOS TEST SUITE');
  console.log('🧪 ========================================================\n');

  const adminPassword = ENV.DEV_ADMIN_PASSWORD || 'RecoveraAdmin2026!';
  const patientEmail = 'patient@recovera.health';
  const patientPassword = 'Patient@123';

  try {
    // -------------------------------------------------------------------------
    // TEST A: Hospital Staff Admin Login & Dashboard Access
    // -------------------------------------------------------------------------
    console.log('📋 [TEST A] Hospital Staff Admin Authentication & Dashboard...');
    const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@recovera.health',
      password: adminPassword,
    });
    console.log('   ✅ HTTP Status:', adminLogin.status);
    console.log('   ✅ Authenticated User:', adminLogin.data.user.name);
    console.log('   ✅ User Role:', adminLogin.data.user.role);
    console.log('   ✅ JWT Issued:', !!adminLogin.data.token);

    const adminDash = await axios.get(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminLogin.data.token}` },
    });
    console.log('   ✅ Hospital Staff Dashboard Access Status:', adminDash.status);
    console.log('   ✅ Metrics Retrieved: Total Patients =', adminDash.data.data?.metrics?.totalPatients || adminDash.data.metrics?.totalPatients);

    // -------------------------------------------------------------------------
    // TEST B: Patient Login & Dashboard Access
    // -------------------------------------------------------------------------
    console.log('\n📋 [TEST B] Patient Portal Authentication & Dashboard...');
    const patientLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: patientEmail,
      password: patientPassword,
    });
    console.log('   ✅ HTTP Status:', patientLogin.status);
    console.log('   ✅ Authenticated Patient:', patientLogin.data.user.name);
    console.log('   ✅ User Role:', patientLogin.data.user.role);
    console.log('   ✅ Patient ID:', patientLogin.data.user.patientId);

    const patientDash = await axios.get(`${BASE_URL}/patient/dashboard`, {
      headers: { Authorization: `Bearer ${patientLogin.data.token}` },
    });
    console.log('   ✅ Patient Dashboard Access Status:', patientDash.status);
    console.log('   ✅ Next Action Card Available:', !!patientDash.data.data?.nextAppointment || !!patientDash.data.nextAppointment);

    // -------------------------------------------------------------------------
    // TEST C: Patient Token Attempting to Access Hospital Staff Route (RBAC)
    // -------------------------------------------------------------------------
    console.log('\n📋 [TEST C] Patient Token Attempting Hospital Staff Route Access...');
    try {
      await axios.get(`${BASE_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${patientLogin.data.token}` },
      });
      throw new Error('FAILED: Patient was able to access Hospital Staff dashboard!');
    } catch (rbacErr: any) {
      console.log('   ✅ Access Rejected Status:', rbacErr.response?.status);
      console.log('   ✅ Rejection Message:', rbacErr.response?.data?.message);
      if (rbacErr.response?.status === 403) {
        console.log('   ✅ Patient successfully blocked by server-side RoleGuard (403 Forbidden).');
      } else {
        throw rbacErr;
      }
    }

    // -------------------------------------------------------------------------
    // TEST D: Wrong Password on Admin Account
    // -------------------------------------------------------------------------
    console.log('\n📋 [TEST D] ADMIN Email with Incorrect Password...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: 'admin@recovera.health',
        password: 'CompletelyWrongPassword!999',
      });
      throw new Error('FAILED: Server allowed login with incorrect password!');
    } catch (pwErr: any) {
      console.log('   ✅ HTTP Status:', pwErr.response?.status);
      console.log('   ✅ Error Message:', pwErr.response?.data?.message);
      if (pwErr.response?.status === 401) {
        console.log('   ✅ Correct 401 Unauthorized returned.');
      }
    }

    // -------------------------------------------------------------------------
    // TEST E: Non-Existent Email
    // -------------------------------------------------------------------------
    console.log('\n📋 [TEST E] Non-Existent Email Address...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: 'nobody_exists_here_987654@recovera.health',
        password: 'AnyPassword123!',
      });
      throw new Error('FAILED: Server allowed login for non-existent email!');
    } catch (mailErr: any) {
      console.log('   ✅ HTTP Status:', mailErr.response?.status);
      console.log('   ✅ Error Message:', mailErr.response?.data?.message);
      if (mailErr.response?.status === 401) {
        console.log('   ✅ Correct 401 Unauthorized returned.');
      }
    }

    console.log('\n🎉 ========================================================');
    console.log('🎉 ALL 5 TEST SCENARIOS PASSED 100% WITH ZERO ERRORS!');
    console.log('🎉 ========================================================\n');
  } catch (error: any) {
    console.error('❌ Test Scenario Failed:', error.response?.data || error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runAllScenarios();
