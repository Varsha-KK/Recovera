import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { prisma } from '../config/prisma.js';
import { RiskEngineService } from '../services/riskEngineService.js';

export const getPatientDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    let patientId = req.user?.patientId;

    // Fallback: If no patientId in token, find by userId or default to first patient
    if (!patientId && req.user?.id) {
      const profile = await prisma.patientProfile.findUnique({
        where: { userId: req.user.id },
      });
      patientId = profile?.patientId || null;
    }

    if (!patientId) {
      const firstPatient = await prisma.patientProfile.findFirst({
        orderBy: { createdAt: 'asc' },
      });
      patientId = firstPatient?.patientId || 'PT-1001';
    }

    const patient = await prisma.patientProfile.findUnique({
      where: { patientId },
      include: {
        appointments: {
          orderBy: { scheduledDate: 'desc' },
          include: { reminderJobs: true },
        },
        carePlans: {
          where: { isActive: true },
          include: { followUps: true },
        },
        testRequirements: true,
        notifications: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        medicationReminders: true,
      },
    });

    if (!patient) {
      res.status(404).json({ message: 'Patient profile not found.' });
      return;
    }

    // Find next actionable appointment
    const nextActionAppt = patient.appointments.find(
      (a) =>
        a.status === 'SCHEDULED' ||
        a.status === 'CONFIRMED' ||
        a.status === 'RESCHEDULED' ||
        a.status === 'NO_SHOW'
    );

    let nextAction = null;
    if (nextActionAppt) {
      const reminderTimeline = nextActionAppt.reminderJobs.map((rj) => ({
        channel: rj.channel,
        scheduledFor: rj.scheduledFor,
        formattedDate: new Date(rj.scheduledFor).toISOString().split('T')[0],
        status: rj.status,
        title: (rj.payload as any)?.title || 'Reminder',
      }));

      nextAction = {
        appointmentId: nextActionAppt.appointmentId,
        type: nextActionAppt.type,
        doctorName: nextActionAppt.doctorName,
        department: nextActionAppt.department,
        hospital: nextActionAppt.hospital,
        scheduledDate: new Date(nextActionAppt.scheduledDate).toISOString().split('T')[0],
        scheduledTime: nextActionAppt.scheduledTime,
        followUpWindow: {
          start: nextActionAppt.windowStart
            ? new Date(nextActionAppt.windowStart).toISOString().split('T')[0]
            : new Date(nextActionAppt.scheduledDate).toISOString().split('T')[0],
          end: nextActionAppt.windowEnd
            ? new Date(nextActionAppt.windowEnd).toISOString().split('T')[0]
            : new Date(nextActionAppt.scheduledDate).toISOString().split('T')[0],
        },
        status: nextActionAppt.status,
        isOverdue: nextActionAppt.isOverdue,
        reminderTimeline,
      };
    }

    const carePlan = patient.carePlans[0] || null;
    const pendingTests = patient.testRequirements.filter((t) => t.status === 'PENDING' || t.status === 'OVERDUE');

    res.status(200).json({
      data: {
        patient: {
          patientId: patient.patientId,
          name: patient.name,
          age: patient.age,
          gender: patient.gender,
          phone: patient.phone,
          email: patient.email,
          diagnosis: patient.diagnosis,
          primaryDoctor: patient.primaryDoctor,
          department: patient.department,
          dischargeDate: new Date(patient.dischargeDate).toISOString().split('T')[0],
          formattedDischargeDate: new Date(patient.dischargeDate).toISOString().split('T')[0],
          riskScore: patient.riskScore,
          riskLevel: patient.riskLevel,
          status: patient.status,
          vitals: patient.vitals,
          medications: patient.medications,
          reminderPreferences: patient.reminderPreferences,
        },
        nextAction,
        carePlan,
        pendingTests,
        notifications: patient.notifications,
      },
    });
  } catch (error: any) {
    console.error('Patient dashboard error:', error);
    res.status(500).json({ message: 'Failed to retrieve patient dashboard.' });
  }
};

export const getPatientTimeline = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    let patientId = req.user?.patientId;

    if (!patientId && req.user?.id) {
      const profile = await prisma.patientProfile.findUnique({
        where: { userId: req.user.id },
      });
      patientId = profile?.patientId || null;
    }

    if (!patientId) {
      const first = await prisma.patientProfile.findFirst();
      patientId = first?.patientId || 'PT-1001';
    }

    const patient = await prisma.patientProfile.findUnique({
      where: { patientId },
      include: {
        carePlans: {
          include: { followUps: true },
        },
        appointments: true,
      },
    });

    if (!patient) {
      res.status(404).json({ message: 'Patient not found' });
      return;
    }

    const timelineItems = [];

    // 1. Discharge Event
    timelineItems.push({
      id: `timeline-discharge-${patient.patientId}`,
      title: 'Hospital Discharge & Care Plan Activated',
      description: `Discharged from ${patient.department} under primary supervision of ${patient.primaryDoctor}. Follow-up milestones configured.`,
      date: new Date(patient.dischargeDate).toISOString().split('T')[0],
      status: 'COMPLETED',
      category: 'DISCHARGE',
    });

    // 2. Care Plan Milestones
    const activePlan = patient.carePlans[0];
    if (activePlan) {
      for (const milestone of activePlan.followUps) {
        timelineItems.push({
          id: milestone.milestoneId,
          title: milestone.title,
          description: milestone.description || '',
          date: new Date(milestone.dueDate).toISOString().split('T')[0],
          status: milestone.status,
          category: milestone.type,
        });
      }
    }

    // 3. Appointments
    for (const appt of patient.appointments) {
      timelineItems.push({
        id: `timeline-appt-${appt.appointmentId}`,
        title: appt.type,
        description: `Consultation with ${appt.doctorName} (${appt.department}) at ${appt.scheduledTime}.`,
        date: new Date(appt.scheduledDate).toISOString().split('T')[0],
        status: appt.status === 'SCHEDULED' || appt.status === 'CONFIRMED' ? 'UPCOMING' : appt.status,
        category: 'APPOINTMENT',
        appointmentId: appt.appointmentId,
        appointmentStatus: appt.status,
      });
    }

    // Sort by date ascending
    timelineItems.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    res.status(200).json({ data: timelineItems });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to retrieve care timeline.' });
  }
};

export const confirmAttendance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      res.status(400).json({ message: 'appointmentId is required.' });
      return;
    }

    const appt = await prisma.appointment.findUnique({
      where: { appointmentId },
    });

    if (!appt) {
      res.status(404).json({ message: 'Appointment not found.' });
      return;
    }

    // Update appointment status to CONFIRMED
    const updatedAppt = await prisma.appointment.update({
      where: { appointmentId },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      },
    });

    // Record audit event in AppointmentHistory
    await prisma.appointmentHistory.create({
      data: {
        appointmentId,
        action: 'CONFIRMED',
        reason: 'Patient confirmed attendance via Recovera portal',
        performedBy: req.user?.name || 'Patient',
        performedByRole: req.user?.role || 'PATIENT',
      },
    });

    // Recalculate Risk Score
    const riskResult = await RiskEngineService.calculatePatientRisk(appt.patientId);

    res.status(200).json({
      message: 'Follow-up appointment confirmed successfully. We look forward to seeing you!',
      data: {
        appointment: updatedAppt,
        updatedRiskScore: riskResult.calculatedScore,
        updatedRiskLevel: riskResult.riskLevel,
      },
    });
  } catch (error: any) {
    console.error('Confirm attendance error:', error);
    res.status(500).json({ message: 'Failed to confirm appointment attendance.' });
  }
};

export const updatePreferences = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const patientId = req.user?.patientId || 'PT-1001';
    const { sms, voice, push, preferredTime } = req.body;

    const updated = await prisma.patientProfile.update({
      where: { patientId },
      data: {
        reminderPreferences: {
          sms: sms !== undefined ? Boolean(sms) : true,
          voice: voice !== undefined ? Boolean(voice) : true,
          push: push !== undefined ? Boolean(push) : true,
          preferredTime: preferredTime || '10:00 AM',
        },
      },
    });

    res.status(200).json({
      message: 'Reminder preferences updated successfully.',
      data: updated.reminderPreferences,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update preferences.' });
  }
};

export const markNotificationAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);

    await prisma.notification.update({
      where: { notificationId: id },
      data: { isRead: true },
    });

    res.status(200).json({ message: 'Notification marked as read.' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update notification.' });
  }
};
