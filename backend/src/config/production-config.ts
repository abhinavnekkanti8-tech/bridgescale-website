const PLACEHOLDER_SECRET_PATTERNS = [
  'changeme',
  'change-me',
  'change_in_production',
  'change-in-production',
  'placeholder',
  'default',
  'dev-secret',
  'dummy',
];

function isPlaceholderLike(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (normalized.length < 16) {
    return true;
  }

  return PLACEHOLDER_SECRET_PATTERNS.some((pattern) => normalized.includes(pattern));
}

export function validateProductionConfig(env: NodeJS.ProcessEnv): void {
  if (env.NODE_ENV !== 'production') {
    return;
  }

  const sessionSecret = env.SESSION_SECRET?.trim() ?? '';
  if (!sessionSecret || isPlaceholderLike(sessionSecret)) {
    throw new Error(
      'Invalid production configuration: SESSION_SECRET must be set to a non-placeholder value.',
    );
  }

  if ((env.DUMMY_PAYMENT_MODE ?? 'true').trim().toLowerCase() === 'true') {
    throw new Error(
      'Invalid production configuration: DUMMY_PAYMENT_MODE must be false in production.',
    );
  }

  const stripeWebhookSecret = env.STRIPE_WEBHOOK_SECRET?.trim() ?? '';
  if (!stripeWebhookSecret) {
    throw new Error(
      'Invalid production configuration: STRIPE_WEBHOOK_SECRET is required in production.',
    );
  }

  const stripeSecretKey = env.STRIPE_SECRET_KEY?.trim() ?? '';
  if (!stripeSecretKey) {
    throw new Error(
      'Invalid production configuration: STRIPE_SECRET_KEY is required in production.',
    );
  }
}
