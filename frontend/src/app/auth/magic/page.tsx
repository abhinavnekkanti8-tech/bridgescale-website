'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type Phase = 'verifying' | 'success' | 'error';

export default function MagicLoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--color-bg, #0a0a0a)' }} />}>
      <MagicLoginContent />
    </Suspense>
  );
}

function MagicLoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [phase, setPhase] = useState<Phase>('verifying');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setPhase('error');
      setErrorMsg('No login token found. Please use the link from your email.');
      return;
    }

    fetch('/api/v1/auth/magic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || 'Login failed. The link may have expired.');
        }
        setPhase('success');
        // Redirect to dashboard after short delay
        setTimeout(() => router.push('/dashboard'), 1200);
      })
      .catch((err: Error) => {
        setPhase('error');
        setErrorMsg(err.message || 'An unexpected error occurred.');
      });
  }, [params, router]);

  const styles: Record<string, React.CSSProperties> = {
    page: {
      minHeight: '100vh',
      background: 'var(--color-bg, #0a0a0a)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-body, sans-serif)',
    },
    card: {
      maxWidth: '420px',
      width: '100%',
      padding: '56px 48px',
      border: '1px solid var(--color-border, #2a2a2a)',
      textAlign: 'center' as const,
    },
    icon: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 24px',
      fontSize: '1.4rem',
      border: '1.5px solid',
    },
    title: {
      fontFamily: 'var(--font-serif, serif)',
      fontSize: '1.4rem',
      fontWeight: 700,
      marginBottom: '12px',
      color: 'var(--color-text-primary, #f5f3ef)',
    },
    body: {
      fontSize: '0.875rem',
      color: 'var(--color-text-secondary, #6b6b6b)',
      lineHeight: 1.7,
      fontWeight: 300,
    },
    retryLink: {
      display: 'inline-block',
      marginTop: '24px',
      fontSize: '13px',
      color: 'var(--color-accent, #9e7f5a)',
      textDecoration: 'none',
      cursor: 'pointer',
      background: 'none',
      border: 'none',
      fontFamily: 'inherit',
    },
  };

  if (phase === 'verifying') {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={{ ...styles.icon, borderColor: 'var(--color-text-muted, #4a4a4a)', color: 'var(--color-text-muted, #4a4a4a)' }}>
            ↻
          </div>
          <div style={styles.title}>Verifying your link…</div>
          <p style={styles.body}>This will only take a moment.</p>
        </div>
      </div>
    );
  }

  if (phase === 'success') {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={{ ...styles.icon, borderColor: 'var(--color-accent, #9e7f5a)', color: 'var(--color-accent, #9e7f5a)' }}>
            ✓
          </div>
          <div style={styles.title}>Logged in</div>
          <p style={styles.body}>Taking you to your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={{ ...styles.icon, borderColor: '#c0392b', color: '#c0392b' }}>
          ✕
        </div>
        <div style={styles.title}>Login failed</div>
        <p style={styles.body}>{errorMsg}</p>
        <button
          style={styles.retryLink}
          onClick={() => router.push('/')}
        >
          Return to home →
        </button>
      </div>
    </div>
  );
}
