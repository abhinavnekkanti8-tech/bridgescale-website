'use client';

import { FormEvent, Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError, authApi } from '@/lib/api-client';

export const dynamic = 'force-dynamic';

function VerifyEmailContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { refreshSession } = useAuth();

  const token = params.get('token');
  const emailFromQuery = params.get('email') ?? '';
  const sent = params.get('sent') === '1';
  const defaultNext = useMemo(() => params.get('next') ?? '/dashboard', [params]);

  const [email, setEmail] = useState(emailFromQuery);
  const [message, setMessage] = useState(sent ? 'Verification email sent. Check your inbox to continue.' : '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(Boolean(token));
  const [resending, setResending] = useState(false);
  const [nextPath, setNextPath] = useState(defaultNext);

  useEffect(() => {
    async function confirm() {
      if (!token) {
        return;
      }

      try {
        const response = await authApi.verifyEmail(token);
        await refreshSession();
        setMessage(response.message);
        setNextPath(response.nextPath || defaultNext);
      } catch (error) {
        if (error instanceof ApiError) {
          const body = error.body as { message?: string | string[] };
          const message = Array.isArray(body?.message) ? body.message[0] : body?.message;
          setError(message || 'Verification failed.');
        } else {
          setError('Verification failed.');
        }
      } finally {
        setLoading(false);
      }
    }

    confirm();
  }, [defaultNext, refreshSession, token]);

  async function handleResend(event: FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');
    setResending(true);

    try {
      const response = await authApi.resendVerification(email);
      setMessage(response.message);
    } catch (error) {
      if (error instanceof ApiError) {
        const body = error.body as { message?: string | string[] };
        const message = Array.isArray(body?.message) ? body.message[0] : body?.message;
        setError(message || 'Unable to resend verification email.');
      } else {
        setError('Unable to resend verification email.');
      }
    } finally {
      setResending(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg, #0a0a0a)', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 520, border: '1px solid var(--color-border, #2a2a2a)', padding: 40 }}>
        <h1 style={{ color: '#f5f3ef', marginBottom: 12 }}>Verify your email</h1>
        <p style={{ color: '#b4aea5', lineHeight: 1.7, marginBottom: 24 }}>
          Company accounts and email-based talent accounts need email verification before the session can continue.
        </p>

        {loading && <p style={{ color: '#d7d2ca' }}>Verifying your email...</p>}
        {!loading && message && <p style={{ color: '#d7d2ca', lineHeight: 1.7 }}>{message}</p>}
        {!loading && error && <p style={{ color: '#ffb4a8', lineHeight: 1.7 }}>{error}</p>}

        {!loading && token && !error && (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
            <button
              type="button"
              onClick={() => router.push(nextPath)}
              style={{ padding: '12px 18px', background: '#d7a65a', border: 0, cursor: 'pointer' }}
            >
              Continue
            </button>
            <Link href="/dashboard" style={{ color: '#d7a65a', alignSelf: 'center', textDecoration: 'none' }}>
              Open dashboard
            </Link>
          </div>
        )}

        {!token && (
          <form onSubmit={handleResend} style={{ display: 'grid', gap: 16, marginTop: 24 }}>
            <label style={{ display: 'grid', gap: 8, color: '#d7d2ca' }}>
              Email address
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                style={{ padding: 12, background: 'transparent', border: '1px solid #3a352f', color: '#f5f3ef' }}
              />
            </label>

            <button
              type="submit"
              disabled={resending}
              style={{ padding: '12px 18px', background: '#d7a65a', border: 0, cursor: 'pointer' }}
            >
              {resending ? 'Sending...' : 'Resend verification email'}
            </button>
          </form>
        )}

        <div style={{ marginTop: 24 }}>
          <Link href="/auth/login" style={{ color: '#d7a65a', textDecoration: 'none' }}>
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--color-bg, #0a0a0a)' }} />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
