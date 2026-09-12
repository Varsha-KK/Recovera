import { ENV } from '../config/env.js';

export interface ExotelMappedError {
  code: string;
  message: string;
  statusCode?: number | string;
  rawDetails?: any;
}

/**
 * Checks whether Exotel is properly configured with required credentials
 */
export function isExotelConfigured(): boolean {
  return Boolean(
    ENV.EXOTEL_ACCOUNT_SID &&
    ENV.EXOTEL_API_KEY &&
    ENV.EXOTEL_API_TOKEN &&
    ENV.EXOTEL_API_KEY !== 'Recovera'
  );
}

/**
 * Returns HTTP Basic Authentication headers for Exotel REST API
 */
export function getExotelAuthHeaders(): Record<string, string> {
  if (!isExotelConfigured()) {
    throw new Error(
      'Exotel credentials not configured. Please ensure EXOTEL_ACCOUNT_SID, EXOTEL_API_KEY, and EXOTEL_API_TOKEN are set in server/.env.'
    );
  }

  const credentials = Buffer.from(
    `${ENV.EXOTEL_API_KEY}:${ENV.EXOTEL_API_TOKEN}`
  ).toString('base64');

  return {
    Authorization: `Basic ${credentials}`,
    'Content-Type': 'application/x-www-form-urlencoded',
    Accept: 'application/json',
  };
}

/**
 * Safely parses and maps Exotel API errors
 */
export function parseExotelError(err: any): ExotelMappedError {
  if (!err) {
    return {
      code: 'EXOTEL_UNKNOWN_ERROR',
      message: 'Unknown Exotel communication error.',
    };
  }

  const responseData = err.response?.data;

  const statusCode =
    err.response?.status ||
    err.statusCode ||
    err.code;

  let apiMessage = '';

  if (responseData) {
    if (typeof responseData === 'object') {
      apiMessage =
        responseData.RestException?.Message ||
        responseData.RestException?.message ||
        responseData.Message ||
        responseData.message ||
        responseData.error ||
        JSON.stringify(responseData);
    } else if (typeof responseData === 'string') {
      apiMessage = responseData;
    }
  }

  const rawMessage = apiMessage || err.message || '';
  const lowerMessage = rawMessage.toLowerCase();

  // 1. Authentication failure
  if (
    statusCode === 401 ||
    statusCode === 403 ||
    lowerMessage.includes('authenticate') ||
    lowerMessage.includes('unauthorized')
  ) {
    return {
      code: 'EXOTEL_AUTH_ERROR',
      message:
        'Exotel Authentication failed: Please verify EXOTEL_ACCOUNT_SID, EXOTEL_API_KEY, and EXOTEL_API_TOKEN in server/.env.',
      statusCode,
    };
  }

  // 2. Insufficient Credits / Account Inactive
  if (
    statusCode === 402 ||
    lowerMessage.includes('insufficient') ||
    lowerMessage.includes('credit') ||
    lowerMessage.includes('balance') ||
    lowerMessage.includes('inactive')
  ) {
    return {
      code: 'EXOTEL_INSUFFICIENT_CREDITS',
      message:
        `Exotel account balance or credit limitation: ${rawMessage || 'Insufficient balance or inactive account.'
        }`,
      statusCode,
    };
  }

  // 3. KYC / Free Trial / Recipient Restriction
  if (
    lowerMessage.includes('trial') ||
    lowerMessage.includes('kyc') ||
    lowerMessage.includes('whitelist') ||
    lowerMessage.includes('unverified') ||
    lowerMessage.includes('not allowed')
  ) {
    return {
      code: 'EXOTEL_TRIAL_OR_KYC_RESTRICTION',
      message:
        `Exotel Free Trial / KYC restriction: ${rawMessage}`,
      statusCode,
    };
  }

  // 4. DLT / Sender ID failure
  if (
    lowerMessage.includes('dlt') ||
    lowerMessage.includes('sender') ||
    lowerMessage.includes('header') ||
    lowerMessage.includes('template')
  ) {
    return {
      code: 'EXOTEL_DLT_RESTRICTION',
      message:
        `Exotel DLT / Sender configuration restriction: ${rawMessage ||
        'The sender or message template is not configured or approved.'
        }`,
      statusCode,
    };
  }

  // 5. Invalid Phone Number Format
  if (
    lowerMessage.includes('invalid phone') ||
    lowerMessage.includes('invalid number') ||
    lowerMessage.includes('invalid recipient') ||
    lowerMessage.includes('phone number')
  ) {
    return {
      code: 'EXOTEL_INVALID_PHONE_FORMAT',
      message: `Exotel invalid phone parameter: ${rawMessage}`,
      statusCode,
    };
  }

  // 6. Rate Limit
  if (statusCode === 429) {
    return {
      code: 'EXOTEL_RATE_LIMIT',
      message:
        'Exotel API rate limit reached. Please retry after a moment.',
      statusCode,
    };
  }

  // 7. Generic Exotel error
  return {
    code: 'EXOTEL_DISPATCH_ERROR',
    message:
      rawMessage ||
      'Exotel dispatch failed with HTTP status ' +
      (statusCode || 'unknown') +
      '.',
    statusCode,
  };
}

/**
 * Returns string representation of friendly error
 */
export function mapExotelError(err: any): string {
  return parseExotelError(err).message;
}

export default {
  isExotelConfigured,
  getExotelAuthHeaders,
  parseExotelError,
  mapExotelError,
};