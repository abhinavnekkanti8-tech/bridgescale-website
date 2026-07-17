import { BadRequestException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Shared Stripe webhook signature verification.
 *
 * Verifies the `Stripe-Signature` header against the raw request body using the
 * configured signing secret, enforcing a 5-minute timestamp tolerance and a
 * constant-time signature comparison, then parses the JSON payload.
 *
 * Used by every Stripe-facing webhook so signature handling lives in exactly
 * one place.
 */

const SIGNATURE_TOLERANCE_SECONDS = 300;

export type StripeWebhookEvent = {
  type: string;
  id?: string;
  data?: { object?: Record<string, any> };
};

export function verifyAndParseStripeWebhook(
  rawBody: string,
  signatureHeader: string,
  secret: string,
): StripeWebhookEvent {
  const trimmedSecret = (secret ?? '').trim();
  if (!trimmedSecret) {
    throw new BadRequestException('Stripe webhook secret is not configured.');
  }

  if (!rawBody) {
    throw new BadRequestException('Missing Stripe webhook payload.');
  }

  if (!signatureHeader) {
    throw new BadRequestException('Missing Stripe signature.');
  }

  const parsed = parseStripeSignature(signatureHeader);
  if (!parsed.timestamp || parsed.signatures.length === 0) {
    throw new BadRequestException('Malformed Stripe signature header.');
  }

  const timestampAgeSeconds = Math.abs(
    Math.floor(Date.now() / 1000) - parsed.timestamp,
  );
  if (timestampAgeSeconds > SIGNATURE_TOLERANCE_SECONDS) {
    throw new BadRequestException(
      'Stripe signature timestamp is outside the allowed tolerance.',
    );
  }

  const expectedSignature = createHmac('sha256', trimmedSecret)
    .update(`${parsed.timestamp}.${rawBody}`, 'utf8')
    .digest('hex');

  const hasMatch = parsed.signatures.some((candidate) =>
    safeCompareSignature(candidate, expectedSignature),
  );

  if (!hasMatch) {
    throw new BadRequestException('Invalid Stripe signature.');
  }

  try {
    return JSON.parse(rawBody) as StripeWebhookEvent;
  } catch {
    throw new BadRequestException('Malformed Stripe webhook payload.');
  }
}

function parseStripeSignature(signatureHeader: string): {
  timestamp: number | null;
  signatures: string[];
} {
  const parts = signatureHeader
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  let timestamp: number | null = null;
  const signatures: string[] = [];

  for (const part of parts) {
    const [key, value] = part.split('=');
    if (!key || !value) {
      continue;
    }

    if (key === 't') {
      const parsedValue = Number(value);
      if (Number.isFinite(parsedValue)) {
        timestamp = parsedValue;
      }
    }

    if (key === 'v1') {
      signatures.push(value);
    }
  }

  return { timestamp, signatures };
}

function safeCompareSignature(candidate: string, expected: string): boolean {
  const candidateBuffer = Buffer.from(candidate, 'utf8');
  const expectedBuffer = Buffer.from(expected, 'utf8');

  if (candidateBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(candidateBuffer, expectedBuffer);
}
