import { validateProductionConfig } from './production-config';

describe('validateProductionConfig', () => {
  it('does not throw outside production', () => {
    expect(() =>
      validateProductionConfig({
        NODE_ENV: 'development',
      } as NodeJS.ProcessEnv),
    ).not.toThrow();
  });

  it('throws for placeholder session secrets in production', () => {
    expect(() =>
      validateProductionConfig({
        NODE_ENV: 'production',
        SESSION_SECRET: 'dev-secret-change-in-production',
        DUMMY_PAYMENT_MODE: 'false',
        STRIPE_WEBHOOK_SECRET: 'whsec_valid_secret_value_12345',
        STRIPE_SECRET_KEY: 'sk_live_valid_secret_value_12345',
      } as NodeJS.ProcessEnv),
    ).toThrow(/SESSION_SECRET/);
  });

  it('throws when dummy payment mode is enabled in production', () => {
    expect(() =>
      validateProductionConfig({
        NODE_ENV: 'production',
        SESSION_SECRET: 'super-secure-session-secret-12345',
        DUMMY_PAYMENT_MODE: 'true',
        STRIPE_WEBHOOK_SECRET: 'whsec_valid_secret_value_12345',
        STRIPE_SECRET_KEY: 'sk_live_valid_secret_value_12345',
      } as NodeJS.ProcessEnv),
    ).toThrow(/DUMMY_PAYMENT_MODE/);
  });

  it('throws when the stripe webhook secret is missing in production', () => {
    expect(() =>
      validateProductionConfig({
        NODE_ENV: 'production',
        SESSION_SECRET: 'super-secure-session-secret-12345',
        DUMMY_PAYMENT_MODE: 'false',
        STRIPE_SECRET_KEY: 'sk_live_valid_secret_value_12345',
      } as NodeJS.ProcessEnv),
    ).toThrow(/STRIPE_WEBHOOK_SECRET/);
  });

  it('accepts a valid production configuration', () => {
    expect(() =>
      validateProductionConfig({
        NODE_ENV: 'production',
        SESSION_SECRET: 'super-secure-session-secret-12345',
        DUMMY_PAYMENT_MODE: 'false',
        STRIPE_WEBHOOK_SECRET: 'whsec_valid_secret_value_12345',
        STRIPE_SECRET_KEY: 'sk_live_valid_secret_value_12345',
      } as NodeJS.ProcessEnv),
    ).not.toThrow();
  });
});
