/**
 * Jest setup file: set test-safe environment variables before any test runs.
 *
 * This runs before the test framework is installed (Jest setupFiles), so
 * environment variables are available in module constructors.
 * Existing process.env values win — CI can override by setting env vars
 * directly without editing this file.
 *
 * Key variables controlled here:
 *
 *   DUMMY_AI_MODE=true
 *     Forces AiService into mock mode for ALL AI features:
 *       - generateOpportunityBrief  → mockOpportunityBrief()
 *       - generateTalentPreScreen   → mockTalentPreScreen()
 *       - generateNeedsDiagnosis    → mockNeedDiagnosis()
 *       - scoreStartupReadiness     → buildMockResponse()
 *
 *   DUMMY_PAYMENT_MODE=true
 *     Skips real Razorpay/Stripe calls in payment flows.
 *
 *   CROSS_VERIFY_MODE=dummy
 *     Uses deterministic stubs instead of Hunter.io/LinkedIn APIs.
 *
 * To run tests against a REAL OpenAI key:
 *   DUMMY_AI_MODE=false OPENAI_API_KEY=sk-... npm test
 */

function setIfAbsent(key: string, value: string): void {
  if (!process.env[key]) process.env[key] = value;
}

setIfAbsent('DUMMY_AI_MODE', 'true');
setIfAbsent('DUMMY_PAYMENT_MODE', 'true');
setIfAbsent('CROSS_VERIFY_MODE', 'dummy');
setIfAbsent('OPENAI_API_KEY', 'sk-dummy-test-key');
setIfAbsent('SESSION_SECRET', 'test-session-secret');
setIfAbsent('DATABASE_URL', 'postgresql://test:test@localhost:5432/platform_test');
