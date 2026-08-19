import { Router } from 'express';
import {
  getPatientDashboard,
  getPatientTimeline,
  confirmAttendance,
  updatePreferences,
  markNotificationAsRead,
} from '../controllers/patientController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/dashboard', getPatientDashboard);
router.get('/timeline', getPatientTimeline);
router.post('/confirm-attendance', confirmAttendance);
router.put('/preferences', updatePreferences);
router.put('/notifications/:id/read', markNotificationAsRead);

export default router;
