import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cron from 'node-cron';

import { ENV } from './config/env.js';
import { prisma } from './config/prisma.js';
import { getTestRecipientsCount } from './services/twilioTestRecipients.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import followupRoutes from './routes/followupRoutes.js';
import riskRoutes from './routes/riskRoutes.js';
import integrationRoutes from './routes/integrationRoutes.js';

// Services
import { ReminderSchedulerService } from './services/reminderSchedulerService.js';
import { EscalationService } from './services/escalationService.js';
import { errorHandler } from './middleware/errorMiddleware.js';

const app = express();
app.set('trust proxy', 1);
// Security Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS Configuration supporting development on any local port (5173, 5174, etc.)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(
        origin
      );
      if (isLocalhost || origin === ENV.CLIENT_URL) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { message: 'Too many requests from this IP, please try again later.' },
});
app.use('/api/', limiter);

// Body Parsing (Strict JSON parser with error forwarding)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'Recovera Backend API',
    tagline: "From diagnosis to recovery, we don't lose the patient.",
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'Recovera Backend API',
    tagline: "From diagnosis to recovery, we don't lose the patient.",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/voice', notificationRoutes); // Alias for Twilio voice webhooks (/api/voice/twiml, /api/voice/audio, /api/voice/status-callback)
app.use('/api/followups', followupRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/integrations', integrationRoutes);

// Error Handling Middleware (must be mounted after routes)
app.use(errorHandler);

// Background Worker for Reminders and Escalations (Runs every 5 minutes)
const startBackgroundJobs = () => {
  console.log('⏱️ [BackgroundJobs] Initializing Recovera Reminder & Escalation worker...');

  cron.schedule('*/5 * * * *', async () => {
    try {
      await ReminderSchedulerService.processDueReminders();
      await EscalationService.checkAndEscalateUnreachedPatients();
    } catch (err) {
      console.error('[BackgroundJobs] Error executing scheduled jobs:', err);
    }
  });
};

// Start Server & Check Database
const startServer = async () => {
  try {
    // Test Database connection
    await prisma.$connect();

    const server = app.listen(ENV.PORT, () => {
      console.log('\n======================================================');
      console.log('Recovera Server');
      console.log('======================================================');
      console.log('[Database] PostgreSQL: CONNECTED\n');
      console.log('[Twilio]');
      console.log(`Account SID: ${ENV.TWILIO_ACCOUNT_SID ? 'SET' : 'MISSING'}`);
      console.log(`API Key SID: ${ENV.TWILIO_API_KEY_SID ? 'SET' : 'MISSING'}`);
      console.log(`API Key Secret: ${ENV.TWILIO_API_KEY_SECRET ? 'SET' : 'MISSING'}`);
      console.log(`Phone Number: ${ENV.TWILIO_PHONE_NUMBER ? 'SET' : 'MISSING'}`);
      console.log(`SMS: ${ENV.SMS_ENABLED ? 'ENABLED' : 'DISABLED'}`);
      console.log(`Voice: ${ENV.VOICE_CALL_ENABLED ? 'ENABLED' : 'DISABLED'}`);
      console.log(`Public Base URL: ${ENV.TWILIO_PUBLIC_BASE_URL || 'NOT CONFIGURED'}`);
      console.log(`Test Recipients: ${getTestRecipientsCount()}`);
      console.log('======================================================\n');
      startBackgroundJobs();
    });

    // Graceful error handling for Port in use (EADDRINUSE)
    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n⚠️  Port ${ENV.PORT} is already in use.`);
        console.error('   Stop the existing Recovera server before starting another instance.\n');
        process.exit(1);
      } else {
        console.error('❌ [Server Error]:', err.message || err);
        process.exit(1);
      }
    });
  } catch (error: any) {
    console.error('❌ [Server] Failed to connect to database or start Recovera server:', error.message || error);
    process.exit(1);
  }
};

startServer();

export default app;
