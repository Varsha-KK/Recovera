import { Router } from 'express';
import { completeMilestone } from '../controllers/followupController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.post('/milestones/:milestoneId/complete', completeMilestone);

export default router;
