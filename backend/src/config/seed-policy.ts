type SeedPolicyInput = {
  nodeEnv?: string;
  allowNonDevSeed?: string;
  includeDemoUsers?: string;
};

export function resolveSeedPolicy(input: SeedPolicyInput) {
  const nodeEnv = (input.nodeEnv ?? 'development').toLowerCase();
  const isLocalLike = ['development', 'dev', 'test', 'local'].includes(nodeEnv);
  const allowNonDevSeed = input.allowNonDevSeed === 'true';

  if (!isLocalLike && !allowNonDevSeed) {
    throw new Error(
      'Seeding is restricted to local/dev/test environments unless ALLOW_NON_DEV_SEED=true.',
    );
  }

  return {
    nodeEnv,
    includeDemoUsers:
      input.includeDemoUsers != null ? input.includeDemoUsers === 'true' : isLocalLike,
    requireExplicitCredentials: !isLocalLike,
  };
}
