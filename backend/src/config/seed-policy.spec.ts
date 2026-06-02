import { resolveSeedPolicy } from './seed-policy';

describe('resolveSeedPolicy', () => {
  it('allows local development with demo users by default', () => {
    expect(resolveSeedPolicy({ nodeEnv: 'development' })).toEqual(
      expect.objectContaining({
        includeDemoUsers: true,
        requireExplicitCredentials: false,
      }),
    );
  });

  it('blocks non-local seeding without an explicit override', () => {
    expect(() => resolveSeedPolicy({ nodeEnv: 'production' })).toThrow(
      'Seeding is restricted to local/dev/test environments unless ALLOW_NON_DEV_SEED=true.',
    );
  });

  it('allows non-local seeding when explicitly enabled and disables demo users by default', () => {
    expect(
      resolveSeedPolicy({
        nodeEnv: 'production',
        allowNonDevSeed: 'true',
      }),
    ).toEqual(
      expect.objectContaining({
        includeDemoUsers: false,
        requireExplicitCredentials: true,
      }),
    );
  });
});
