import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.cwd(), 'src');

function read(relativePath) {
  const absolutePath = resolve(root, relativePath);
  assert.ok(existsSync(absolutePath), `Expected file to exist: ${relativePath}`);
  return readFileSync(absolutePath, 'utf8');
}

function expectIncludes(file, content, snippets) {
  for (const snippet of snippets) {
    assert.ok(
      content.includes(snippet),
      `Expected ${file} to include: ${snippet}`,
    );
  }
}

const privacyPage = read('app/privacy/page.tsx');
expectIncludes('app/privacy/page.tsx', privacyPage, [
  'Resend',
  'Stripe',
  'Razorpay',
  'OpenAI',
  'Reference notices',
]);

const termsPage = read('app/terms/page.tsx');
expectIncludes('app/terms/page.tsx', termsPage, [
  'third-party processors',
  'reference details',
]);

const companyApply = read('app/for-companies/apply/page.tsx');
expectIncludes('app/for-companies/apply/page.tsx', companyApply, [
  'PRIVACY_PATH',
  'TERMS_PATH',
  'privacyAccepted',
  'termsAccepted',
  'Please accept the privacy notice and terms before submitting.',
  'AI-assisted diagnosis and matching outputs',
]);

const talentApply = read('app/for-talent/apply/page.tsx');
expectIncludes('app/for-talent/apply/page.tsx', talentApply, [
  'PRIVACY_PATH',
  'TERMS_PATH',
  'signupPrivacyAccepted',
  'signupTermsAccepted',
  'privacyAccepted',
  'termsAccepted',
  'Please accept the privacy notice and terms before creating an account.',
  'Please accept the privacy notice and terms before submitting.',
  'AI-assisted evaluation',
  'references may be checked',
]);

const loginPage = read('app/auth/login/page.tsx');
expectIncludes('app/auth/login/page.tsx', loginPage, [
  'PRIVACY_PATH',
  'TERMS_PATH',
  'signupPrivacyAccepted',
  'signupTermsAccepted',
  'Please accept the privacy notice and terms before creating an account.',
  'AI-assisted evaluation',
]);

const legalConstants = read('lib/legal.ts');
expectIncludes('lib/legal.ts', legalConstants, [
  "export const CURRENT_NOTICE_VERSION = '2026-04-26';",
  "export const PRIVACY_PATH = '/privacy';",
  "export const TERMS_PATH = '/terms';",
]);

console.log('Legal consent smoke checks passed.');
