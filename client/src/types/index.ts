// Recovera Core TypeScript Interfaces

export type UserRole = 'ADMIN' | 'PATIENT' | 'COORDINATOR';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AppointmentHistoryItem {
  id: string;
  appointmentId: string;
  action: string;
  reason?: string;
  timestamp: string;
  performedBy: string;
  performedByRole: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  patientId?: string | null;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  instructions?: string;
}

export interface Vitals {
  bp?: string;
  heartRate?: string;
  bloodSugar?: string;
  temp?: string;
  bmi?: string;
  spo2?: string;
  egfr?: string;
  [key: string]: string | undefined;
}

export interface ReminderPreferences {
  sms: boolean;
  voice: boolean;
  push: boolean;
  preferredTime?: string;
}

export interface PatientProfileData {
  patientId: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email?: string;
  diagnosis: string;
  primaryDoctor: string;
  department: string;
  dischargeDate: string;
  formattedDischargeDate?: string;
  baselineSeverity: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  status: string;
  notes?: string;
  vitals?: Vitals;
  medications?: Medication[];
  reminderPreferences?: ReminderPreferences;
  riskFactors?: string[];
  nextAppointment?: {
    appointmentId: string;
    type: string;
    scheduledDate: string;
    formattedDate: string;
    scheduledTime: string;
    status: string;
    isOverdue: boolean;
  } | null;
  pendingTestName?: string | null;
  lastContactDate?: string;
  lastContactChannel?: string;
  lastContactStatus?: string;
}

export interface FollowUpWindow {
  start: string;
  end: string;
}

export interface ReminderTimelineItem {
  channel: 'SMS' | 'VOICE' | 'PUSH';
  scheduledFor: string;
  formattedDate: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'CANCELLED';
  title: string;
}

export interface AppointmentData {
  appointmentId: string;
  patientId: string;
  patientName?: string;
  patientPhone?: string;
  patientRiskScore?: number;
  patientRiskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  hospital?: string;
  department: string;
  doctorName: string;
  type: string;
  scheduledDate: string;
  scheduledTime: string;
  followUpWindow?: FollowUpWindow;
  status: 'SCHEDULED' | 'CONFIRMED' | 'RESCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  isOverdue: boolean;
  patientNotes?: string;
  reminderTimeline?: ReminderTimelineItem[];
}

export interface CarePlanMilestone {
  milestoneId: string;
  type: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';
  completedAt?: string;
  channels?: string[];
}

export interface CarePlanData {
  carePlanId: string;
  patientId: string;
  diseaseId?: string;
  diseaseName: string;
  severity: string;
  dischargeDate: string;
  recommendedWindowStart: string;
  recommendedWindowEnd: string;
  isActive: boolean;
  milestones: CarePlanMilestone[];
  notes?: string;
}

export interface RiskFactor {
  code: string;
  name: string;
  description: string;
  impactScore: number;
  triggered: boolean;
}

export interface RiskAssessmentData {
  assessmentId: string;
  patientId: string;
  calculatedScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  factors: RiskFactor[];
  summary?: string;
  recommendedAction?: string;
  timestamp: string;
}

export interface CommunicationLogData {
  logId: string;
  patientId: string;
  patientName: string;
  appointmentId?: string;
  channel: 'SMS' | 'VOICE' | 'PUSH';
  recipient: string;
  message: string;
  status: 'SENT' | 'DELIVERED' | 'FAILED' | 'QUEUED';
  timestamp: string;
  metadata?: any;
}

export interface CallLogData {
  callId: string;
  patientId: string;
  patientName: string;
  phone: string;
  purpose: string;
  callSid?: string;
  status: 'QUEUED' | 'RINGING' | 'IN_PROGRESS' | 'ANSWERED' | 'COMPLETED' | 'NO_ANSWER' | 'FAILED';
  durationSeconds: number;
  transcription?: string;
  audioUrl?: string;
  date: string;
  time: string;
}

export interface NotificationData {
  notificationId: string;
  patientId: string;
  title: string;
  message: string;
  type: 'APPOINTMENT_REMINDER' | 'RISK_ALERT' | 'SYSTEM';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface IntegrationStatus {
  twilioSms: {
    configured: boolean;
    enabled: boolean;
    phoneNumber: string | null;
    accountSid: string | null;
  };
  twilioVoice: {
    configured: boolean;
    enabled: boolean;
    phoneNumber: string | null;
  };
  elevenLabs: {
    configured: boolean;
    voiceId: string;
    maskedKey: string | null;
  };
  webPush: {
    configured: boolean;
    enabled: boolean;
    subject: string;
  };
}
