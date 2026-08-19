import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { prisma } from '../config/prisma.js';

export const completeMilestone = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const milestoneId = String(req.params.milestoneId);

    const milestone = await prisma.followUp.findUnique({
      where: { milestoneId },
    });

    if (!milestone) {
      res.status(404).json({ message: 'Milestone not found.' });
      return;
    }

    const updated = await prisma.followUp.update({
      where: { milestoneId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    res.status(200).json({
      message: 'Care plan milestone marked as completed.',
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to complete milestone.' });
  }
};
