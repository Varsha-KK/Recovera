import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { RiskEngineService } from '../services/riskEngineService.js';
import { prisma } from '../config/prisma.js';

export const recalculatePatientRisk = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const patientId = String(req.params.patientId);

    const result = await RiskEngineService.calculatePatientRisk(patientId);

    res.status(200).json({
      message: 'Care Follow-Up Risk Score recalculated successfully.',
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to recalculate risk.' });
  }
};

export const getPatientRiskExplanation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const patientId = String(req.params.patientId);

    const assessment = await prisma.riskAssessment.findFirst({
      where: { patientId },
      orderBy: { timestamp: 'desc' },
    });

    if (!assessment) {
      // Calculate fresh assessment
      const calculated = await RiskEngineService.calculatePatientRisk(patientId);
      res.status(200).json({ data: calculated });
      return;
    }

    res.status(200).json({ data: assessment });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to retrieve risk assessment.' });
  }
};
