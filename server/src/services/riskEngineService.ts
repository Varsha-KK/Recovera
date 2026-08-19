import { prisma } from '../config/prisma.js';

export interface RiskFactor {
  code: string;
  name: string;
  description: string;
  impactScore: number;
  triggered: boolean;
}

export interface RiskCalculationResult {
  patientId: string;
  calculatedScore: number; // 0 - 100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  factors: RiskFactor[];
  summary: string;
  recommendedAction: string;
}

export class RiskEngineService {
  /**
   * Transparent, explainable algorithm calculating Care Follow-Up Risk Score (0-100)
   */
  static async calculatePatientRisk(patientId: string): Promise<RiskCalculationResult> {
    const patient = await prisma.patientProfile.findUnique({
      where: { patientId },
      include: {
        appointments: {
          orderBy: { scheduledDate: 'desc' },
        },
        carePlans: {
          where: { isActive: true },
          include: { followUps: true },
        },
        testRequirements: true,
        communicationLogs: {
          orderBy: { timestamp: 'desc' },
          take: 5,
        },
        callLogs: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!patient) {
      throw new Error(`Patient profile not found for ID: ${patientId}`);
    }

    let score = 0;
    const factors: RiskFactor[] = [];
    const now = new Date();

    // 1. Baseline Severity
    const isHighSeverity = patient.baselineSeverity === 'HIGH';
    const isMedSeverity = patient.baselineSeverity === 'MEDIUM';
    const severityScore = isHighSeverity ? 25 : isMedSeverity ? 15 : 5;
    score += severityScore;
    factors.push({
      code: 'BASELINE_SEVERITY',
      name: 'Baseline Care Plan Severity',
      description: `Condition severity for ${patient.diagnosis} is classified as ${patient.baselineSeverity}.`,
      impactScore: severityScore,
      triggered: isHighSeverity || isMedSeverity,
    });

    // 2. Historical No-Shows / Missed Appointments
    const noShowCount = patient.appointments.filter((a) => a.status === 'NO_SHOW').length;
    const hasNoShow = noShowCount > 0;
    const noShowScore = hasNoShow ? Math.min(noShowCount * 30, 40) : 0;
    score += noShowScore;
    factors.push({
      code: 'MISSED_APPOINTMENTS',
      name: 'Previous Missed Appointment / No-Show',
      description: hasNoShow
        ? `Patient has ${noShowCount} unexcused missed follow-up(s).`
        : 'Patient has no previous missed appointments.',
      impactScore: 30,
      triggered: hasNoShow,
    });

    // 3. Overdue Follow-Up Consultation
    const overdueAppt = patient.appointments.find((a) => {
      const isPast = new Date(a.scheduledDate) < now;
      return isPast && a.status !== 'COMPLETED' && a.status !== 'CANCELLED';
    });
    const isOverdue = Boolean(overdueAppt || patient.status === 'OVERDUE');
    const overdueScore = isOverdue ? 35 : 0;
    score += overdueScore;
    factors.push({
      code: 'OVERDUE_FOLLOW_UP',
      name: 'Overdue Follow-Up Consultation',
      description: isOverdue
        ? 'Scheduled follow-up window has elapsed without a confirmed clinical encounter.'
        : 'Follow-up consultations are on schedule.',
      impactScore: 35,
      triggered: isOverdue,
    });

    // 4. Pending Diagnostic Panels
    const pendingTests = patient.testRequirements.filter(
      (t) => t.status === 'PENDING' || t.status === 'OVERDUE'
    );
    const hasPendingTests = pendingTests.length > 0;
    const testScore = hasPendingTests ? 15 : 0;
    score += testScore;
    factors.push({
      code: 'PENDING_LAB_TESTS',
      name: 'Required Pre-Consultation Diagnostic Test Pending',
      description: hasPendingTests
        ? `${pendingTests.length} required lab panel(s) pending completion: ${pendingTests.map((t) => t.testName).join(', ')}.`
        : 'All required diagnostic panels are complete.',
      impactScore: 15,
      triggered: hasPendingTests,
    });

    // 5. Unanswered Communications
    const unansweredCalls = patient.callLogs.filter(
      (c) => c.status === 'NO_ANSWER' || c.status === 'FAILED'
    ).length;
    const hasUnanswered = unansweredCalls >= 2;
    const unreachScore = hasUnanswered ? 15 : 0;
    score += unreachScore;
    factors.push({
      code: 'UNANSWERED_COMMUNICATIONS',
      name: 'Unanswered Multi-Channel Outreach',
      description: hasUnanswered
        ? `Patient could not be reached on ${unansweredCalls} automated reminder attempts.`
        : 'Outreach communications have been successfully delivered.',
      impactScore: 15,
      triggered: hasUnanswered,
    });

    // 6. Confirmed Attendance Mitigation
    const confirmedAppt = patient.appointments.find((a) => a.status === 'CONFIRMED');
    if (confirmedAppt) {
      score = Math.max(score - 30, 10);
      factors.push({
        code: 'CONFIRMED_ATTENDANCE',
        name: 'Confirmed Attendance Mitigation',
        description: 'Patient explicitly confirmed attendance in Recovera portal.',
        impactScore: -30,
        triggered: true,
      });
    }

    // Clamp score 0 - 100
    const finalScore = Math.min(Math.max(score, 5), 100);

    // Determine Risk Tier
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (finalScore >= 61) {
      riskLevel = 'HIGH';
    } else if (finalScore >= 31) {
      riskLevel = 'MEDIUM';
    }

    // Summary and Actionable Recommendations
    let summary = 'Patient is progressing on a standard adherence recovery trajectory.';
    let recommendedAction = 'Maintain automated multi-channel reminder timeline.';

    if (riskLevel === 'HIGH') {
      summary = 'Elevated probability of post-discharge care drop-off. Priority intervention required.';
      recommendedAction = isOverdue
        ? 'Direct care coordinator outreach to reschedule checkup within active window.'
        : 'Initiate priority voice outreach and verify pre-consultation lab completion.';
    } else if (riskLevel === 'MEDIUM') {
      summary = 'Moderate risk profile requiring standard multi-channel engagement.';
      recommendedAction = 'Ensure 24h voice reminder and confirm transportation if needed.';
    }

    // Persist assessment
    await prisma.riskAssessment.create({
      data: {
        assessmentId: `RA-${patientId}-${Date.now()}`,
        patientId,
        calculatedScore: finalScore,
        riskLevel,
        factors: factors as any,
        summary,
        recommendedAction,
        timestamp: now,
      },
    });

    // Update patient profile score
    await prisma.patientProfile.update({
      where: { patientId },
      data: {
        riskScore: finalScore,
        riskLevel,
        status: isOverdue ? 'OVERDUE' : patient.status === 'DISCHARGED_COMPLETED' ? 'DISCHARGED_COMPLETED' : 'ACTIVE',
      },
    });

    return {
      patientId,
      calculatedScore: finalScore,
      riskLevel,
      factors,
      summary,
      recommendedAction,
    };
  }
}

export default RiskEngineService;
