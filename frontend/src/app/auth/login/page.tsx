'use client';

import { FormEvent, Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError, authApi } from '@/lib/api-client';
import { CURRENT_NOTICE_VERSION, PRIVACY_PATH, TERMS_PATH } from '@/lib/legal';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPrivacyAccepted, setSignupPrivacyAccepted] = useState(false);
  const [signupTermsAccepted, setSignupTermsAccepted] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [signupError, setSignupError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  const providerError = searchParams.get('error');
  const redirect = searchParams.get('redirect') ?? undefined;
  const socialNext = useMemo(() => '/for-talent/apply', []);

  async function handleLoginSubmit(event: FormEvent) {
    event.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const response = await login(loginEmail, loginPassword, redirect);
      router.push(response.nextPath || '/dashboard');
    } catch (error) {
      if (error instanceof ApiError) {
        const body = error.body as { message?: string | string[] };
        const message = Array.isArray(body?.message) ? body.message[0] : body?.message;
        setLoginError(message || 'Sign in failed. Please try again.');
      } else {
        setLoginError('Sign in failed. Please try again.');
      }
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleTalentSignup(event: FormEvent) {
    event.preventDefault();
    setSignupError('');
    setSignupLoading(true);

    if (!signupPrivacyAccepted || !signupTermsAccepted) {
      setSignupError('Please accept the privacy notice and terms before creating an account.');
      setSignupLoading(false);
      return;
    }

    try {
      await authApi.signupTalent({
        name: signupName,
        email: signupEmail,
        password: signupPassword,
        privacyAccepted: signupPrivacyAccepted,
        termsAccepted: signupTermsAccepted,
        noticeVersion: CURRENT_NOTICE_VERSION,
      });
      router.push(
        `/auth/verify-email?sent=1&email=${encodeURIComponent(signupEmail)}&next=${encodeURIComponent('/for-talent/apply')}`,
      );
    } catch (error) {
      if (error instanceof ApiError) {
        const body = error.body as { message?: string | string[] };
        const message = Array.isArray(body?.message) ? body.message[0] : body?.message;
        setSignupError(message || 'Talent signup failed. Please try again.');
      } else {
        setSignupError('Talent signup failed. Please try again.');
      }
    } finally {
      setSignupLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.leftContent}>
          <Link href="/" className={styles.logoLink}>
            <span className={styles.logoText}>BridgeScale</span>
          </Link>
          <h1 className={styles.heroTitle}>
            Fractional Diaspora
            <br />
            Senior Talent
          </h1>
          <p className={styles.heroSubtitle}>
            BridgeScale pairs Indian companies with vetted diaspora commercial operators and gives talent a structured path into paid, governed engagements.
          </p>
          <div className={styles.pillRow}>
            <span className="badge badge-amber">Company Verification</span>
            <span className="badge badge-violet">Talent Onboarding</span>
            <span className="badge badge-teal">Platform Sessions</span>
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Talent access</h2>
            <p className={styles.formSubtitle}>Use social login or create a fallback email account.</p>
          </div>

          {providerError && (
            <div className={styles.errorBox} role="alert">
              {providerError}
            </div>
          )}

          <div className={styles.registerLinks}>
            <a className="btn btn-secondary" style={{ flex: 1 }} href={authApi.oauthStartUrl('google', socialNext)}>
              Continue with Google
            </a>
            <a className="btn btn-secondary" style={{ flex: 1 }} href={authApi.oauthStartUrl('microsoft', socialNext)}>
              Continue with Microsoft
            </a>
            <a className="btn btn-secondary" style={{ flex: 1 }} href={authApi.oauthStartUrl('apple', socialNext)}>
              Continue with Apple
            </a>
          </div>

          <div className={styles.divider}>
            <span>Talent fallback</span>
          </div>

          <form onSubmit={handleTalentSignup} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="signup-name" className={styles.label}>Full name</label>
              <input
                id="signup-name"
                type="text"
                required
                value={signupName}
                onChange={(event) => setSignupName(event.target.value)}
                className={styles.input}
                placeholder="Priya Sharma"
                disabled={signupLoading}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="signup-email" className={styles.label}>Email address</label>
              <input
                id="signup-email"
                type="email"
                required
                value={signupEmail}
                onChange={(event) => setSignupEmail(event.target.value)}
                className={styles.input}
                placeholder="priya@example.com"
                disabled={signupLoading}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="signup-password" className={styles.label}>Password</label>
              <input
                id="signup-password"
                type="password"
                required
                minLength={8}
                value={signupPassword}
                onChange={(event) => setSignupPassword(event.target.value)}
                className={styles.input}
                placeholder="At least 8 characters"
                disabled={signupLoading}
              />
            </div>

            <p className={styles.formSubtitle}>
              We use your account details to create and secure your profile. Talent applications
              later use AI-assisted evaluation, and references may be checked during review.
            </p>

            <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <input
                type="checkbox"
                checked={signupPrivacyAccepted}
                onChange={(event) => setSignupPrivacyAccepted(event.target.checked)}
                disabled={signupLoading}
              />
              <span>
                I have read the <Link href={PRIVACY_PATH}>Privacy Notice</Link>.
              </span>
            </label>

            <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <input
                type="checkbox"
                checked={signupTermsAccepted}
                onChange={(event) => setSignupTermsAccepted(event.target.checked)}
                disabled={signupLoading}
              />
              <span>
                I agree to the <Link href={TERMS_PATH}>Terms of Use</Link>.
              </span>
            </label>

            {signupError && (
              <div className={styles.errorBox} role="alert">
                {signupError}
              </div>
            )}

            <button type="submit" className={`btn btn-secondary ${styles.submitBtn}`} disabled={signupLoading}>
              {signupLoading ? 'Creating talent account...' : 'Create talent account'}
            </button>
          </form>

          <div className={styles.divider}>
            <span>Companies and existing users</span>
          </div>

          <form onSubmit={handleLoginSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>Email address</label>
              <input
                id="email"
                type="email"
                required
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                className={styles.input}
                placeholder="you@example.com"
                disabled={loginLoading}
              />
            </div>

            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label htmlFor="password" className={styles.label}>Password</label>
                <Link href="/auth/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
              </div>
              <input
                id="password"
                type="password"
                required
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                className={styles.input}
                placeholder="Enter your password"
                disabled={loginLoading}
              />
            </div>

            {loginError && (
              <div className={styles.errorBox} role="alert">
                {loginError}
              </div>
            )}

            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loginLoading}>
              {loginLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className={styles.divider}>
            <span>Need an account?</span>
          </div>

          <div className={styles.registerLinks}>
            <Link href="/for-companies/apply" className="btn btn-secondary" style={{ flex: 1 }}>
              Apply as Company
            </Link>
            <Link href="/for-talent/apply" className="btn btn-secondary" style={{ flex: 1 }}>
              Apply as Talent
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
      <LoginContent />
    </Suspense>
  );
}
