# Recovera — Intelligent Post-Discharge Healthcare SaaS Platform

> **"From diagnosis to recovery, we don't lose the patient."**  
> *Predict. Prioritize. Remind. Follow through.*

![Recovera Architecture](https://img.shields.io/badge/Architecture-PostgreSQL%20%2B%20Prisma%20%2B%20Express%20%2B%20React-0d9488)
![Database](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql)
![Voice AI](https://img.shields.io/badge/Voice%20AI-ElevenLabs%20%2B%20Twilio%20Voice-purple)
![Outreach](https://img.shields.io/badge/Outreach-Twilio%20SMS%20%2B%20Web%20Push-red)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## 📖 Executive Overview

When someone is diagnosed with a long-term condition (such as diabetes, hypertension, tuberculosis, chronic kidney disease, or post-cardiac surgery), the hardest part of clinical recovery begins **after they leave the hospital doors**, not during the inpatient stay.

Patients quietly drop out of care because of:
1. **False Sense of Recovery**: Symptoms stabilize post-discharge, leading patients to mistakenly believe they are cured.
2. **Static Paper Discharge Slips**: Easily misplaced documents without dynamic reminder sequences or calendar sync.
3. **Uncompleted Diagnostic Pre-Tests**: Arriving at consultations without required fasting labs or HbA1c tests.
4. **Care Team Blindspots**: Hospitals only learn about care drop-off when the patient returns in acute emergency readmission.

**Recovera** solves this with an intelligent, closed-loop transitional care SaaS platform that unifies PostgreSQL persistence, explainable risk scoring, multi-channel automated reminders (Twilio SMS, automated ElevenLabs Voice calls, Web Push), single-click patient confirmations, and clinically validated smart rescheduling.

---

## 🚀 Key Architectural Capabilities

### 1. PostgreSQL + Prisma ORM Relational Foundation
- Comprehensive relational schema spanning 15 models: `User`, `Hospital`, `Disease`, `PatientProfile`, `CarePlan`, `FollowUp`, `Appointment`, `AppointmentHistory`, `ReminderJob`, `RiskAssessment`, `Notification`, `CommunicationLog`, `CallLog`, `MedicationReminder`, `TestRequirement`.
- Strict foreign keys, audit timestamps, and indexing on `(scheduledDate, status)`, `(patientId, status)`, and `(channel, status)`.

### 2. Explainable Care Follow-Up Risk Engine (0–100)
- **Transparent Rule-Based Scoring**:
  - Baseline disease severity: $+25\text{ pts}$
  - Previous missed appointment / no-show: $+30\text{ pts}$
  - Elapsed clinical follow-up window: $+35\text{ pts}$
  - Pending pre-visit laboratory panel: $+15\text{ pts}$
  - Unanswered outreach attempts: $+10\text{ pts}$
  - Explicit attendance confirmation ("I'll Attend"): $-30\text{ pts}$
- Fully transparent clinical explanation breakdowns shown to coordinators.

### 3. ElevenLabs AI → Twilio Voice Integration
- Synthesizes natural, empathetic audio instructions tailored to each patient's discharge plan via ElevenLabs.
- Exposes secure streaming endpoints (`/api/voice/audio/:audioId.mp3`) and dynamic TwiML generation (`/api/voice/twiml/:audioId`).
- Triggers outbound Twilio Voice calls with real-time status callback tracking (`initiated`, `ringing`, `answered`, `completed`) persisting exact call durations and timestamps into `CallLog`.

### 4. Closed-Loop Appointment & Reminder Synchronization
- **Dynamic Reminders**: Automatically generates $-3\text{d}$ (SMS), $-2\text{d}$ (Push), and $-1\text{d}$ (Voice) reminder jobs.
- **Automated Invalidation & Regeneration**: When a patient or coordinator reschedules or cancels an appointment, old pending reminder jobs are instantly invalidated (`CANCELLED`) and a fresh sequence is generated.
- **Clinical Window Validation**: Rescheduling strictly enforces the safe clinical follow-up window (e.g. 7–14 days post-discharge).

### 5. Admin Outreach Integrations Center (`/admin/settings/integrations`)
- Real-time connection statuses for Twilio SMS, Twilio Voice, ElevenLabs, and Web Push with masked credentials (`••••••••`) ensuring zero secret exposure.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Framer Motion, Axios, React Router v6 |
| **Backend API** | Node.js, Express, TypeScript, Prisma ORM, Node-Cron, JWT, Bcrypt, Helmet, CORS |
| **Database** | PostgreSQL |
| **Voice AI & Telephony** | ElevenLabs Speech Synthesis API, Twilio Voice API (TwiML), Twilio Programmable SMS |
| **Push Notifications** | Web Push API / VAPID Protocol |

---

## 📦 Project Structure

```
Recovera/
├── package.json                 # Root script runner (dev, build, db scripts)
├── README.md                    # System documentation
├── server/
│   ├── prisma/
│   │   ├── schema.prisma        # 15 Relational PostgreSQL Models
│   │   └── seed.ts              # 20+ Realistic Clinical Cohorts & Seed Data
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts           # Environment variables & masked status helper
│   │   │   └── prisma.ts        # Singleton Prisma client instance
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── patientController.ts
│   │   │   ├── adminController.ts
│   │   │   ├── appointmentController.ts
│   │   │   ├── notificationController.ts
│   │   │   ├── followupController.ts
│   │   │   └── riskController.ts
│   │   ├── services/
│   │   │   ├── riskEngineService.ts
│   │   │   ├── reminderSchedulerService.ts
│   │   │   ├── escalationService.ts
│   │   │   ├── twilioSmsService.ts
│   │   │   ├── twilioVoiceService.ts
│   │   │   ├── elevenLabsService.ts
│   │   │   └── webPushService.ts
│   │   ├── middleware/
│   │   │   ├── authMiddleware.ts
│   │   │   ├── roleMiddleware.ts
│   │   │   └── errorMiddleware.ts
│   │   ├── routes/
│   │   └── server.ts            # Server entry point & background cron
└── client/
    ├── src/
    │   ├── contexts/            # AuthContext & ToastContext
    │   ├── pages/
    │   │   ├── LandingPage.tsx
    │   │   ├── LoginPage.tsx
    │   │   ├── RegisterPage.tsx
    │   │   ├── patient/         # Patient Dashboard, Timeline, Appointments, Prefs
    │   │   └── admin/           # Coordinator Dashboard, Directory, Detail, Integrations
    │   ├── components/
    │   │   ├── landing/         # Hero, Problem, Solution, Journey, Risk, Channels, ROI
    │   │   ├── admin/           # MetricCards, RiskDonut, AdherenceTrend, AttentionQueue
    │   │   ├── patient/         # NextActionHero, CareTimeline, RescheduleModal
    │   │   └── voice/           # AudioPreviewPlayer, SimulatedCallModal
    │   └── services/            # Axios API services
```

---

## ⚡ Quickstart & Setup Guide

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL database (local or cloud like Neon, Supabase, AWS RDS)

### 2. Environment Configuration
Create `.env` inside `server/` (or copy `.env.example`):

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000

# PostgreSQL Connection String
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/recovera?schema=public"

# JWT Authentication Secret
JWT_SECRET=recovera_jwt_secret_key_production_2026

# Twilio Configuration
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
VOICE_CALL_ENABLED=false

# ElevenLabs Voice Configuration
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM

# Web Push Notifications (VAPID)
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:coordinator@recovera.health
```

### 3. Database Migration & Seeding
```bash
# In root or server directory:
cd server
npm install
npx prisma generate
npx prisma db push
npm run db:seed
```

### 4. Launching Recovera Locally
```bash
# In repository root:
npm install
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API & Health**: `http://localhost:5000/api/health`

---

## 👥 Standard User Accounts

| Role | Email | Password | Persona & Responsibilities |
|---|---|---|---|
| **Hospital Coordinator** | `admin@recovera.health` | `Admin@123Password` | **Dr. Sarah Jenkins** (Transitional Care Coordinator) — Manages high-risk attention queue, 20+ clinical cohorts, scheduling, Twilio voice dispatches, and outreach integrations. |
| **Discharged Patient** | `maria.gonzalez@recovera.patient` | `Patient@123Secure` | **Maria Gonzalez** (Discharged Type 2 Diabetes Patient) — Mobile-first dashboard, Next Action appointment card, 1-click confirmation ("I'll Attend"), and clinical-window rescheduling. |

---

## 🛡️ Administrative Regulatory Disclaimer

> **Notice**: Recovera is an administrative transitional care management and patient adherence platform. It does not provide automated medical diagnoses, prescribe pharmaceuticals, alter dosages, or replace physician judgment. All patient cohorts provided in initial seeds are synthetic demonstration records for care coordination workflows.
