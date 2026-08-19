import { Router } from 'express';
import {
  getAdminDashboard,
  getPatients,
  getPatientById,
  createPatient,
  getAnalytics,
  getIntegrationStatus,
  getDiseases,
} from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Protect all admin routes
router.use(authenticateToken);
router.use(requireRole(['ADMIN', 'COORDINATOR']));

router.get('/dashboard', getAdminDashboard);
router.get('/patients', getPatients);
router.get('/patients/:id', getPatientById);
router.post('/patients', createPatient);
router.get('/analytics', getAnalytics);
router.get('/integrations/status', getIntegrationStatus);
router.get('/diseases', getDiseases);

export default router;
