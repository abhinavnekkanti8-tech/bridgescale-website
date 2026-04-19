'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type ApplicationData = {
  id: string;
  type: 'COMPANY' | 'TALENT';
  status: string;
  name: string;
  email: string;
  createdAt: string;
  paidAt: string | null;
  feeCurrency: string | null;
  feeAmountMinor: number | null;
  paymentProvider: string | null;
};

const STATUS_COPY: Record<string, { title: string; body: string; color: string }> = {
  SUBMITTED: {
    title: 'Application received',
    body: 'Your application has been submitted and payment confirmed. Our team will review it and generate your diagnosis within 2 business days. You\'ll receive an email with login details shortly.',
    color: '#2e7d52',
  },
  PENDING_PAYMENT: {
    title: 'Awaiting payment',
    body: 'Your application is saved. Please complete payment to proceed.',
    color: '#9e7f5a',
  },
  DIAGNOSIS_GENERATED: {
    title: 'Diagnosis ready',
    body: 'Your needs diagnosis has been generated. Log in to your dashboard to review it.',
    color: '#7E93B5',
  },
  DIAGNOSIS_APPROVED: {
    title: 'Diagnosis approved',
    body: 'You\'ve approved your diagnosis. We\'re now matching you with available talent.',
    color: '#2e7d52',
  },
  APPROVED: {
    title: 'Application approved',
    body: 'Congratulations — your application has been approved. Check your email for your login link.',
    color: '#2e7d52',
  },
  REJECTED: {
    title: 'Application not accepted',
    body: 'After review, we\'re unable to accept your application at this time. You\'re welcome to reapply in the future.',
    color: '#c0392b',
  },
};

function formatFee(amount: number | null, currency: string | null): string {
  if (!amount || !currency) return '';
  if (currency === 'INR') return `₹${(amount / 100).toLocaleString('en-IN')}`;
  if (currency === 'USD') return `$${(amount / 100).toFixed(0)}`;
  return `${currency} ${amount}`;
}

export default function ApplicationStatusPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--color-bg, #0a0a0a)' }} />}>
      <ApplicationStatusContent />
    </Suspense>
  );
}

function ApplicationStatusContent() {
  const params = useSearchParams();
  const id = params.get('id');
  const [data, setData] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError('No application ID provided.');
      setLoading(false);
      return;
    }

    fetch(`/api/v1/applications/${id}/status`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || 'Application not found.');
        setData(json);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const status = data ? (STATUS_COPY[data.status] ?? {
    title: 'Status: ' + data.status.replace(/_/g, ' ').toLowerCase(),
    body: 'Your application is being processed.',
    color: '#9e9890',
  }) : null;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg, #0a0a0a)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-body, sans-serif)',
      padding: '40px 20px',
    }}>
      <div style={{
        maxWidth: '520px',
        width: '100%',
        border: '1px solid var(--color-border, #2a2a2a)',
        padding: '56px',
      }}>
        {loading && (
          <div style={{ textAlign: 'center', color: 'var(--color-text-muted, #4a4a4a)' }}>
            Loading…
          </div>
        )}

        {error && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px', color: '#c0392b', fontSize: '1.5rem' }}>✕</div>
            <h2 style={{ fontFamily: 'var(--font-serif, serif)', fontSize: '1.4rem', color: 'var(--color-text-primary, #f5f3ef)', marginBottom: '12px', textAlign: 'center' }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary, #6b6b6b)', textAlign: 'center', lineHeight: 1.7 }}>
              {error}
            </p>
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Link href="/" style={{ fontSize: '13px', color: 'var(--color-accent, #9e7f5a)', textDecoration: 'none' }}>
                ← Return home
              </Link>
            </div>
          </>
        )}

        {data && status && (
          <>
            {/* Status badge */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                border: `1.5px solid ${status.color}`,
                color: status.color,
                fontSize: '1.25rem',
                marginBottom: '20px',
              }}>
                {data.status === 'REJECTED' ? '✕' : '✓'}
              </div>
              <h2 style={{
                fontFamily: 'var(--font-serif, serif)',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--color-text-primary, #f5f3ef)',
                marginBottom: '12px',
              }}>
                {status.title}
              </h2>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--color-text-secondary, #6b6b6b)',
                lineHeight: 1.7,
                fontWeight: 300,
              }}>
                {status.body}
              </p>
            </div>

            {/* Details */}
            <div style={{
              border: '1px solid var(--color-border, #2a2a2a)',
              marginBottom: '28px',
            }}>
              {[
                { label: 'Applicant', value: data.name },
                { label: 'Email', value: data.email },
                { label: 'Application type', value: data.type === 'COMPANY' ? 'Company' : 'Talent' },
                { label: 'Reference', value: data.id, mono: true },
                ...(data.paidAt ? [{ label: 'Fee paid', value: formatFee(data.feeAmountMinor, data.feeCurrency) }] : []),
              ].map(({ label, value, mono }) => (
                <div key={label} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 16px',
                  borderBottom: '1px solid var(--color-border, #2a2a2a)',
                  fontSize: '13px',
                  gap: '16px',
                }}>
                  <span style={{ color: 'var(--color-text-muted, #4a4a4a)', flexShrink: 0 }}>{label}</span>
                  <span style={{
                    color: 'var(--color-text-secondary, #8a8a8a)',
                    fontFamily: mono ? 'monospace' : 'inherit',
                    fontSize: mono ? '12px' : '13px',
                    textAlign: 'right',
                    wordBreak: 'break-all',
                  }}>
                    {value}
                  </span>
                </div>
              ))}
              <div style={{ padding: '10px 16px', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted, #4a4a4a)' }}>Submitted</span>
                <span style={{ color: 'var(--color-text-secondary, #8a8a8a)' }}>
                  {new Date(data.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>

            <p style={{
              fontSize: '12px',
              color: 'var(--color-text-muted, #4a4a4a)',
              lineHeight: 1.6,
              textAlign: 'center',
            }}>
              Check your inbox — we'll send you a login link once your application is reviewed.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
