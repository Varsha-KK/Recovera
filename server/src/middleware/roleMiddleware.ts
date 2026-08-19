import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware.js';

export const requireRole = (...allowedRoles: ('ADMIN' | 'PATIENT' | 'COORDINATOR')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.role) {
      res.status(401).json({ success: false, message: 'Unauthorized. Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden. Role '${req.user.role}' does not have permission for this resource. Required: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
};

export const requireAdmin = requireRole('ADMIN', 'COORDINATOR');
export const requirePatient = requireRole('PATIENT');
