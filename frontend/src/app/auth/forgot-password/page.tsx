'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ApiError, authApi } from '@/lib/api-client';

export const dynamic = 'force-dynamic';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await authApi.forgotPassword(email);
      setMessage(response.message);
    } catch (error) {
      if (error instanceof ApiError) {
        const body = error.body as { message?: string | string[] };
        const message = Array.isArray(body?.message) ? body.message[0] : body?.message;
        setError(message || 'Unable to start password reset.');
      } else {
        setError('Unable to start password reset.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg, #0a0a0a)', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 480, border: '1px solid var(--color-border, #2a2a2a)', padding: 40 }}>
        <h1 style={{ color: '#f5f3ef', marginBottom: 12 }}>Forgot password</h1>
        <p style={{ color: '#b4aea5', lineHeight: 1.7, marginBottom: 24 }}>
          Enter your email address and we&apos;ll send you a reset link if a verified password account exists.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
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

          {message && <p style={{ color: '#d7d2ca', lineHeight: 1.7 }}>{message}</p>}
          {error && <p style={{ color: '#ffb4a8', lineHeight: 1.7 }}>{error}</p>}

          <button type="submit" disabled={loading} style={{ padding: '12px 18px', background: '#d7a65a', border: 0, cursor: 'pointer' }}>
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <div style={{ marginTop: 24 }}>
          <Link href="/auth/login" style={{ color: '#d7a65a', textDecoration: 'none' }}>
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
