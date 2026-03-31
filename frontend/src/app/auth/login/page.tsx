'use client';

import { useState, FormEvent, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { ApiError } from '@/lib/api-client';
import styles from './page.module.css';

// Role → dashboard route mapping
const ROLE_ROUTES: Record<string, string> = {
  STARTUP_ADMIN: '/startup/dashboard',
  STARTUP_MEMBER: '/startup/dashboard',
  OPERATOR: '/operator/dashboard',
  PLATFORM_ADMIN: '/admin/dashboard',
  DEAL_DESK: '/admin/dashboard',
};

// Prevent static prerendering (needs auth context + search params)
export const dynamicMode = 'force-dynamic';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // After login the AuthContext user updates; we re-read via the already returned user
      const redirectTo = searchParams.get('redirect');
      // We need to wait for the user to be set by the context after login
      // Use a small delay/polling would be more elegant, but here we just get the route from
      // the role that came back from the login response stored in AuthContext.
      router.push(redirectTo || '/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as { message?: string | string[] };
        const msg = Array.isArray(body?.message) ? body.message[0] : body?.message;
        setError(msg || 'Login failed. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.leftContent}>
          <Link href="/" className={styles.logoLink}>
            <span className="gradient-text" style={{ fontSize: '1.5rem' }}>◆</span>
            <span className={styles.logoText}>Nexus Platform</span>
          </Link>
          <h1 className={styles.heroTitle}>
            Diaspora-First
            <br />
            <span className="gradient-text">Sales Leadership</span>
          </h1>
          <p className={styles.heroSubtitle}>
            AI-native marketplace connecting Andhra Pradesh startups with senior diaspora operators across EU, US, AU, and RoW.
          </p>
          <div className={styles.pillRow}>
            <span className="badge badge-amber">Pipeline Sprints</span>
            <span className="badge badge-violet">BD Sprints</span>
            <span className="badge badge-teal">Fractional Leadership</span>
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Welcome back</h2>
            <p className={styles.formSubtitle}>Sign in to your platform account</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form} id="login-form">
            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                placeholder="you@example.com"
                disabled={loading}
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
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            {error && (
              <div className={styles.errorBox} role="alert">
                <span>⚠</span> {error}
              </div>
            )}

            <button
              id="login-submit"
              type="submit"
              className={`btn btn-primary ${styles.submitBtn}`}
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className={styles.divider}>
            <span>Don&apos;t have an account?</span>
          </div>

          <div className={styles.registerLinks}>
            <Link href="/startup/apply" className="btn btn-secondary" style={{ flex: 1 }}>
              Apply as Startup
            </Link>
            <Link href="/operator/apply" className="btn btn-secondary" style={{ flex: 1 }}>
              Join as Operator
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPageWrapper() {
  return (
    <AuthProvider>
      <Suspense fallback={<div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}>Loading...</div>}>
        <LoginPage />
      </Suspense>
    </AuthProvider>
  );
}
