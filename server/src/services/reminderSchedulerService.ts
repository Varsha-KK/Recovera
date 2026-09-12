import { prisma } from '../config/prisma.js';
import { ExotelSmsService } from './exotelSmsService.js';
import { ExotelVoiceService } from './exotelVoiceService.js';
import { WebPushService } from './webPushService.js';

export class ReminderSchedulerService {
  /**
   * Generates dynamic multi-channel reminder jobs attached to an appointment
   */
  static async generateReminderJobsForAppointment(appointment: {
    appointmentId: string;
    patientId: string;
    scheduledDate: Date;
    scheduledTime: string;
    type: string;
    doctorName: string;
    hospital: string;
  }) {
    const patient = await prisma.patientProfile.findUnique({
      where: { patientId: appointment.patientId },
    });

    if (!patient) return [];

    const reminderSpecs = [
      {
        channel: 'SMS',
        daysOffset: -3,
        title: 'SMS Follow-Up Reminder',
        template: `Hello ${patient.name}, this is Recovera from ${appointment.hospital}. You have an upcoming ${appointment.type} with Dr. ${appointment.doctorName} on ${new Date(appointment.scheduledDate).toISOString().split('T')[0]} at ${appointment.scheduledTime}. Please log in to confirm or reschedule.`,
      },
      {
        channel: 'PUSH',
        daysOffset: -2,
        title: 'Upcoming Appointment Check-In',
        template: `Your follow-up with Dr. ${appointment.doctorName} is coming up in 2 days (${appointment.scheduledTime}).`,
      },
      {
        channel: 'VOICE',
        daysOffset: -1,
        title: 'Voice Follow-Up Call',
        template: `Hello ${patient.name}. This is an automated follow-up reminder from Recovera and ${appointment.hospital} regarding your clinical consultation with Dr. ${appointment.doctorName} tomorrow at ${appointment.scheduledTime}. Please visit your Recovera portal to confirm your checkup. Thank you.`,
      },
    ];

    const jobs = [];

    for (const spec of reminderSpecs) {
      const scheduledFor = new Date(appointment.scheduledDate);
      scheduledFor.setDate(scheduledFor.getDate() + spec.daysOffset);

      // Set standard reminder time (10:00 AM)
      scheduledFor.setHours(10, 0, 0, 0);

      const job = await prisma.reminderJob.create({
        data: {
          jobId: `RJ-${appointment.appointmentId}-${spec.channel}-${Date.now()}`,
          appointmentId: appointment.appointmentId,
          patientId: patient.patientId,
          channel: spec.channel,
          scheduledFor,
          status: 'PENDING',
          payload: {
            title: spec.title,
            message: spec.template,
          },
        },
      });

      jobs.push(job);
    }

    return jobs;
  }

  /**
   * Invalidates old reminder jobs when an appointment is rescheduled or cancelled
   */
  static async invalidateReminderJobs(appointmentId: string) {
    const result = await prisma.reminderJob.updateMany({
      where: {
        appointmentId,
        status: 'PENDING',
      },
      data: {
        status: 'CANCELLED',
      },
    });

    return result.count;
  }

  /**
   * Dispatches due reminder jobs across Exotel SMS, Voice, and Web Push
   */
  static async processDueReminders() {
    const now = new Date();

    const dueJobs = await prisma.reminderJob.findMany({
      where: {
        status: 'PENDING',
        scheduledFor: { lte: now },
      },
      include: {
        patient: true,
        appointment: true,
      },
      take: 20,
    });

    for (const job of dueJobs) {
      const payload = job.payload as any;
      const message = payload?.message || 'Upcoming medical follow-up reminder.';

      try {
        if (job.channel === 'SMS') {
          await ExotelSmsService.sendSMS({
            patientId: job.patientId,
            appointmentId: job.appointmentId,
            message,
            recipient: job.patient.phone,
          });
        } else if (job.channel === 'VOICE') {
          await ExotelVoiceService.initiateOutboundCall({
            patientId: job.patientId,
            appointmentId: job.appointmentId,
            phone: job.patient.phone,
            patientName: job.patient.name,
            textMessage: message,
            purpose: 'Automated Post-Discharge Reminder Call',
          });
        } else if (job.channel === 'PUSH') {
          await WebPushService.sendPushNotification(job.patientId, {
            title: payload?.title || 'Recovera Reminder',
            body: message,
            url: '/patient/dashboard',
          });
        }

        await prisma.reminderJob.update({
          where: { id: job.id },
          data: {
            status: 'SENT',
            sentAt: new Date(),
          },
        });
      } catch (err: any) {
        console.error(`[ReminderScheduler] Failed to dispatch job ${job.jobId}:`, err?.message);
        await prisma.reminderJob.update({
          where: { id: job.id },
          data: {
            status: 'FAILED',
            error: err?.message || 'Dispatch error',
          },
        });
      }
    }
  }
}

export default ReminderSchedulerService;
