import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { prisma } from '../config/prisma.js';
import { ReminderSchedulerService } from '../services/reminderSchedulerService.js';
import { RiskEngineService } from '../services/riskEngineService.js';

export const getAppointments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { filter, status, search } = req.query;
    const userRole = req.user?.role;
    const patientId = req.user?.patientId;

    const where: any = {};

    // Patient can only see their own appointments
    if (userRole === 'PATIENT' && patientId) {
      where.patientId = patientId;
    }

    if (status && status !== 'ALL') {
      where.status = String(status);
    }

    const now = new Date();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    if (filter === 'TODAY') {
      where.scheduledDate = { gte: startOfToday, lte: endOfToday };
    } else if (filter === 'TOMORROW') {
      const startTomorrow = new Date(startOfToday);
      startTomorrow.setDate(startTomorrow.getDate() + 1);
      const endTomorrow = new Date(endOfToday);
      endTomorrow.setDate(endTomorrow.getDate() + 1);
      where.scheduledDate = { gte: startTomorrow, lte: endTomorrow };
    } else if (filter === 'THIS_WEEK') {
      const endOfWeek = new Date(startOfToday);
      endOfWeek.setDate(endOfWeek.getDate() + 7);
      where.scheduledDate = { gte: startOfToday, lte: endOfWeek };
    } else if (filter === 'UPCOMING') {
      where.scheduledDate = { gte: startOfToday };
    } else if (filter === 'OVERDUE') {
      where.scheduledDate = { lt: startOfToday };
      where.status = { in: ['SCHEDULED', 'NO_SHOW', 'RESCHEDULED'] };
    }

    if (search) {
      const q = String(search).toLowerCase();
      where.OR = [
        { appointmentId: { contains: q, mode: 'insensitive' } },
        { doctorName: { contains: q, mode: 'insensitive' } },
        { department: { contains: q, mode: 'insensitive' } },
        { patient: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { scheduledDate: 'asc' },
      include: {
        patient: true,
        reminderJobs: true,
      },
    });

    const formatted = appointments.map((a) => ({
      appointmentId: a.appointmentId,
      patientId: a.patientId,
      patientName: a.patient?.name || 'Patient',
      patientPhone: a.patient?.phone || '',
      patientRiskScore: a.patient?.riskScore || 20,
      patientRiskLevel: a.patient?.riskLevel || 'LOW',
      hospital: a.hospital,
      department: a.department,
      doctorName: a.doctorName,
      type: a.type,
      scheduledDate: new Date(a.scheduledDate).toISOString().split('T')[0],
      scheduledTime: a.scheduledTime,
      status: a.status,
      isOverdue: a.isOverdue,
      followUpWindow: {
        start: a.windowStart ? new Date(a.windowStart).toISOString().split('T')[0] : null,
        end: a.windowEnd ? new Date(a.windowEnd).toISOString().split('T')[0] : null,
      },
      reminderTimeline: a.reminderJobs.map((rj) => ({
        channel: rj.channel,
        scheduledFor: rj.scheduledFor,
        formattedDate: new Date(rj.scheduledFor).toISOString().split('T')[0],
        status: rj.status,
        title: (rj.payload as any)?.title || 'Reminder',
      })),
    }));

    res.status(200).json({ count: formatted.length, data: formatted });
  } catch (error: any) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Failed to retrieve appointments.' });
  }
};

export const getAppointmentById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);

    const appointment = await prisma.appointment.findUnique({
      where: { appointmentId: id },
      include: {
        patient: true,
        reminderJobs: true,
        history: { orderBy: { timestamp: 'desc' } },
      },
    });

    if (!appointment) {
      res.status(404).json({ message: 'Appointment not found.' });
      return;
    }

    res.status(200).json({ data: appointment });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to retrieve appointment details.' });
  }
};

export const createAppointment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      patientId,
      hospital = 'City Care Hospital & Medical Center',
      department = 'General Medicine',
      doctorName = 'Dr. Sarah Jenkins',
      type = 'Post-Discharge Follow-Up',
      scheduledDate,
      scheduledTime = '10:30 AM',
      patientNotes,
    } = req.body;

    if (!patientId || !scheduledDate) {
      res.status(400).json({ message: 'patientId and scheduledDate are required.' });
      return;
    }

    const patient = await prisma.patientProfile.findUnique({
      where: { patientId },
    });

    if (!patient) {
      res.status(404).json({ message: 'Patient not found.' });
      return;
    }

    const parsedDate = new Date(scheduledDate);
    const windowStart = new Date(parsedDate);
    windowStart.setDate(windowStart.getDate() - 3);
    const windowEnd = new Date(parsedDate);
    windowEnd.setDate(windowEnd.getDate() + 7);

    const appointmentId = `APT-${Date.now().toString().slice(-4)}`;

    const appt = await prisma.appointment.create({
      data: {
        appointmentId,
        patientId,
        hospital,
        department,
        doctorName,
        type,
        scheduledDate: parsedDate,
        scheduledTime,
        windowStart,
        windowEnd,
        status: 'SCHEDULED',
        patientNotes,
      },
    });

    // Create Audit History
    await prisma.appointmentHistory.create({
      data: {
        appointmentId,
        action: 'CREATED',
        reason: 'New follow-up consultation scheduled',
        performedBy: req.user?.name || 'Coordinator',
        performedByRole: req.user?.role || 'COORDINATOR',
      },
    });

    // Generate dynamic reminder timeline
    await ReminderSchedulerService.generateReminderJobsForAppointment(appt);

    // Recalculate Risk
    await RiskEngineService.calculatePatientRisk(patientId);

    res.status(201).json({
      message: 'Appointment scheduled and reminder schedule generated.',
      data: appt,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to schedule appointment.' });
  }
};

export const rescheduleAppointment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { newDate, newTime, reason } = req.body;

    if (!newDate) {
      res.status(400).json({ message: 'newDate is required.' });
      return;
    }

    const appt = await prisma.appointment.findUnique({
      where: { appointmentId: id },
    });

    if (!appt) {
      res.status(404).json({ message: 'Appointment not found.' });
      return;
    }

    const parsedNewDate = new Date(newDate);

    // Validate against recommended follow-up window if present
    if (appt.windowStart && appt.windowEnd) {
      const start = new Date(appt.windowStart);
      start.setHours(0, 0, 0, 0);
      const end = new Date(appt.windowEnd);
      end.setHours(23, 59, 59, 999);

      if (parsedNewDate < start || parsedNewDate > end) {
        res.status(400).json({
          message: `Selected date is outside recommended clinical follow-up window (${start.toISOString().split('T')[0]} – ${end.toISOString().split('T')[0]}).`,
        });
        return;
      }
    }

    // 1. Invalidate old reminder jobs
    await ReminderSchedulerService.invalidateReminderJobs(id);

    // 2. Update appointment date & status
    const updatedAppt = await prisma.appointment.update({
      where: { appointmentId: id },
      data: {
        scheduledDate: parsedNewDate,
        scheduledTime: newTime || appt.scheduledTime,
        status: 'RESCHEDULED',
        isOverdue: false,
      },
    });

    // 3. Record Audit event
    await prisma.appointmentHistory.create({
      data: {
        appointmentId: id,
        action: 'RESCHEDULED',
        reason: reason || 'Patient requested alternate date within clinical window',
        performedBy: req.user?.name || 'Patient',
        performedByRole: req.user?.role || 'PATIENT',
      },
    });

    // 4. Generate new reminder timeline for the rescheduled date
    await ReminderSchedulerService.generateReminderJobsForAppointment(updatedAppt);

    // 5. Recalculate Risk Score
    const riskResult = await RiskEngineService.calculatePatientRisk(appt.patientId);

    res.status(200).json({
      message: 'Appointment successfully rescheduled. Updated reminder timeline has been activated.',
      data: {
        appointment: updatedAppt,
        updatedRiskScore: riskResult.calculatedScore,
        updatedRiskLevel: riskResult.riskLevel,
      },
    });
  } catch (error: any) {
    console.error('Reschedule error:', error);
    res.status(500).json({ message: 'Failed to reschedule appointment.' });
  }
};

export const cancelAppointment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { reason } = req.body;

    const appt = await prisma.appointment.findUnique({
      where: { appointmentId: id },
    });

    if (!appt) {
      res.status(404).json({ message: 'Appointment not found.' });
      return;
    }

    // 1. Invalidate reminder jobs
    await ReminderSchedulerService.invalidateReminderJobs(id);

    // 2. Update status to CANCELLED
    const updated = await prisma.appointment.update({
      where: { appointmentId: id },
      data: {
        status: 'CANCELLED',
        cancellationReason: reason || 'Cancelled by patient',
      },
    });

    // 3. Record Audit
    await prisma.appointmentHistory.create({
      data: {
        appointmentId: id,
        action: 'CANCELLED',
        reason: reason || 'Cancelled by patient',
        performedBy: req.user?.name || 'Patient',
        performedByRole: req.user?.role || 'PATIENT',
      },
    });

    // 4. Recalculate Risk
    await RiskEngineService.calculatePatientRisk(appt.patientId);

    res.status(200).json({
      message: 'Appointment cancelled. Reminder jobs paused.',
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to cancel appointment.' });
  }
};

export const completeAppointment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);

    const appt = await prisma.appointment.findUnique({
      where: { appointmentId: id },
    });

    if (!appt) {
      res.status(404).json({ message: 'Appointment not found.' });
      return;
    }

    // Invalidate pending reminder jobs
    await ReminderSchedulerService.invalidateReminderJobs(id);

    // Update status to COMPLETED
    const updated = await prisma.appointment.update({
      where: { appointmentId: id },
      data: {
        status: 'COMPLETED',
        isOverdue: false,
      },
    });

    // Update patient status if all complete
    await prisma.patientProfile.update({
      where: { patientId: appt.patientId },
      data: { status: 'DISCHARGED_COMPLETED' },
    });

    // Audit record
    await prisma.appointmentHistory.create({
      data: {
        appointmentId: id,
        action: 'COMPLETED',
        reason: 'Patient attended clinical follow-up consultation. Care loop closed.',
        performedBy: req.user?.name || 'Coordinator',
        performedByRole: req.user?.role || 'COORDINATOR',
      },
    });

    // Recalculate Risk
    const riskResult = await RiskEngineService.calculatePatientRisk(appt.patientId);

    res.status(200).json({
      message: 'Follow-up appointment marked as COMPLETED. Care loop closed successfully.',
      data: {
        appointment: updated,
        updatedRiskScore: riskResult.calculatedScore,
        updatedRiskLevel: riskResult.riskLevel,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to complete appointment.' });
  }
};

export const noShowAppointment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);

    const appt = await prisma.appointment.findUnique({
      where: { appointmentId: id },
    });

    if (!appt) {
      res.status(404).json({ message: 'Appointment not found.' });
      return;
    }

    // Invalidate old reminder jobs
    await ReminderSchedulerService.invalidateReminderJobs(id);

    // Update status to NO_SHOW and isOverdue to true
    const updated = await prisma.appointment.update({
      where: { appointmentId: id },
      data: {
        status: 'NO_SHOW',
        isOverdue: true,
      },
    });

    // Audit record
    await prisma.appointmentHistory.create({
      data: {
        appointmentId: id,
        action: 'NO_SHOW',
        reason: 'Patient did not attend scheduled follow-up consultation.',
        performedBy: req.user?.name || 'Coordinator',
        performedByRole: req.user?.role || 'COORDINATOR',
      },
    });

    // Recalculate Risk (will trigger MISSED_APPOINTMENTS factor: +30 pts)
    const riskResult = await RiskEngineService.calculatePatientRisk(appt.patientId);

    res.status(200).json({
      message: 'No-show recorded. Care Follow-Up Risk Score escalated.',
      data: {
        appointment: updated,
        updatedRiskScore: riskResult.calculatedScore,
        updatedRiskLevel: riskResult.riskLevel,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to record no-show.' });
  }
};
