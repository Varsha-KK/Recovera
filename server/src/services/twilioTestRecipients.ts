import { ENV } from '../config/env.js';

/**
 * Normalizes a phone number to E.164 format.
 * Returns null if the number is invalid, empty, or ambiguous.
 */
export function normalizeToE164(phone: string | null | undefined): string | null {
  if (!phone || typeof phone !== 'string') return null;

  // Trim whitespace
  const trimmed = phone.trim();
  if (!trimmed) return null;

  // Remove common delimiter characters (spaces, dashes, parentheses, dots)
  const cleaned = trimmed.replace(/[\s\-\(\)\.]/g, '');

  // Must start with '+' followed by country code and subscriber digits (7 to 15 total digits)
  const e164Regex = /^\+[1-9]\d{6,14}$/;

  if (e164Regex.test(cleaned)) {
    return cleaned;
  }

  // If number starts with digits without +, we do NOT assume arbitrary country code
  return null;
}

/**
 * Retrieves the deduplicated list of valid configured E.164 test recipients.
 */
export function getTestRecipients(): string[] {
  const rawList = [
    ENV.TWILIO_TEST_NUMBER_1 || process.env.TWILIO_TEST_NUMBER_1,
    ENV.TWILIO_TEST_NUMBER_2 || process.env.TWILIO_TEST_NUMBER_2,
    ENV.TWILIO_TEST_NUMBER_3 || process.env.TWILIO_TEST_NUMBER_3,
  ];

  const unique = new Set<string>();

  for (const raw of rawList) {
    const normalized = normalizeToE164(raw);
    if (normalized) {
      unique.add(normalized);
    }
  }

  return Array.from(unique);
}

/**
 * Returns the count of valid test recipients currently configured.
 */
export function getTestRecipientsCount(): number {
  return getTestRecipients().length;
}

/**
 * Resolves a 1-based test recipient index (1, 2, 3) to the configured test number.
 */
export function getTestRecipientByIndex(index: number): string | null {
  const list = [
    normalizeToE164(ENV.TWILIO_TEST_NUMBER_1 || process.env.TWILIO_TEST_NUMBER_1),
    normalizeToE164(ENV.TWILIO_TEST_NUMBER_2 || process.env.TWILIO_TEST_NUMBER_2),
    normalizeToE164(ENV.TWILIO_TEST_NUMBER_3 || process.env.TWILIO_TEST_NUMBER_3),
  ];

  if (index >= 1 && index <= 3) {
    return list[index - 1] || null;
  }
  return null;
}

/**
 * Validates whether a given recipient phone number is allowed.
 * In development/test mode, only configured test recipients in the allowlist are permitted.
 */
export function isAllowedRecipient(phoneNumber: string | null | undefined): boolean {
  const normalized = normalizeToE164(phoneNumber);
  if (!normalized) return false;

  // In production, all valid E.164 numbers are allowed
  if (ENV.NODE_ENV === 'production') {
    return true;
  }

  // In development / testing mode, enforce the strict allowlist
  const allowlist = getTestRecipients();
  return allowlist.includes(normalized);
}

/**
 * Safely masks a phone number for UI display or logs without exposing full personal number.
 * Example: +919844328475 -> +91••••••8475
 */
export function maskPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return 'Not configured';
  const clean = phone.trim();
  if (clean.length <= 6) return '••••••';
  const prefix = clean.slice(0, 3);
  const suffix = clean.slice(-4);
  return `${prefix}••••••${suffix}`;
}

export default {
  normalizeToE164,
  getTestRecipients,
  getTestRecipientsCount,
  getTestRecipientByIndex,
  isAllowedRecipient,
  maskPhoneNumber,
};
