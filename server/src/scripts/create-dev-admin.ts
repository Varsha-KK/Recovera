import readline from 'readline';
import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma.js';
import { ENV } from '../config/env.js';

function askQuestion(query: string, hideInput = false): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log('\n🏥 ========================================================');
  console.log('🏥 RECOVERA — SECURE DEVELOPMENT ADMIN PROVISIONING');
  console.log('🏥 ========================================================\n');

  // Check if arguments were passed via CLI: e.g. tsx create-dev-admin.ts "Name" "email" "password"
  const args = process.argv.slice(2);

  let name = args[0];
  let email = args[1];
  let password = args[2];

  // If running interactively and parameters not fully passed via CLI args
  if (!name || !email || !password) {
    if (process.stdin.isTTY) {
      console.log('Enter details for the Hospital Staff Admin account:\n');
      if (!name) {
        const inputName = await askQuestion('👤 Full Name [Recovera Hospital Admin]: ');
        name = inputName || 'Recovera Hospital Admin';
      }

      if (!email) {
        const inputEmail = await askQuestion('📧 Email [admin@recovera.health]: ');
        email = inputEmail || 'admin@recovera.health';
      }

      if (!password) {
        password = await askQuestion('🔑 Password: ');
      }
    } else {
      // Non-interactive fallback (e.g. CI or npm script without TTY)
      name = name || 'Recovera Hospital Admin';
      email = email || 'admin@recovera.health';
      password = password || ENV.DEV_ADMIN_PASSWORD || process.env.DEV_ADMIN_PASSWORD || 'RecoveraAdmin2026!';
    }
  }

  if (!password || password.length < 6) {
    console.error('\n❌ Error: Password must be at least 6 characters long.');
    process.exit(1);
  }

  console.log(`\n🔒 Hashing password with bcrypt (10 rounds)...`);
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    console.log(`💾 Upserting user record in PostgreSQL database ("recovera")...`);

    const user = await prisma.user.upsert({
      where: { email: email.toLowerCase() },
      update: {
        name: name,
        password: hashedPassword,
        role: 'ADMIN',
      },
      create: {
        name: name,
        email: email.toLowerCase(),
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

    console.log('\n✅ ========================================================');
    console.log('✅ HOSPITAL STAFF ADMIN ACCOUNT PROVISIONED SUCCESSFULLY!');
    console.log('✅ ========================================================');
    console.log('   - User ID:      ', user.id);
    console.log('   - Name:         ', user.name);
    console.log('   - Email:        ', user.email);
    console.log('   - Role:         ', user.role);
    console.log('   - Updated At:   ', user.updatedAt.toISOString());
    console.log('   - Security:      Password securely hashed with bcrypt (no plaintext stored or logged).\n');
    console.log('👉 You can now sign in at http://localhost:5173/login (or http://localhost:5174/login)');
    console.log('   Tab: Hospital Staff');
    console.log(`   Email: ${user.email}`);
    console.log('   Password: <your chosen password>\n');
  } catch (error: any) {
    console.error('❌ Failed to create/update Hospital Staff Admin account:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
