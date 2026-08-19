import fs from 'fs';
import readline from 'readline';
import path from 'path';

async function analyzeCsv() {
  const filePath = path.resolve('data/patient-dataset.csv');
  console.log('🔍 Analyzing dataset at:', filePath);

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let lineCount = 0;
  let headers: string[] = [];
  const uniquePatients = new Set<string>();
  const uniqueEncounters = new Set<string>();
  const specialties = new Map<string, number>();
  const primaryDiagnoses = new Map<string, number>();
  const ageGroups = new Map<string, number>();
  const readmissionStats = new Map<string, number>();
  const medicationCodes = new Set<string>();
  const genders = new Map<string, number>();

  for await (const line of rl) {
    if (!line.trim()) continue;
    lineCount++;
    if (lineCount === 1) {
      headers = line.split(',');
      continue;
    }

    const cols = line.split(',');
    // encounter_id,patient_nbr,race,gender,age,weight,admission_type_id,discharge_disposition_id,admission_source_id,time_in_hospital,payer_code,medical_specialty,primary_diagnosis_code,other_diagnosis_codes,number_outpatient,number_inpatient,number_emergency,num_lab_procedures,number_diagnoses,num_medications,num_procedures,ndc_code,max_glu_serum,A1Cresult,change,readmitted
    const encounterId = cols[0];
    const patientNbr = cols[1];
    const race = cols[2];
    const gender = cols[3];
    const age = cols[4];
    const specialty = cols[11];
    const primaryDiag = cols[12];
    const ndcCode = cols[21];
    const readmitted = cols[25];

    uniquePatients.add(patientNbr);
    uniqueEncounters.add(encounterId);

    if (specialty && specialty !== '?') {
      specialties.set(specialty, (specialties.get(specialty) || 0) + 1);
    }
    if (primaryDiag && primaryDiag !== '?') {
      primaryDiagnoses.set(primaryDiag, (primaryDiagnoses.get(primaryDiag) || 0) + 1);
    }
    if (age) {
      ageGroups.set(age, (ageGroups.get(age) || 0) + 1);
    }
    if (readmitted) {
      readmissionStats.set(readmitted, (readmissionStats.get(readmitted) || 0) + 1);
    }
    if (ndcCode && ndcCode !== '?') {
      medicationCodes.add(ndcCode);
    }
    if (gender) {
      genders.set(gender, (genders.get(gender) || 0) + 1);
    }
  }

  console.log('\n📊 ========================================================');
  console.log('📊 DATASET ANALYSIS REPORT');
  console.log('📊 ========================================================');
  console.log(`Total CSV Rows:          ${(lineCount - 1).toLocaleString()}`);
  console.log(`Unique Encounters:       ${uniqueEncounters.size.toLocaleString()}`);
  console.log(`Unique Patients:         ${uniquePatients.size.toLocaleString()}`);
  console.log(`Unique NDC Meds:         ${medicationCodes.size.toLocaleString()}`);
  console.log('\nTop Medical Specialties:');
  const sortedSpecialties = [...specialties.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  for (const [s, count] of sortedSpecialties) {
    console.log(`  - ${s.padEnd(30)}: ${count.toLocaleString()} rows`);
  }

  console.log('\nAge Distribution:');
  for (const [a, count] of ageGroups.entries()) {
    console.log(`  - ${a.padEnd(15)}: ${count.toLocaleString()} rows`);
  }

  console.log('\nReadmission Status:');
  for (const [r, count] of readmissionStats.entries()) {
    console.log(`  - ${r.padEnd(15)}: ${count.toLocaleString()} rows`);
  }

  console.log('\nGender Distribution:');
  for (const [g, count] of genders.entries()) {
    console.log(`  - ${g.padEnd(15)}: ${count.toLocaleString()} rows`);
  }
}

analyzeCsv().catch(console.error);
