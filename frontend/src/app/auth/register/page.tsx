'use client';

import { FormEvent, Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ApiError, operatorsApi } from '@/lib/api-client';

export const dynamic = 'force-dynamic';

function InviteRegisterContent() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') ?? '';

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError('Missing invite token.');
      return;
    }

    setLoading(true);
    try {
      await operatorsApi.acceptInvite({ token, name, password });
      setMessage('Invite accepted. You can now sign in with your email and password.');
      setTimeout(() => router.push('/auth/login'), 1200);
    } catch (error) {
      if (error instanceof ApiError) {
        const body = error.body as { message?: string | string[] };
        const message = Array.isArray(body?.message) ? body.message[0] : body?.message;
        setError(message || 'Unable to accept invite.');
      } else {
        setError('Unable to accept invite.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg, #0a0a0a)', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 480, border: '1px solid var(--color-border, #2a2a2a)', padding: 40 }}>
        <h1 style={{ color: '#f5f3ef', marginBottom: 12 }}>Accept invite</h1>
        <p style={{ color: '#b4aea5', lineHeight: 1.7, marginBottom: 24 }}>
          This page only handles invited operator accounts. Public signup now lives in the company and talent flows.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
          <label style={{ display: 'grid', gap: 8, color: '#d7d2ca' }}>
            Full name
            <input
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              style={{ padding: 12, background: 'transparent', border: '1px solid #3a352f', color: '#f5f3ef' }}
            />
          </label>

          <label style={{ display: 'grid', gap: 8, color: '#d7d2ca' }}>
            Password
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              style={{ padding: 12, background: 'transparent', border: '1px solid #3a352f', color: '#f5f3ef' }}
            />
          </label>

          {message && <p style={{ color: '#d7d2ca', lineHeight: 1.7 }}>{message}</p>}
          {error && <p style={{ color: '#ffb4a8', lineHeight: 1.7 }}>{error}</p>}

          <button type="submit" disabled={loading} style={{ padding: '12px 18px', background: '#d7a65a', border: 0, cursor: 'pointer' }}>
            {loading ? 'Accepting...' : 'Accept invite'}
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

export default function InviteRegisterPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--color-bg, #0a0a0a)' }} />}>
      <InviteRegisterContent />
    </Suspense>
  );
}
