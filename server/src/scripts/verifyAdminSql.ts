import { prisma } from '../config/prisma.js';
import axios from 'axios';
import { ENV } from '../config/env.js';

async function verify() {
  console.log('\n🔍 ========================================================');
  console.log('🔍 SQL DATABASE VERIFICATION');
  console.log('🔍 ========================================================');

  // 1. Execute SQL Query directly on PostgreSQL
  const users: any = await prisma.$queryRaw`
    SELECT id, name, email, role, "createdAt", "updatedAt"
    FROM users
    WHERE email = 'admin@recovera.health'
  `;

  console.log('\nQuery: SELECT id, name, email, role FROM users WHERE email = \'admin@recovera.health\';');
  console.log('Result in PostgreSQL:');
  console.table(users);

  if (users.length === 0 || users[0].role !== 'ADMIN') {
    throw new Error('Verification failed: admin@recovera.health not found or role is not ADMIN');
  }
  console.log('✅ PostgreSQL Record Verified: role = ADMIN');

  console.log('\n🔍 ========================================================');
  console.log('🔍 HOSPITAL STAFF LOGIN & RBAC VERIFICATION');
  console.log('🔍 ========================================================');

  const rawPassword = ENV.DEV_ADMIN_PASSWORD || process.env.DEV_ADMIN_PASSWORD;

  // 2. Test Hospital Staff login API
  console.log('\n1. Testing Login API with admin@recovera.health and DEV_ADMIN_PASSWORD...');
  const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
    email: 'admin@recovera.health',
    password: rawPassword,
  });

  console.log('   ✅ HTTP Status:', loginRes.status);
  console.log('   ✅ User Name:', loginRes.data.user.name);
  console.log('   ✅ User Email:', loginRes.data.user.email);
  console.log('   ✅ User Role:', loginRes.data.user.role);
  console.log('   ✅ JWT Issued:', !!loginRes.data.token);

  const adminToken = loginRes.data.token;

  // 3. Test access to Admin Protected Endpoint with Admin token
  console.log('\n2. Testing Hospital Management Dashboard API access with Admin Token...');
  const adminDashRes = await axios.get('http://localhost:5000/api/admin/dashboard', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const metrics = adminDashRes.data.data?.metrics || adminDashRes.data.metrics;
  console.log('   ✅ Hospital Management Dashboard API returned status:', adminDashRes.status);
  console.log('   ✅ Total Patients in Dashboard:', metrics.totalPatients);

  // 4. Test RBAC: Register a Patient and verify Patient CANNOT access Hospital Admin Dashboard
  console.log('\n3. Testing Role Guard Security: Patient Token attempting to access /api/admin/dashboard...');
  const patientEmail = `rbac.patient.${Date.now()}@example.com`;
  const patientPass = 'PatientPass123!';
  const patientReg = await axios.post('http://localhost:5000/api/auth/register', {
    name: 'RBAC Test Patient',
    email: patientEmail,
    password: patientPass,
    role: 'PATIENT',
  });
  const patientToken = patientReg.data.token;

  try {
    await axios.get('http://localhost:5000/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    console.error('❌ SECURITY FAILURE: Patient token was able to access Admin dashboard!');
    process.exit(1);
  } catch (rbacErr: any) {
    console.log('   ✅ HTTP Status returned:', rbacErr.response?.status);
    console.log('   ✅ RBAC Rejection Message:', rbacErr.response?.data?.message);
    if (rbacErr.response?.status === 403) {
      console.log('   ✅ Patient successfully BLOCKED from Hospital Staff dashboard by RoleGuard (403 Forbidden).');
    }
  }

  console.log('\n🎉 ALL VERIFICATIONS COMPLETED SUCCESSFULLY!');
  await prisma.$disconnect();
}

verify().catch((err) => {
  console.error('Verification error:', err);
  process.exit(1);
});
