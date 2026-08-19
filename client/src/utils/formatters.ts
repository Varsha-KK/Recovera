import { format, parseISO } from 'date-fns';

export const formatDate = (dateStr?: string): string => {
  if (!dateStr) return 'N/A';
  try {
    const cleanDate = dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`;
    return format(parseISO(cleanDate), 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
};

export const formatSpokenDate = (dateStr?: string): string => {
  if (!dateStr) return 'your scheduled date';
  try {
    const cleanDate = dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`;
    return format(parseISO(cleanDate), 'EEEE, MMMM d, yyyy');
  } catch {
    return dateStr;
  }
};

export const formatTime = (timeStr?: string): string => {
  if (!timeStr) return '';
  return timeStr;
};

export const formatSpokenTime = (timeStr?: string): string => {
  if (!timeStr) return 'your scheduled time';
  const trimmed = timeStr.trim();
  if (/^\d{1,2}:\d{2}\s*(AM|PM|am|pm)$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  const match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  }
  return trimmed;
};

export const buildVoiceMessageText = (
  patientName?: string,
  doctorName?: string,
  scheduledDate?: string,
  scheduledTime?: string,
  hospital?: string
): string => {
  const name = patientName?.trim() || 'Patient';
  const doc = doctorName ? `Dr. ${doctorName.replace(/^Dr\.\s*/i, '')}` : 'your primary doctor';
  const hosp = hospital?.trim() || 'City Care Hospital';
  const dateFormatted = formatSpokenDate(scheduledDate);
  const timeFormatted = formatSpokenTime(scheduledTime);

  return `Hello ${name}. This is an automated follow-up reminder from Recovera and ${hosp} regarding your upcoming consultation with ${doc}. Your appointment is scheduled for ${dateFormatted} at ${timeFormatted}. Please confirm your checkup or visit your Recovera portal. Thank you.`;
};

export const buildAppointmentSmsText = (
  patientName?: string,
  doctorName?: string,
  scheduledDate?: string,
  scheduledTime?: string
): string => {
  const name = patientName?.trim() || 'Patient';
  const dateFormatted = formatSpokenDate(scheduledDate);
  const timeFormatted = formatSpokenTime(scheduledTime);

  let doctorPart = '';
  if (doctorName && doctorName.trim()) {
    const doc = doctorName.trim().startsWith('Dr.') ? doctorName.trim() : `Dr. ${doctorName.trim()}`;
    doctorPart = ` with ${doc}`;
  }

  return `Recovera Follow-Up: Hello ${name}. Your appointment is scheduled for ${dateFormatted} at ${timeFormatted}${doctorPart}. Please be available at the scheduled time. Thank you.`;
};

export const getRiskBadgeColor = (level: 'LOW' | 'MEDIUM' | 'HIGH') => {
  switch (level) {
    case 'HIGH':
      return {
        bg: 'bg-rose-50 border-rose-200 text-rose-700',
        dot: 'bg-rose-500',
        border: 'border-rose-300',
        ring: 'ring-rose-500/20',
      };
    case 'MEDIUM':
      return {
        bg: 'bg-amber-50 border-amber-200 text-amber-700',
        dot: 'bg-amber-500',
        border: 'border-amber-300',
        ring: 'ring-amber-500/20',
      };
    case 'LOW':
    default:
      return {
        bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
        dot: 'bg-emerald-500',
        border: 'border-emerald-300',
        ring: 'ring-emerald-500/20',
      };
  }
};

export const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
    case 'FOLLOW_UP_CONFIRMED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'COMPLETED':
    case 'DISCHARGED_COMPLETED':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'RESCHEDULED':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'NEEDS_ATTENTION':
    case 'OVERDUE':
    case 'NO_SHOW':
      return 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
    case 'CANCELLED':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    case 'SCHEDULED':
    case 'ACTIVE':
    default:
      return 'bg-brand-50 text-brand-700 border-brand-200';
  }
};
