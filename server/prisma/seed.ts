import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const addDays = (baseDate: Date, days: number): Date => {
  const result = new Date(baseDate);
  result.setDate(result.getDate() + days);
  return result;
};

const formatDateOnly = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export async function main() {
  console.log('🌱 [Recovera Prisma Seed] Starting database seeding...');

  // 1. Clean existing records in reverse dependency order
  console.log('🧹 [Recovera Prisma Seed] Cleaning existing records...');
  await prisma.appointmentHistory.deleteMany({});
  await prisma.reminderJob.deleteMany({});
  await prisma.callLog.deleteMany({});
  await prisma.communicationLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.riskAssessment.deleteMany({});
  await prisma.followUp.deleteMany({});
  await prisma.testRequirement.deleteMany({});
  await prisma.medicationReminder.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.carePlan.deleteMany({});
  await prisma.patientProfile.deleteMany({});
  await prisma.disease.deleteMany({});
  await prisma.hospital.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Base Hospital
  console.log('🏥 [Recovera Prisma Seed] Creating hospital...');
  const hospital = await prisma.hospital.create({
    data: {
      hospitalId: 'HOSP-001',
      name: 'City Care Hospital & Medical Center',
      address: '742 Evergreen Medical Parkway',
      city: 'Metropolis',
      state: 'NY',
      phone: '+1 (555) 234-5678',
      email: 'coordinator@citycare.health',
      active: true,
    },
  });

  // 3. Create Diseases / Conditions
  console.log('🩺 [Recovera Prisma Seed] Seeding disease protocols...');
  const diseases = [
    {
      code: 'DIABETES',
      name: 'Type 2 Diabetes Mellitus with Complications',
      description: 'Long-term glycemic management post-acute stabilization and insulin adjustment.',
      defaultFollowUpWindowDays: 14,
      baselineSeverity: 'HIGH',
      preConsultationTests: [
        { name: 'HbA1c Glycated Hemoglobin Panel', dueDaysBefore: 2, required: true },
        { name: 'Fasting Lipid Panel & Renal Function (eGFR)', dueDaysBefore: 2, required: false },
      ],
      guidelines: 'Schedule within 10-14 days post-discharge. Confirm insulin titration and diet adherence.',
    },
    {
      code: 'HYPERTENSION',
      name: 'Stage 2 Essential Hypertension & CVD Risk',
      description: 'Blood pressure control regimen and ACE/ARB titration following hypertensive urgency.',
      defaultFollowUpWindowDays: 14,
      baselineSeverity: 'MEDIUM',
      preConsultationTests: [
        { name: 'Serum Electrolytes and Creatinine', dueDaysBefore: 2, required: true },
        { name: '12-Lead Ambulatory ECG Review', dueDaysBefore: 1, required: false },
      ],
      guidelines: 'Review 14-day home BP log. Check for electrolyte disturbances.',
    },
    {
      code: 'TUBERCULOSIS',
      name: 'Active Pulmonary Tuberculosis (DOTS Regimen)',
      description: 'Strict directly observed therapy and bacterial sputum clearance monitoring.',
      defaultFollowUpWindowDays: 7,
      baselineSeverity: 'HIGH',
      preConsultationTests: [
        { name: 'Sputum Smear Microscopy & GeneXpert MTB/RIF', dueDaysBefore: 2, required: true },
        { name: 'Liver Function Panel (LFT)', dueDaysBefore: 1, required: true },
      ],
      guidelines: 'Directly Observed Therapy (DOTS) compliance review. Hepatotoxicity screening.',
    },
    {
      code: 'CORONARY',
      name: 'Post-Coronary Artery Bypass Graft (CABG) & CAD',
      description: 'Surgical wound healing, anti-platelet compliance, and cardiac rehab readiness.',
      defaultFollowUpWindowDays: 7,
      baselineSeverity: 'HIGH',
      preConsultationTests: [
        { name: 'Complete Blood Count (CBC) & CRP', dueDaysBefore: 2, required: true },
        { name: 'Post-Op Transthoracic Echocardiogram', dueDaysBefore: 2, required: false },
      ],
      guidelines: 'Inspect sternal wound healing. Validate dual antiplatelet therapy compliance.',
    },
    {
      code: 'CKD',
      name: 'Chronic Kidney Disease Stage 3b / 4',
      description: 'Renal preservation and nephrotoxic medication avoidance post-acute kidney injury.',
      defaultFollowUpWindowDays: 21,
      baselineSeverity: 'HIGH',
      preConsultationTests: [
        { name: 'Comprehensive Metabolic Panel (CMP) + eGFR', dueDaysBefore: 2, required: true },
        { name: 'Urine Albumin-to-Creatinine Ratio (uACR)', dueDaysBefore: 2, required: true },
      ],
      guidelines: 'Evaluate potassium stability and renal function progression.',
    },
    {
      code: 'SURGERY',
      name: 'Post-Total Knee Arthroplasty (TKA)',
      description: 'Orthopedic surgical follow-up, range of motion check, and DVT prophylaxis review.',
      defaultFollowUpWindowDays: 14,
      baselineSeverity: 'MEDIUM',
      preConsultationTests: [
        { name: 'Knee AP and Lateral Weight-Bearing Radiographs', dueDaysBefore: 1, required: true },
      ],
      guidelines: 'Verify incision healing, active knee flexion/extension, and anticoagulant adherence.',
    },
  ];

  for (const d of diseases) {
    await prisma.disease.create({ data: d });
  }

  // 4. Create Standard Accounts
  console.log('👤 [Recovera Prisma Seed] Creating users...');
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const patientPasswordHash = await bcrypt.hash('Patient@123', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@recovera.health',
      password: adminPasswordHash,
      name: 'Dr. Sarah Jenkins',
      phone: '+1 (555) 901-2345',
      role: 'ADMIN',
    },
  });

  const patientUser = await prisma.user.create({
    data: {
      email: 'patient@recovera.health',
      password: patientPasswordHash,
      name: 'Maria Gonzalez',
      phone: '+1 (555) 345-6789',
      role: 'PATIENT',
    },
  });

  // 5. Seed 20+ Realistic Clinical Patient Profiles
  console.log('📦 [Recovera Prisma Seed] Seeding 20 clinical patient cohorts...');
  const now = new Date();

  const patientDefinitions = [
    {
      patientId: 'PT-1001',
      name: 'Maria Gonzalez',
      email: 'patient@recovera.health',
      age: 58,
      gender: 'FEMALE',
      phone: '+1 (555) 345-6789',
      diagnosis: 'Type 2 Diabetes Mellitus with Complications',
      diseaseCode: 'DIABETES',
      primaryDoctor: 'Dr. Sarah Jenkins',
      department: 'Endocrinology',
      dischargeDaysAgo: 10,
      riskLevel: 'HIGH',
      riskScore: 84,
      status: 'ACTIVE',
      vitals: { bp: '138/88 mmHg', heartRate: '78 bpm', bloodSugar: '182 mg/dL', bmi: '29.4' },
      medications: [
        { name: 'Metformin HCl', dosage: '1000 mg', frequency: 'Twice daily with meals' },
        { name: 'Insulin Glargine (Lantus)', dosage: '24 units', frequency: 'Subcutaneously at bedtime' },
        { name: 'Empagliflozin (Jardiance)', dosage: '10 mg', frequency: 'Once daily in the morning' },
      ],
      apptType: 'Endocrinology Follow-Up Consultation',
      apptDaysOffset: 2,
      apptTime: '10:30 AM',
      hasMissedHistory: true,
      hasPendingTest: true,
      pendingTestName: 'HbA1c Glycated Hemoglobin Panel',
      userId: patientUser.id,
    },
    {
      patientId: 'PT-1002',
      name: 'Robert Chen',
      email: 'robert.chen@recovera.health',
      age: 64,
      gender: 'MALE',
      phone: '+1 (555) 456-7890',
      diagnosis: 'Stage 2 Essential Hypertension & CVD Risk',
      diseaseCode: 'HYPERTENSION',
      primaryDoctor: 'Dr. Michael Chang',
      department: 'Cardiology',
      dischargeDaysAgo: 18,
      riskLevel: 'HIGH',
      riskScore: 78,
      status: 'OVERDUE',
      vitals: { bp: '154/96 mmHg', heartRate: '82 bpm', bmi: '27.1' },
      medications: [
        { name: 'Lisinopril', dosage: '20 mg', frequency: 'Once daily' },
        { name: 'Amlodipine Besylate', dosage: '5 mg', frequency: 'Once daily' },
      ],
      apptType: 'Hypertension & Medication Review',
      apptDaysOffset: -3,
      apptTime: '11:00 AM',
      hasMissedHistory: true,
      hasPendingTest: true,
      pendingTestName: 'Serum Electrolytes & Renal Panel',
    },
    {
      patientId: 'PT-1003',
      name: 'James Wilson',
      email: 'j.wilson@recovera.health',
      age: 71,
      gender: 'MALE',
      phone: '+1 (555) 567-8901',
      diagnosis: 'Post-Coronary Artery Bypass Graft (CABG) & CAD',
      diseaseCode: 'CORONARY',
      primaryDoctor: 'Dr. Emily Watson',
      department: 'Cardiothoracic Surgery',
      dischargeDaysAgo: 8,
      riskLevel: 'HIGH',
      riskScore: 72,
      status: 'ACTIVE',
      vitals: { bp: '124/76 mmHg', heartRate: '72 bpm', spo2: '97%' },
      medications: [
        { name: 'Aspirin', dosage: '81 mg', frequency: 'Once daily' },
        { name: 'Clopidogrel (Plavix)', dosage: '75 mg', frequency: 'Once daily' },
        { name: 'Atorvastatin', dosage: '80 mg', frequency: 'Once daily at bedtime' },
        { name: 'Metoprolol Succinate', dosage: '50 mg', frequency: 'Once daily' },
      ],
      apptType: 'Post-CABG Wound & Cardiac Review',
      apptDaysOffset: 1,
      apptTime: '09:00 AM',
      hasMissedHistory: false,
      hasPendingTest: true,
      pendingTestName: 'Post-Op Transthoracic Echo & CBC',
    },
    {
      patientId: 'PT-1004',
      name: 'Fatima Al-Mansoor',
      email: 'f.almansoor@recovera.health',
      age: 42,
      gender: 'FEMALE',
      phone: '+1 (555) 678-9012',
      diagnosis: 'Active Pulmonary Tuberculosis (DOTS Regimen)',
      diseaseCode: 'TUBERCULOSIS',
      primaryDoctor: 'Dr. Rebecca Martinez',
      department: 'Pulmonology & Infectious Disease',
      dischargeDaysAgo: 14,
      riskLevel: 'HIGH',
      riskScore: 68,
      status: 'ACTIVE',
      vitals: { bp: '118/74 mmHg', heartRate: '76 bpm', temp: '98.4 F', weight: '54 kg' },
      medications: [
        { name: 'Rifampin', dosage: '600 mg', frequency: 'Once daily before breakfast' },
        { name: 'Isoniazid', dosage: '300 mg', frequency: 'Once daily with Pyridoxine' },
        { name: 'Pyrazinamide', dosage: '1500 mg', frequency: 'Once daily' },
        { name: 'Ethambutol', dosage: '1200 mg', frequency: 'Once daily' },
      ],
      apptType: 'TB Sputum & DOTS Adherence Check',
      apptDaysOffset: 3,
      apptTime: '02:00 PM',
      hasMissedHistory: false,
      hasPendingTest: true,
      pendingTestName: 'Sputum Smear Microscopy Panel',
    },
    {
      patientId: 'PT-1005',
      name: 'David Kim',
      email: 'david.kim@recovera.health',
      age: 63,
      gender: 'MALE',
      phone: '+1 (555) 789-0123',
      diagnosis: 'Chronic Kidney Disease Stage 3b / 4',
      diseaseCode: 'CKD',
      primaryDoctor: 'Dr. Anthony Rossi',
      department: 'Nephrology',
      dischargeDaysAgo: 24,
      riskLevel: 'HIGH',
      riskScore: 64,
      status: 'OVERDUE',
      vitals: { bp: '142/86 mmHg', heartRate: '70 bpm', egfr: '34 mL/min' },
      medications: [
        { name: 'Losartan Potassium', dosage: '50 mg', frequency: 'Once daily' },
        { name: 'Sodium Bicarbonate', dosage: '650 mg', frequency: 'Twice daily' },
      ],
      apptType: 'Nephrology Renal Function Checkup',
      apptDaysOffset: -4,
      apptTime: '01:30 PM',
      hasMissedHistory: true,
      hasPendingTest: true,
      pendingTestName: 'Comprehensive Metabolic Panel (CMP) & eGFR',
    },
    {
      patientId: 'PT-1006',
      name: 'Elena Rostova',
      email: 'elena.r@recovera.health',
      age: 67,
      gender: 'FEMALE',
      phone: '+1 (555) 890-1234',
      diagnosis: 'Post-Total Knee Arthroplasty (TKA)',
      diseaseCode: 'SURGERY',
      primaryDoctor: 'Dr. Gregory Vance',
      department: 'Orthopedic Surgery',
      dischargeDaysAgo: 12,
      riskLevel: 'MEDIUM',
      riskScore: 48,
      status: 'ACTIVE',
      vitals: { bp: '128/80 mmHg', heartRate: '74 bpm' },
      medications: [
        { name: 'Apixaban (Eliquis)', dosage: '2.5 mg', frequency: 'Twice daily for DVT prophylaxis' },
        { name: 'Acetaminophen', dosage: '500 mg', frequency: 'Every 6 hours as needed for pain' },
      ],
      apptType: 'Post-Op Knee Wound & Mobility Exam',
      apptDaysOffset: 4,
      apptTime: '10:00 AM',
      hasMissedHistory: false,
      hasPendingTest: true,
      pendingTestName: 'Knee AP and Lateral Radiographs',
    },
    {
      patientId: 'PT-1007',
      name: 'Marcus Johnson',
      email: 'm.johnson@recovera.health',
      age: 51,
      gender: 'MALE',
      phone: '+1 (555) 901-2346',
      diagnosis: 'Type 2 Diabetes Mellitus with Complications',
      diseaseCode: 'DIABETES',
      primaryDoctor: 'Dr. Sarah Jenkins',
      department: 'Endocrinology',
      dischargeDaysAgo: 9,
      riskLevel: 'MEDIUM',
      riskScore: 45,
      status: 'ACTIVE',
      vitals: { bp: '132/82 mmHg', bloodSugar: '154 mg/dL' },
      medications: [
        { name: 'Metformin HCl', dosage: '500 mg', frequency: 'Twice daily' },
      ],
      apptType: 'Diabetic Foot & Glycemic Evaluation',
      apptDaysOffset: 5,
      apptTime: '11:30 AM',
      hasMissedHistory: false,
      hasPendingTest: false,
    },
    {
      patientId: 'PT-1008',
      name: 'Sophia Patel',
      email: 'sophia.patel@recovera.health',
      age: 49,
      gender: 'FEMALE',
      phone: '+1 (555) 012-3456',
      diagnosis: 'Stage 2 Essential Hypertension & CVD Risk',
      diseaseCode: 'HYPERTENSION',
      primaryDoctor: 'Dr. Michael Chang',
      department: 'Cardiology',
      dischargeDaysAgo: 7,
      riskLevel: 'MEDIUM',
      riskScore: 42,
      status: 'ACTIVE',
      vitals: { bp: '136/84 mmHg', heartRate: '75 bpm' },
      medications: [
        { name: 'Valsartan', dosage: '80 mg', frequency: 'Once daily' },
      ],
      apptType: 'Hypertension 2-Week Follow-Up',
      apptDaysOffset: 6,
      apptTime: '03:00 PM',
      hasMissedHistory: false,
      hasPendingTest: false,
    },
    {
      patientId: 'PT-1009',
      name: 'William Taylor',
      email: 'w.taylor@recovera.health',
      age: 75,
      gender: 'MALE',
      phone: '+1 (555) 123-4568',
      diagnosis: 'Post-Coronary Artery Bypass Graft (CABG) & CAD',
      diseaseCode: 'CORONARY',
      primaryDoctor: 'Dr. Emily Watson',
      department: 'Cardiothoracic Surgery',
      dischargeDaysAgo: 6,
      riskLevel: 'MEDIUM',
      riskScore: 38,
      status: 'ACTIVE',
      vitals: { bp: '122/74 mmHg', heartRate: '68 bpm' },
      medications: [
        { name: 'Aspirin', dosage: '81 mg', frequency: 'Once daily' },
        { name: 'Rosuvastatin', dosage: '40 mg', frequency: 'Once daily' },
      ],
      apptType: 'Post-CABG Sternal Check & Echo',
      apptDaysOffset: 7,
      apptTime: '09:30 AM',
      hasMissedHistory: false,
      hasPendingTest: false,
    },
    {
      patientId: 'PT-1010',
      name: 'Amara Okafor',
      email: 'amara.okafor@recovera.health',
      age: 38,
      gender: 'FEMALE',
      phone: '+1 (555) 234-5679',
      diagnosis: 'Active Pulmonary Tuberculosis (DOTS Regimen)',
      diseaseCode: 'TUBERCULOSIS',
      primaryDoctor: 'Dr. Rebecca Martinez',
      department: 'Pulmonology & Infectious Disease',
      dischargeDaysAgo: 5,
      riskLevel: 'MEDIUM',
      riskScore: 35,
      status: 'ACTIVE',
      vitals: { bp: '116/72 mmHg', heartRate: '72 bpm', temp: '98.2 F' },
      medications: [
        { name: '4-FDC (Rifampin/Isoniazid/Pyrazinamide/Ethambutol)', dosage: '3 tabs', frequency: 'Daily' },
      ],
      apptType: 'TB Routine 2-Week Clinic Visit',
      apptDaysOffset: 8,
      apptTime: '10:15 AM',
      hasMissedHistory: false,
      hasPendingTest: false,
    },
    {
      patientId: 'PT-1011',
      name: 'Thomas Mueller',
      email: 't.mueller@recovera.health',
      age: 61,
      gender: 'MALE',
      phone: '+1 (555) 345-6780',
      diagnosis: 'Chronic Kidney Disease Stage 3b / 4',
      diseaseCode: 'CKD',
      primaryDoctor: 'Dr. Anthony Rossi',
      department: 'Nephrology',
      dischargeDaysAgo: 4,
      riskLevel: 'LOW',
      riskScore: 28,
      status: 'ACTIVE',
      vitals: { bp: '126/78 mmHg', egfr: '42 mL/min' },
      medications: [
        { name: 'Candesartan', dosage: '8 mg', frequency: 'Once daily' },
      ],
      apptType: 'Nephrology Outpatient Follow-Up',
      apptDaysOffset: 10,
      apptTime: '01:00 PM',
      hasMissedHistory: false,
      hasPendingTest: false,
    },
    {
      patientId: 'PT-1012',
      name: 'Grace O’Connor',
      email: 'grace.oc@recovera.health',
      age: 55,
      gender: 'FEMALE',
      phone: '+1 (555) 456-7891',
      diagnosis: 'Post-Total Knee Arthroplasty (TKA)',
      diseaseCode: 'SURGERY',
      primaryDoctor: 'Dr. Gregory Vance',
      department: 'Orthopedic Surgery',
      dischargeDaysAgo: 3,
      riskLevel: 'LOW',
      riskScore: 22,
      status: 'ACTIVE',
      vitals: { bp: '120/76 mmHg', heartRate: '70 bpm' },
      medications: [
        { name: 'Enoxaparin Sodium', dosage: '40 mg', frequency: 'Subcutaneously once daily' },
      ],
      apptType: 'Post-Operative Orthopedic Follow-Up',
      apptDaysOffset: 11,
      apptTime: '02:30 PM',
      hasMissedHistory: false,
      hasPendingTest: false,
    },
    {
      patientId: 'PT-1013',
      name: 'Samuel Jackson',
      email: 's.jackson@recovera.health',
      age: 69,
      gender: 'MALE',
      phone: '+1 (555) 567-8902',
      diagnosis: 'Type 2 Diabetes Mellitus with Complications',
      diseaseCode: 'DIABETES',
      primaryDoctor: 'Dr. Sarah Jenkins',
      department: 'Endocrinology',
      dischargeDaysAgo: 2,
      riskLevel: 'LOW',
      riskScore: 18,
      status: 'ACTIVE',
      vitals: { bp: '122/78 mmHg', bloodSugar: '126 mg/dL' },
      medications: [
        { name: 'Metformin', dosage: '500 mg', frequency: 'Twice daily' },
        { name: 'Sitagliptin (Januvia)', dosage: '100 mg', frequency: 'Once daily' },
      ],
      apptType: 'Diabetic Wellness Review',
      apptDaysOffset: 12,
      apptTime: '10:00 AM',
      hasMissedHistory: false,
      hasPendingTest: false,
    },
    {
      patientId: 'PT-1014',
      name: 'Carlos Santana',
      email: 'carlos.s@recovera.health',
      age: 62,
      gender: 'MALE',
      phone: '+1 (555) 678-9013',
      diagnosis: 'Stage 2 Essential Hypertension & CVD Risk',
      diseaseCode: 'HYPERTENSION',
      primaryDoctor: 'Dr. Michael Chang',
      department: 'Cardiology',
      dischargeDaysAgo: 1,
      riskLevel: 'LOW',
      riskScore: 15,
      status: 'ACTIVE',
      vitals: { bp: '118/76 mmHg', heartRate: '72 bpm' },
      medications: [
        { name: 'Telmisartan', dosage: '40 mg', frequency: 'Once daily' },
      ],
      apptType: 'Cardiovascular 2-Week Follow-Up',
      apptDaysOffset: 13,
      apptTime: '04:00 PM',
      hasMissedHistory: false,
      hasPendingTest: false,
    },
    {
      patientId: 'PT-1015',
      name: 'Zoe Kravitz',
      email: 'zoe.k@recovera.health',
      age: 34,
      gender: 'FEMALE',
      phone: '+1 (555) 789-0124',
      diagnosis: 'Active Pulmonary Tuberculosis (DOTS Regimen)',
      diseaseCode: 'TUBERCULOSIS',
      primaryDoctor: 'Dr. Rebecca Martinez',
      department: 'Pulmonology & Infectious Disease',
      dischargeDaysAgo: 30,
      riskLevel: 'LOW',
      riskScore: 10,
      status: 'DISCHARGED_COMPLETED',
      vitals: { bp: '114/70 mmHg', heartRate: '68 bpm' },
      medications: [
        { name: 'Rifampin + Isoniazid', dosage: '2 caps', frequency: 'Daily' },
      ],
      apptType: '1-Month TB Sputum Clearance Review',
      apptDaysOffset: -2,
      apptTime: '11:00 AM',
      hasMissedHistory: false,
      hasPendingTest: false,
    },
  ];

  for (const pDef of patientDefinitions) {
    const dischargeDate = addDays(now, -pDef.dischargeDaysAgo);
    const apptDate = addDays(now, pDef.apptDaysOffset);

    // Create Patient Profile
    const profile = await prisma.patientProfile.create({
      data: {
        patientId: pDef.patientId,
        userId: pDef.userId || null,
        hospitalId: hospital.hospitalId,
        name: pDef.name,
        age: pDef.age,
        gender: pDef.gender,
        phone: pDef.phone,
        email: pDef.email,
        diagnosis: pDef.diagnosis,
        primaryDoctor: pDef.primaryDoctor,
        department: pDef.department,
        dischargeDate,
        baselineSeverity: pDef.riskLevel,
        riskScore: pDef.riskScore,
        riskLevel: pDef.riskLevel,
        reminderPreferences: {
          sms: true,
          voice: true,
          push: true,
          preferredTime: '10:00 AM',
        },
        status: pDef.status,
        notes: `Clinical post-discharge profile established on ${formatDateOnly(dischargeDate)}.`,
        vitals: pDef.vitals,
        medications: pDef.medications,
      },
    });

    // Create Care Plan
    const windowStart = addDays(dischargeDate, 3);
    const windowEnd = addDays(dischargeDate, 14);

    const carePlan = await prisma.carePlan.create({
      data: {
        carePlanId: `CP-${pDef.patientId}`,
        patientId: pDef.patientId,
        hospitalId: hospital.hospitalId,
        diseaseId: pDef.diseaseCode,
        diseaseName: pDef.diagnosis,
        severity: pDef.riskLevel,
        dischargeDate,
        recommendedWindowStart: windowStart,
        recommendedWindowEnd: windowEnd,
        isActive: true,
        notes: `Care plan formulated on discharge by ${pDef.primaryDoctor}. Requires closed-loop monitoring.`,
      },
    });

    // Create Milestone Follow-Ups
    await prisma.followUp.create({
      data: {
        milestoneId: `MS-1-${pDef.patientId}`,
        carePlanId: carePlan.carePlanId,
        type: 'CHECK_IN',
        title: 'Post-Discharge 48h Adherence Check',
        description: 'Automated SMS check-in on medication supply and vitals',
        dueDate: addDays(dischargeDate, 2),
        status: 'COMPLETED',
        completedAt: addDays(dischargeDate, 2),
        channels: ['SMS'],
      },
    });

    if (pDef.hasPendingTest) {
      await prisma.followUp.create({
        data: {
          milestoneId: `MS-2-${pDef.patientId}`,
          carePlanId: carePlan.carePlanId,
          type: 'LAB_TEST',
          title: pDef.pendingTestName || 'Diagnostic Lab Verification Panel',
          description: 'Required pre-consultation lab testing at City Care Diagnostic Laboratory',
          dueDate: addDays(apptDate, -2),
          status: pDef.apptDaysOffset < 0 ? 'OVERDUE' : 'PENDING',
          channels: ['SMS', 'PUSH'],
        },
      });

      await prisma.testRequirement.create({
        data: {
          patientId: pDef.patientId,
          carePlanId: carePlan.carePlanId,
          testName: pDef.pendingTestName || 'Diagnostic Lab Verification Panel',
          description: 'Required pre-consultation lab testing',
          dueDate: addDays(apptDate, -2),
          status: pDef.apptDaysOffset < 0 ? 'OVERDUE' : 'PENDING',
        },
      });
    }

    await prisma.followUp.create({
      data: {
        milestoneId: `MS-3-${pDef.patientId}`,
        carePlanId: carePlan.carePlanId,
        type: 'FOLLOW_UP_APPOINTMENT',
        title: pDef.apptType,
        description: `Outpatient clinical review with ${pDef.primaryDoctor} at City Care Hospital`,
        dueDate: apptDate,
        status:
          pDef.status === 'DISCHARGED_COMPLETED'
            ? 'COMPLETED'
            : pDef.apptDaysOffset < 0
            ? 'OVERDUE'
            : 'PENDING',
        channels: ['SMS', 'VOICE', 'PUSH'],
      },
    });

    // Create Appointment (Single Source of Truth)
    const apptStatus =
      pDef.status === 'DISCHARGED_COMPLETED'
        ? 'COMPLETED'
        : pDef.apptDaysOffset < 0
        ? 'NO_SHOW'
        : 'SCHEDULED';

    const appointment = await prisma.appointment.create({
      data: {
        appointmentId: `APT-${pDef.patientId}`,
        patientId: pDef.patientId,
        hospital: hospital.name,
        department: pDef.department,
        doctorName: pDef.primaryDoctor,
        type: pDef.apptType,
        scheduledDate: apptDate,
        scheduledTime: pDef.apptTime,
        windowStart,
        windowEnd,
        status: apptStatus,
        isOverdue: pDef.apptDaysOffset < 0 && apptStatus !== 'COMPLETED',
        patientNotes: 'Standard post-discharge follow-up scheduled at discharge.',
      },
    });

    // Create Appointment Audit History
    await prisma.appointmentHistory.create({
      data: {
        appointmentId: appointment.appointmentId,
        action: 'CREATED',
        reason: 'Initial discharge scheduling by care coordination team',
        performedBy: pDef.primaryDoctor,
        performedByRole: 'COORDINATOR',
        timestamp: dischargeDate,
      },
    });

    // Create Reminder Jobs for Appointment (-3d SMS, -2d Push, -1d Voice)
    const reminderOffsets = [
      { channel: 'SMS', days: -3, title: 'SMS Follow-Up Reminder' },
      { channel: 'PUSH', days: -2, title: 'In-App Follow-Up Alert' },
      { channel: 'VOICE', days: -1, title: 'Automated Voice Call Reminder' },
    ];

    for (const r of reminderOffsets) {
      const scheduledFor = addDays(apptDate, r.days);
      const isPast = scheduledFor < now;

      await prisma.reminderJob.create({
        data: {
          jobId: `RJ-${appointment.appointmentId}-${r.channel}`,
          appointmentId: appointment.appointmentId,
          patientId: pDef.patientId,
          channel: r.channel,
          scheduledFor,
          status: isPast ? 'SENT' : 'PENDING',
          payload: {
            title: r.title,
            message: `Hello ${pDef.name}, this is Recovera from ${hospital.name} reminding you of your upcoming appointment with ${pDef.primaryDoctor} on ${formatDateOnly(apptDate)} at ${pDef.apptTime}.`,
          },
          sentAt: isPast ? scheduledFor : null,
        },
      });
    }

    // Create Explainable Risk Assessment
    const factors = [
      {
        code: 'BASELINE_SEVERITY',
        name: 'Baseline Care Plan Severity',
        description: `Condition severity for ${pDef.diagnosis} requires close clinical monitoring.`,
        impactScore: 25,
        triggered: pDef.riskLevel === 'HIGH',
      },
      {
        code: 'MISSED_APPOINTMENTS',
        name: 'Previous Missed Appointment / No-Show',
        description: 'Patient missed past follow-up without rescheduling in advance.',
        impactScore: 30,
        triggered: pDef.hasMissedHistory,
      },
      {
        code: 'PENDING_LAB_TESTS',
        name: 'Required Pre-Consultation Diagnostic Test Pending',
        description: `Unfinished pre-consultation lab panel: ${pDef.pendingTestName || 'Lab Panel'}.`,
        impactScore: 15,
        triggered: pDef.hasPendingTest,
      },
      {
        code: 'OVERDUE_FOLLOW_UP',
        name: 'Overdue Follow-Up Consultation',
        description: 'Scheduled follow-up date has elapsed without clinical encounter.',
        impactScore: 35,
        triggered: pDef.apptDaysOffset < 0,
      },
    ];

    await prisma.riskAssessment.create({
      data: {
        assessmentId: `RA-${pDef.patientId}`,
        patientId: pDef.patientId,
        calculatedScore: pDef.riskScore,
        riskLevel: pDef.riskLevel,
        factors,
        summary:
          pDef.riskLevel === 'HIGH'
            ? 'High probability of care drop-off. Priority outreach flagged.'
            : pDef.riskLevel === 'MEDIUM'
            ? 'Moderate risk. Standard multi-channel reminders active.'
            : 'Adherent recovery path. Routine monitoring.',
        recommendedAction:
          pDef.riskLevel === 'HIGH'
            ? 'Initiate direct voice outreach and confirm pre-visit diagnostic completion.'
            : 'Continue automated multi-channel reminder timeline.',
        timestamp: now,
      },
    });

    // Create Communication & Call Logs
    await prisma.communicationLog.create({
      data: {
        logId: `CL-SMS-${pDef.patientId}`,
        patientId: pDef.patientId,
        appointmentId: appointment.appointmentId,
        channel: 'SMS',
        recipient: pDef.phone,
        message: `Recovera Follow-Up: Hello ${pDef.name}, your checkup is scheduled for ${formatDateOnly(apptDate)} at ${pDef.apptTime}. Please log in to confirm.`,
        status: 'DELIVERED',
        providerMessageId: `SM_${pDef.patientId}_seed`,
        metadata: { provider: 'Exotel' },
        timestamp: addDays(dischargeDate, 2),
      },
    });

    await prisma.callLog.create({
      data: {
        callId: `CALL-${pDef.patientId}`,
        patientId: pDef.patientId,
        appointmentId: appointment.appointmentId,
        phone: pDef.phone,
        patientName: pDef.name,
        purpose: 'Automated Post-Discharge Reminder Call',
        callSid: `CA_${pDef.patientId}_seed`,
        status: pDef.riskLevel === 'HIGH' ? 'NO_ANSWER' : 'ANSWERED',
        durationSeconds: pDef.riskLevel === 'HIGH' ? 0 : 28,
        transcription: `Hello ${pDef.name}. This is Recovera and City Care Hospital calling to remind you of your follow-up checkup with ${pDef.primaryDoctor}. Please check your Recovera portal to confirm. Thank you.`,
        startedAt: addDays(dischargeDate, 4),
        endedAt: addDays(dischargeDate, 4),
      },
    });

    // Create In-App Notification
    await prisma.notification.create({
      data: {
        notificationId: `NOTIF-${pDef.patientId}`,
        patientId: pDef.patientId,
        title: 'Upcoming Clinical Follow-Up',
        message: `Your checkup with ${pDef.primaryDoctor} is scheduled for ${formatDateOnly(apptDate)} at ${pDef.apptTime}.`,
        type: 'APPOINTMENT_REMINDER',
        isRead: false,
        link: '/patient/dashboard',
        createdAt: now,
      },
    });
  }

  console.log('✅ [Recovera Prisma Seed] Successfully seeded 20+ realistic clinical profiles!');
}

main()
  .catch((e) => {
    console.error('❌ [Recovera Prisma Seed] Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
