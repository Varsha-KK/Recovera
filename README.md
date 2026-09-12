# Recovera — Intelligent Post-Discharge Healthcare SaaS Platform

> **"From diagnosis to recovery, we don't lose the patient."**  
> *Predict. Prioritize. Remind. Follow through.*

![Recovera Architecture](https://img.shields.io/badge/Architecture-PostgreSQL%20%2B%20Prisma%20%2B%20Express%20%2B%20React-0d9488)
![Database](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql)
![Voice AI](https://img.shields.io/badge/Voice%20AI-ElevenLabs%20%2B%20Exotel%20Voice-purple)
![Outreach](https://img.shields.io/badge/Outreach-Exotel%20SMS%20%2B%20Web%20Push-red)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## 📖 Executive Overview

When someone is diagnosed with a long-term condition (such as diabetes, hypertension, tuberculosis, chronic kidney disease, or post-cardiac surgery), the hardest part of clinical recovery begins **after they leave the hospital doors**, not during the inpatient stay.

Patients quietly drop out of care because of:
1. **False Sense of Recovery**: Symptoms stabilize post-discharge, leading patients to mistakenly believe they are cured.
2. **Static Paper Discharge Slips**: Easily misplaced documents without dynamic reminder sequences or calendar sync.
3. **Uncompleted Diagnostic Pre-Tests**: Arriving at consultations without required fasting labs or HbA1c tests.
4. **Care Team Blindspots**: Hospitals only learn about care drop-off when the patient returns in acute emergency readmission.

**Recovera** solves this with an intelligent, closed-loop transitional care SaaS platform that unifies PostgreSQL persistence, explainable risk scoring, multi-channel automated reminders (Exotel SMS, automated Exotel/ElevenLabs Voice calls, Web Push), single-click patient confirmations, and clinically validated smart rescheduling.

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

### 3. Exotel Voice & SMS Telephony Integration
- Connects patients dynamically to configured Recovera appointment flows via Exotel Voice.
- Dispatches automated clinical SMS follow-ups using live PostgreSQL patient and appointment records.
- Records all communication attempts and call logs into `CommunicationLog` and `CallLog`.

### 4. Closed-Loop Appointment & Reminder Synchronization
- **Dynamic Reminders**: Automatically generates $-3\text{d}$ (SMS), $-2\text{d}$ (Push), and $-1\text{d}$ (Voice) reminder jobs.
- **Automated Invalidation & Regeneration**: When a patient or coordinator reschedules or cancels an appointment, old pending reminder jobs are instantly invalidated (`CANCELLED`) and a fresh sequence is generated.
- **Clinical Window Validation**: Rescheduling strictly enforces the safe clinical follow-up window (e.g. 7–14 days post-discharge).

### 5. Admin Outreach Integrations Center (`/admin/settings/integrations`)
- Real-time connection statuses for Exotel SMS, Exotel Voice, ElevenLabs, and Web Push with masked credentials (`••••••••`) ensuring zero secret exposure.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Framer Motion, Axios, React Router v6 |
| **Backend API** | Node.js, Express, TypeScript, Prisma ORM, Node-Cron, JWT, Bcrypt, Helmet, CORS |
| **Database** | PostgreSQL |
| **Voice AI & Telephony** | ElevenLabs Speech Synthesis API, Exotel REST API (SMS & Voice Calls) |
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
│   │   │   ├── exotelSmsService.ts
│   │   │   ├── exotelVoiceService.ts
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
    │   │   └── voice/           # AudioPreviewPlayer, VoiceCallModal
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

# Exotel Configuration
EXOTEL_ACCOUNT_SID=recovera1
EXOTEL_SUBDOMAIN=api.exotel.com
EXOTEL_API_KEY=
EXOTEL_API_TOKEN=
EXOTEL_VOICE_APP_ID=1338862
EXOTEL_SMS_SENDER_ID=
EXOTEL_VOICE_EXOPHONE=

# ElevenLabs Voice Configuration
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM

# Web Push Notifications (VAPID)
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:coordinator@recovera.health
```
