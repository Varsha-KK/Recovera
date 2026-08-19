import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { ENV } from '../config/env.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name is required'),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'PATIENT', 'COORDINATOR']).default('PATIENT'),
  // Optional patient profile fields if registering as patient
  diagnosis: z.string().optional(),
  primaryDoctor: z.string().optional(),
  department: z.string().optional(),
  age: z.number().optional(),
  gender: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const validated = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase() },
    });

    if (existingUser) {
      res.status(409).json({ message: 'User with this email already exists.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(validated.password, 10);

    const user = await prisma.user.create({
      data: {
        email: validated.email.toLowerCase(),
        password: hashedPassword,
        name: validated.name,
        phone: validated.phone || null,
        role: validated.role,
      },
    });

    let patientProfileId = null;

    // If role is PATIENT, automatically formulate initial patient profile
    if (validated.role === 'PATIENT') {
      const patientId = `PT-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
      const profile = await prisma.patientProfile.create({
        data: {
          patientId,
          userId: user.id,
          name: validated.name,
          age: validated.age || 45,
          gender: validated.gender || 'OTHER',
          phone: validated.phone || '+1 (555) 000-0000',
          email: validated.email.toLowerCase(),
          diagnosis: validated.diagnosis || 'Post-Discharge General Care',
          primaryDoctor: validated.primaryDoctor || 'Dr. Sarah Jenkins',
          department: validated.department || 'General Medicine',
          dischargeDate: new Date(),
          baselineSeverity: 'MEDIUM',
          riskScore: 25,
          riskLevel: 'LOW',
          status: 'ACTIVE',
        },
      });
      patientProfileId = profile.patientId;
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        patientId: patientProfileId,
      },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account registered successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        patientId: patientProfileId,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.errors[0]?.message || 'Validation error' });
      return;
    }
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error during registration.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const validated = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase() },
      include: { patientProfile: true },
    });

    if (!user) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(validated.password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const patientId = user.patientProfile?.patientId || null;

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        patientId,
      },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        patientId,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.errors[0]?.message || 'Validation error' });
      return;
    }
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error during authentication.' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { patientProfile: true },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        patientId: user.patientProfile?.patientId || null,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to retrieve profile.' });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({ message: 'Logged out successfully.' });
};
