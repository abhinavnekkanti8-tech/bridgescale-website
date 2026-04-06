'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type ApplicationData = {
  id: string;
  type: 'COMPANY' | 'TALENT';
  status: string;
  name: string;
  email: string;
  companyName?: string | null;
  createdAt: string;
  paidAt: string | null;
  needDiagnosis?: { id: string; status: string; clientFacingContent?: any } | null;
  opportunityBrief?: { id: string; clientFacingContent?: any } | null;
};

const statusSteps: Record<string, { step: number; label: string; done: boolean }> = {
  PENDING_PAYMENT: { step: 1, label: 'Payment pending', done: false },
  SUBMITTED: { step: 2, label: 'Application submitted', done: true },
  DIAGNOSIS_GENERATED: { step: 3, label: 'Diagnosis generated', done: true },
  DIAGNOSIS_UNDER_REVIEW: { step: 3, label: 'Diagnosis under review', done: false },
  DIAGNOSIS_APPROVED: { step: 4, label: 'Diagnosis approved', done: true },
  BRIEF_GENERATED: { step: 5, label: 'Opportunity brief ready', done: true },
  PRESCREENED: { step: 6, label: 'Pre-screened', done: true },
  INTERVIEW_SCHEDULED: { step: 7, label: 'Interview scheduled', done: true },
  APPROVED: { step: 8, label: 'Approved', done: true },
  REJECTED: { step: -1, label: 'Not accepted', done: false },
};

export default function DashboardPage() {
  const router = useRouter();
  const [app, setApp] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/v1/applications/my-application')
      .then(async (res) => {
        if (res.status === 401) {
          router.push('/auth/login');
          return;
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || 'Failed to load application.');
        setApp(data);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  const step = app ? statusSteps[app.status] : null;

  const styles = {
    page: { minHeight: '100vh', background: 'var(--color-bg, #0a0a0a)', padding: '40px 20px', fontFamily: 'var(--font-body, sans-serif)' },
    container: { maxWidth: '900px', margin: '0 auto' },
    header: { marginBottom: '48px' },
    greeting: { fontFamily: 'var(--font-serif, serif)', fontSize: '2rem', fontWeight: 700, color: 'var(--color-text-primary, #f5f3ef)', marginBottom: '8px' },
    subheading: { fontSize: '0.9rem', color: 'var(--color-text-secondary, #6b6b6b)' },
    card: { border: '1px solid var(--color-border, #2a2a2a)', padding: '32px', marginBottom: '24px' },
    label: { fontSize: '12px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-accent, #9e7f5a)', marginBottom: '12px' },
    content: { fontSize: '0.95rem', color: 'var(--color-text-secondary, #8a8a8a)', lineHeight: 1.7 },
    status: { padding: '12px 16px', background: 'var(--color-surface-alt, rgba(255,255,255,0.03))', border: '1px solid var(--color-border, #2a2a2a)', borderRadius: '8px', marginBottom: '24px' },
  };

  if (loading) return <div style={styles.page}>Loading…</div>;

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.label}>Error</div>
            <div style={styles.content}>{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!app) return <div style={styles.page}>No application found.</div>;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.greeting}>Welcome back, {app.name.split(' ')[0]}</div>
          <div style={styles.subheading}>Your {app.type.toLowerCase()} application is {step?.label.toLowerCase()}</div>
        </div>

        <div style={styles.card}>
          <div style={styles.label}>Application status</div>
          <div style={{ ...styles.status, color: step?.done ? 'var(--color-accent, #9e7f5a)' : 'var(--color-text-muted, #4a4a4a)' }}>
            Step {step?.step ?? '?'}: {step?.label ?? 'Unknown'}
          </div>
          <div style={styles.content}>
            {app.status === 'PENDING_APPROVAL' && (
              <p>Your account is being reviewed. You'll receive a confirmation email once approved.</p>
            )}
            {app.status === 'SUBMITTED' && (
              <p>Your application has been received. Our team is generating your needs diagnosis.</p>
            )}
            {app.status === 'DIAGNOSIS_GENERATED' && (
              <p>Your diagnosis is ready for review. You can approve it to proceed to matching.</p>
            )}
            {app.status === 'DIAGNOSIS_APPROVED' && (
              <p>Great! We're now preparing your opportunity brief and matching you with potential talent.</p>
            )}
            {app.status === 'APPROVED' && (
              <p>Congratulations! Your application has been approved. You can now start engaging with matched talent.</p>
            )}
            {app.status === 'REJECTED' && (
              <p>After review, we're unable to accept your application at this time. You're welcome to reapply in the future.</p>
            )}
          </div>
        </div>

        {app.needDiagnosis && (
          <div style={styles.card}>
            <div style={styles.label}>Needs diagnosis</div>
            {app.needDiagnosis.clientFacingContent ? (
              <div style={styles.content}>
                <p><strong>Status:</strong> {app.needDiagnosis.status.replace(/_/g, ' ')}</p>
                {typeof app.needDiagnosis.clientFacingContent === 'object' && (
                  <pre style={{ fontSize: '13px', color: 'var(--color-text-secondary, #8a8a8a)', overflow: 'auto', maxHeight: '300px', background: 'var(--color-surface-alt, rgba(255,255,255,0.02))', padding: '12px', borderRadius: '4px' }}>
                    {JSON.stringify(app.needDiagnosis.clientFacingContent, null, 2)}
                  </pre>
                )}
              </div>
            ) : (
              <div style={styles.content}>Diagnosis is being generated…</div>
            )}
          </div>
        )}

        <div style={styles.card}>
          <div style={styles.label}>Application details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {[
              { label: 'Name', value: app.name },
              { label: 'Email', value: app.email },
              { label: 'Type', value: app.type === 'COMPANY' ? 'Company' : 'Talent' },
              { label: app.type === 'COMPANY' ? 'Company name' : 'Current role', value: app.companyName ?? app.name },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ ...styles.label, marginBottom: '8px' }}>{label}</div>
                <div style={styles.content}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
