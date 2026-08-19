import { prisma } from '../config/prisma.js';

export class EscalationService {
  /**
   * Scans for high-risk patients with missed communications or overdue checkups
   */
  static async checkAndEscalateUnreachedPatients() {
    const now = new Date();

    const overduePatients = await prisma.patientProfile.findMany({
      where: {
        status: { in: ['ACTIVE', 'OVERDUE'] },
        riskLevel: 'HIGH',
      },
      include: {
        appointments: {
          where: {
            status: { in: ['SCHEDULED', 'NO_SHOW', 'RESCHEDULED'] },
            scheduledDate: { lt: now },
          },
        },
        callLogs: {
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
    });

    for (const patient of overduePatients) {
      if (patient.appointments.length > 0) {
        // Flag patient as OVERDUE
        await prisma.patientProfile.update({
          where: { id: patient.id },
          data: { status: 'OVERDUE' },
        });

        // Create notification alert
        await prisma.notification.create({
          data: {
            notificationId: `ESC-NOTIF-${patient.patientId}-${Date.now()}`,
            patientId: patient.patientId,
            title: 'Action Required: Clinical Follow-Up Overdue',
            message: `Your scheduled follow-up with ${patient.primaryDoctor} is overdue. Please reschedule as soon as possible.`,
            type: 'RISK_ALERT',
            isRead: false,
            link: '/patient/dashboard',
          },
        });
      }
    }
  }
}

export default EscalationService;
