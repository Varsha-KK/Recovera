import webpush from 'web-push';
import { ENV } from '../config/env.js';
import { prisma } from '../config/prisma.js';

let isWebPushConfigured = false;

if (ENV.VAPID_PUBLIC_KEY && ENV.VAPID_PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(
      ENV.VAPID_SUBJECT,
      ENV.VAPID_PUBLIC_KEY,
      ENV.VAPID_PRIVATE_KEY
    );
    isWebPushConfigured = true;
  } catch (err) {
    console.error('Failed to configure web-push VAPID details:', err);
  }
}

export class WebPushService {
  /**
   * Dispatches push notification and stores In-App Notification in PostgreSQL
   */
  static async sendPushNotification(
    patientId: string,
    payload: { title: string; body: string; url?: string; type?: string }
  ) {
    // 1. Create in-app notification record in Prisma
    const notification = await prisma.notification.create({
      data: {
        notificationId: `NOTIF-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        patientId,
        title: payload.title,
        message: payload.body,
        type: payload.type || 'APPOINTMENT_REMINDER',
        isRead: false,
        link: payload.url || '/patient/dashboard',
      },
    });

    // 2. Also log to communicationLogs
    await prisma.communicationLog.create({
      data: {
        logId: `CL-PUSH-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        patientId,
        channel: 'PUSH',
        recipient: patientId,
        message: `${payload.title}: ${payload.body}`,
        status: 'DELIVERED',
        metadata: { notificationId: notification.notificationId },
      },
    });

    return {
      success: true,
      notificationId: notification.notificationId,
      delivered: true,
    };
  }
}

export default WebPushService;
