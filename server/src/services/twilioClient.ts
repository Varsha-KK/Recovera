import twilio from 'twilio';
import { ENV } from '../config/env.js';

let cachedClient: twilio.Twilio | null = null;

export interface TwilioMappedError {
  code: string;
  message: string;
  twilioErrorCode?: number | string;
}

/**
 * Checks whether Twilio is properly configured with required credentials
 */
export function isTwilioConfigured(): boolean {
  return Boolean(
    ENV.TWILIO_ACCOUNT_SID &&
    ENV.TWILIO_API_KEY_SID &&
    ENV.TWILIO_API_KEY_SECRET &&
    ENV.TWILIO_PHONE_NUMBER &&
    !ENV.TWILIO_ACCOUNT_SID.startsWith('AC000000')
  );
}

/**
 * Returns a standardized Twilio SDK client instance using API Key authentication
 */
export function getTwilioClient(): twilio.Twilio {
  if (!isTwilioConfigured()) {
    throw new Error(
      'Twilio credentials not configured. Please ensure TWILIO_ACCOUNT_SID, TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, and TWILIO_PHONE_NUMBER are set.'
    );
  }

  if (!cachedClient) {
    cachedClient = twilio(
      ENV.TWILIO_API_KEY_SID,
      ENV.TWILIO_API_KEY_SECRET,
      {
        accountSid: ENV.TWILIO_ACCOUNT_SID,
      }
    );
  }

  return cachedClient;
}

/**
 * Safely parses and maps Twilio API and carrier errors into standardized diagnostic error objects
 */
export function parseTwilioError(err: any): TwilioMappedError {
  if (!err) {
    return {
      code: 'TWILIO_UNKNOWN_ERROR',
      message: 'Unknown Twilio communication error.',
    };
  }

  const rawMessage = err.message || '';
  const twilioCode = err.code || err.status;

  // 1. Missing Voice Calls Create Permission on Restricted API Key
  if (
    rawMessage.includes('twilio/voice/calls/create') ||
    (rawMessage.includes('permission') && rawMessage.includes('calls/create'))
  ) {
    return {
      code: 'TWILIO_VOICE_PERMISSION_MISSING',
      message: 'The Twilio API key does not have permission to create Voice calls.',
      twilioErrorCode: twilioCode,
    };
  }

  // 2. Unverified / Trial Recipient Limitation
  if (
    twilioCode === 21608 ||
    twilioCode === 21614 ||
    rawMessage.includes('unverified') ||
    rawMessage.includes('Trial') ||
    rawMessage.includes('not eligible')
  ) {
    return {
      code: 'TWILIO_TRIAL_RECIPIENT_RESTRICTION',
      message: 'SMS could not be sent because this recipient is not verified on the current Twilio Trial account.',
      twilioErrorCode: twilioCode,
    };
  }

  // 3. Invalid phone number format
  if (twilioCode === 21211) {
    return {
      code: 'TWILIO_INVALID_PHONE_FORMAT',
      message: 'Invalid recipient phone number format. Please ensure the number is in valid E.164 format (e.g. +919844328475).',
      twilioErrorCode: twilioCode,
    };
  }

  // 4. Geo-permissions
  if (twilioCode === 21408) {
    return {
      code: 'TWILIO_GEO_PERMISSIONS_RESTRICTION',
      message: 'Twilio Geo-permissions restriction: SMS/Voice permission for this country or region is not enabled in your Twilio Console.',
      twilioErrorCode: twilioCode,
    };
  }

  // 5. Authentication / Permission Error
  if (twilioCode === 20003) {
    if (rawMessage.includes('permission')) {
      return {
        code: 'TWILIO_VOICE_PERMISSION_MISSING',
        message: 'The Twilio API key does not have permission to create Voice calls.',
        twilioErrorCode: twilioCode,
      };
    }
    return {
      code: 'TWILIO_AUTH_ERROR',
      message: 'Twilio Authentication failed: Invalid Account SID or API Key credentials.',
      twilioErrorCode: twilioCode,
    };
  }

  return {
    code: 'TWILIO_DISPATCH_ERROR',
    message: rawMessage || `Twilio dispatch failed with status code ${twilioCode}.`,
    twilioErrorCode: twilioCode,
  };
}

/**
 * Returns string representation of friendly error
 */
export function mapTwilioError(err: any): string {
  return parseTwilioError(err).message;
}

export default {
  isTwilioConfigured,
  getTwilioClient,
  parseTwilioError,
  mapTwilioError,
};
