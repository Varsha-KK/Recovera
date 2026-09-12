/**
 * Phone number normalization and utility helpers.
 * Ensures numbers are properly formatted without enforcing any hardcoded allowlists.
 */

/**
 * Normalizes a phone number to standard E.164 format (e.g. +919844328475).
 * Returns null if the phone is null, empty, or invalid.
 */
export function normalizePhoneNumber(phone: string | null | undefined): string | null {
  if (!phone || typeof phone !== 'string') return null;

  const trimmed = phone.trim();
  if (!trimmed) return null;

  // Remove common delimiter characters (spaces, dashes, parentheses, dots)
  const cleaned = trimmed.replace(/[\s\-\(\)\.]/g, '');

  // If already starts with '+' followed by country code (e.g. +919844328475, +17372212163)
  const e164Regex = /^\+[1-9]\d{6,14}$/;
  if (e164Regex.test(cleaned)) {
    return cleaned;
  }

  // If 10-digit Indian number without country code (e.g. 9844328475), prefix with +91
  if (/^[6-9]\d{9}$/.test(cleaned)) {
    return `+91${cleaned}`;
  }

  // If 11-digit number with leading 0 (e.g. 09844328475), strip leading 0 and prefix with +91
  if (/^0[6-9]\d{9}$/.test(cleaned)) {
    return `+91${cleaned.slice(1)}`;
  }

  // If 12-digit number starting with 91 (e.g. 919844328475), prefix with +
  if (/^91[6-9]\d{9}$/.test(cleaned)) {
    return `+${cleaned}`;
  }

  return null;
}

/**
 * Backward compatibility alias for normalizePhoneNumber
 */
export const normalizeToE164 = normalizePhoneNumber;

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
  normalizePhoneNumber,
  normalizeToE164,
  maskPhoneNumber,
};
