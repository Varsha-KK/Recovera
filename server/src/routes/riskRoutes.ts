import { Router } from 'express';
import {
  recalculatePatientRisk,
  getPatientRiskExplanation,
} from '../controllers/riskController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.post('/recalculate/:patientId', recalculatePatientRisk);
router.get('/explanation/:patientId', getPatientRiskExplanation);

export default router;
