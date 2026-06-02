'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export const dynamic = 'force-dynamic';

type ApplicationData = {
  id: string;
  type: 'COMPANY' | 'TALENT';
  status: string;
  name: string;
  email: string;
  companyName?: string | null;
  currentRole?: string | null;
  createdAt: string;
  paidAt: string | null;
  feeCurrency?: string | null;
  feeAmountMinor?: number | null;
  paymentProvider?: string | null;
};

const STATUS_COPY: Record<string, { title: string; body: string; color: string }> = {
  EMAIL_VERIFICATION_PENDING: {
    title: 'Verify your email',
    body: 'Your application is saved, but we are waiting for email verification before the review process begins.',
    color: '#9e7f5a',
  },
  SUBMITTED: {
    title: 'Application received',
    body: 'Your application is in review. We will update you as soon as the team finishes the next step.',
    color: '#2e7d52',
  },
  AWAITING_COMPLETION: {
    title: 'Additional details needed',
    body: 'Your application is saved, but we still need the remaining onboarding steps before review can begin.',
    color: '#9e7f5a',
  },
  DIAGNOSIS_GENERATED: {
    title: 'Diagnosis ready',
    body: 'Your diagnosis is ready for review in the platform.',
    color: '#7E93B5',
  },
  DIAGNOSIS_APPROVED: {
    title: 'Diagnosis approved',
    body: 'We are moving from diagnosis into matching.',
    color: '#2e7d52',
  },
  APPROVED: {
    title: 'Application approved',
    body: 'Your application has been approved. You can continue in your dashboard.',
    color: '#2e7d52',
  },
  REJECTED: {
    title: 'Application not accepted',
    body: 'After review, we are unable to accept your application at this time.',
    color: '#c0392b',
  },
};

function formatFee(amount: number | null | undefined, currency: string | null | undefined) {
  if (!amount || !currency) {
    return '';
  }

  if (currency === 'INR') {
    return `INR ${(amount / 100).toLocaleString('en-IN')}`;
  }

  if (currency === 'USD') {
    return `$${(amount / 100).toFixed(0)}`;
  }

  return `${currency} ${amount}`;
}

function ApplicationStatusContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [data, setData] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStatus() {
      try {
        const response = await fetch('/api/v1/applications/my-application', {
          credentials: 'include',
        });

        if (response.status === 401) {
          router.replace('/auth/login');
          return;
        }

        const json = await response.json();
        if (!response.ok) {
          throw new Error(json?.message || 'Application not found.');
        }

        setData(json);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load application status.');
      } finally {
        setLoading(false);
      }
    }

    if (authLoading) {
      return;
    }

    if (!user) {
      router.replace('/auth/login');
      return;
    }

    loadStatus();
  }, [authLoading, router, user]);

  const status = data
    ? STATUS_COPY[data.status] ?? {
        title: `Status: ${data.status.replace(/_/g, ' ').toLowerCase()}`,
        body: 'Your application is being processed.',
        color: '#9e9890',
      }
    : null;

  if (loading) {
    return <div style={{ minHeight: '100vh', background: 'var(--color-bg, #0a0a0a)' }} />;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg, #0a0a0a)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-body, sans-serif)',
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          maxWidth: '560px',
          width: '100%',
          border: '1px solid var(--color-border, #2a2a2a)',
          padding: '48px',
        }}
      >
        {error && (
          <>
            <h2 style={{ color: '#f5f3ef', marginBottom: 12 }}>Something went wrong</h2>
            <p style={{ color: '#b4aea5', lineHeight: 1.7 }}>{error}</p>
            <div style={{ marginTop: 24 }}>
              <Link href="/" style={{ color: 'var(--color-accent, #9e7f5a)', textDecoration: 'none' }}>
                Return home
              </Link>
            </div>
          </>
        )}

        {data && status && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 48,
                  height: 48,
                  border: `1.5px solid ${status.color}`,
                  color: status.color,
                  marginBottom: 20,
                }}
              >
                {data.status === 'REJECTED' ? 'X' : 'OK'}
              </div>
              <h2 style={{ color: '#f5f3ef', marginBottom: 12 }}>{status.title}</h2>
              <p style={{ color: '#b4aea5', lineHeight: 1.7 }}>{status.body}</p>
            </div>

            <div style={{ border: '1px solid var(--color-border, #2a2a2a)', marginBottom: 24 }}>
              {[
                { label: 'Applicant', value: data.name },
                { label: 'Email', value: data.email },
                { label: 'Application type', value: data.type === 'COMPANY' ? 'Company' : 'Talent' },
                { label: data.type === 'COMPANY' ? 'Company name' : 'Current role', value: data.companyName ?? data.currentRole ?? '-' },
                { label: 'Reference', value: data.id },
                ...(data.paidAt ? [{ label: 'Fee paid', value: formatFee(data.feeAmountMinor, data.feeCurrency) }] : []),
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 16px',
                    borderBottom: '1px solid var(--color-border, #2a2a2a)',
                    gap: 16,
                    fontSize: 13,
                  }}
                >
                  <span style={{ color: '#7c756d' }}>{label}</span>
                  <span style={{ color: '#d7d2ca', textAlign: 'right', wordBreak: 'break-word' }}>{value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', fontSize: 13 }}>
                <span style={{ color: '#7c756d' }}>Submitted</span>
                <span style={{ color: '#d7d2ca' }}>
                  {new Date(data.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {data.status === 'APPROVED' && (
              <div style={{ textAlign: 'center' }}>
                <Link href="/dashboard" style={{ color: 'var(--color-accent, #9e7f5a)', textDecoration: 'none' }}>
                  Open dashboard
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ApplicationStatusPage() {
  return <ApplicationStatusContent />;
}
