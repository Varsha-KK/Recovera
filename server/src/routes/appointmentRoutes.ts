import { Router } from 'express';
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  rescheduleAppointment,
  cancelAppointment,
  completeAppointment,
  noShowAppointment,
} from '../controllers/appointmentController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.post('/', createAppointment);
router.post('/:id/reschedule', rescheduleAppointment);
router.post('/:id/cancel', cancelAppointment);
router.post('/:id/complete', completeAppointment);
router.post('/:id/no-show', noShowAppointment);

export default router;
