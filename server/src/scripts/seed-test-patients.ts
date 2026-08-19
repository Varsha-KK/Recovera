import { prisma } from '../config/prisma.js';

export async function seedTestPatients() {
  console.log('👥 [Recovera Patient Mapping] Ensuring 3 verified test patients exist in PostgreSQL...');

  const testPatients = [
    {
      patientId: 'PT-TEST-AMRUTA',
      name: 'Amruta',
      email: 'amruta.test@recovera.health',
      phone: '+919844328475',
      age: 34,
      gender: 'FEMALE',
      diagnosis: 'Type 2 Diabetes Mellitus with Glycemic Monitoring',
      primaryDoctor: 'Dr. Sarah Jenkins',
      department: 'Endocrinology',
      dischargeDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      riskLevel: 'MEDIUM',
      riskScore: 45,
      status: 'ACTIVE',
      vitals: { bp: '124/80 mmHg', heartRate: '74 bpm', bloodSugar: '142 mg/dL' },
      medications: [
        { name: 'Metformin HCl', dosage: '500 mg', frequency: 'Twice daily with meals' },
      ],
    },
    {
      patientId: 'PT-TEST-VARSHA',
      name: 'Varsha',
      email: 'varsha.test@recovera.health',
      phone: '+917483901129',
      age: 28,
      gender: 'FEMALE',
      diagnosis: 'Post-Operative Recovery & Wound Management',
      primaryDoctor: 'Dr. Michael Chang',
      department: 'Surgery-General',
      dischargeDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      riskLevel: 'LOW',
      riskScore: 20,
      status: 'ACTIVE',
      vitals: { bp: '118/76 mmHg', heartRate: '70 bpm' },
      medications: [
        { name: 'Amoxicillin-Clavulanate', dosage: '625 mg', frequency: 'Twice daily after food' },
      ],
    },
    {
      patientId: 'PT-TEST-SHRINIDHI',
      name: 'Shrinidhi',
      email: 'shrinidhi.test@recovera.health',
      phone: '+919480364795',
      age: 42,
      gender: 'FEMALE',
      diagnosis: 'Stage 2 Essential Hypertension & Cardiovascular Follow-Up',
      primaryDoctor: 'Dr. Sarah Jenkins',
      department: 'Cardiology',
      dischargeDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      riskLevel: 'HIGH',
      riskScore: 72,
      status: 'ACTIVE',
      vitals: { bp: '148/92 mmHg', heartRate: '82 bpm' },
      medications: [
        { name: 'Telmisartan', dosage: '40 mg', frequency: 'Once daily in the morning' },
        { name: 'Amlodipine', dosage: '5 mg', frequency: 'Once daily at bedtime' },
      ],
    },
  ];

  for (const p of testPatients) {
    const existing = await prisma.patientProfile.findUnique({
      where: { patientId: p.patientId },
    });

    if (existing) {
      await prisma.patientProfile.update({
        where: { patientId: p.patientId },
        data: p,
      });
    } else {
      await prisma.patientProfile.create({
        data: p,
      });
    }
  }

  // Also update Maria Gonzalez (PT-1001) phone to +919844328475 so default dashboard outreach uses verified recipient
  await prisma.patientProfile.updateMany({
    where: { patientId: 'PT-1001' },
    data: { phone: '+919844328475' },
  });

  console.log('✅ [Recovera Patient Mapping] Test patients verified in database:');
  console.log('   1. Amruta    -> +919844328475 (PT-TEST-AMRUTA & PT-1001)');
  console.log('   2. Varsha    -> +917483901129 (PT-TEST-VARSHA)');
  console.log('   3. Shrinidhi -> +919480364795 (PT-TEST-SHRINIDHI)');
}

if (process.argv[1]?.endsWith('seed-test-patients.ts')) {
  seedTestPatients()
    .then(() => prisma.$disconnect())
    .catch((err) => {
      console.error(err);
      prisma.$disconnect();
      process.exit(1);
    });
}
