import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma.js';
import { ENV } from '../config/env.js';

async function createOrUpdateAdmin() {
  console.log('🔒 [Recovera Admin Provisioning] Initializing development hospital staff account...');

  const adminEmail = 'admin@recovera.health';
  const adminName = 'Recovera Hospital Admin';
  const rawPassword = ENV.DEV_ADMIN_PASSWORD || process.env.DEV_ADMIN_PASSWORD;

  if (!rawPassword) {
    console.error('❌ Error: DEV_ADMIN_PASSWORD environment variable is not defined.');
    process.exit(1);
  }

  // 1. Hash the password with bcrypt (10 rounds)
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  try {
    // 2. Upsert into PostgreSQL via Prisma without altering other patient or hospital records
    const user = await prisma.user.upsert({
      where: { email: adminEmail.toLowerCase() },
      update: {
        name: adminName,
        password: hashedPassword,
        role: 'ADMIN',
      },
      create: {
        name: adminName,
        email: adminEmail.toLowerCase(),
        password: hashedPassword,
        role: 'ADMIN',
        phone: '+1 (555) 019-2834',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log('✅ [Recovera Admin Provisioning] Hospital Staff Admin account created/updated successfully:');
    console.log('   - ID:        ', user.id);
    console.log('   - Name:      ', user.name);
    console.log('   - Email:     ', user.email);
    console.log('   - Role:      ', user.role);
    console.log('   - Timestamp: ', user.updatedAt.toISOString());
    console.log('   - Security:   Password securely hashed with bcrypt (plaintext NOT stored or logged).');
  } catch (error: any) {
    console.error('❌ [Recovera Admin Provisioning] Failed to provision admin account:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createOrUpdateAdmin();
