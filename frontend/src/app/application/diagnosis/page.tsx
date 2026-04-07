'use client';

import { useEffect, useState } from 'react';

type DiagnosisStatus =
  | 'DRAFT_AI'
  | 'UNDER_REVIEW'
  | 'READY_FOR_CLIENT'
  | 'APPROVED'
  | 'REVISION_REQUESTED';

type DiagnosisContent = {
  analysis?: string;
  challenges?: string[];
  opportunities?: string[];
  recommendedRole?: string;
  estimatedSprint?: string;
};

type Application = {
  id: string;
  name: string;
  email: string;
  status: string;
  needDiagnosis?: {
    id: string;
    status: DiagnosisStatus;
    aiContent?: DiagnosisContent;
    clientFacingContent?: DiagnosisContent;
    finalizedAt?: string;
    clientApprovedAt?: string;
  };
};

export default function ClientDiagnosisPage() {
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');

  useEffect(() => {
    fetchApplication();
  }, []);

  async function fetchApplication() {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/applications/my-application', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to load your application');
      const data = await res.json();
      setApplication(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove() {
    if (!application?.needDiagnosis) return;
    if (!confirm('Approve this diagnosis? We will move forward with talent matching.')) return;
    try {
      setSubmitting(true);
      const res = await fetch(
        `/api/v1/diagnoses/${application.needDiagnosis.id}/client-approve`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ applicationId: application.id }),
        },
      );
      if (!res.ok) throw new Error('Failed to approve diagnosis');
      await fetchApplication();
      alert('Diagnosis approved. Our team will be in touch shortly.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Approval failed');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRequestRevision() {
    if (!application?.needDiagnosis) return;
    if (!revisionNotes.trim()) {
      alert('Please describe what you would like changed.');
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch(
        `/api/v1/diagnoses/${application.needDiagnosis.id}/request-revision`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            applicationId: application.id,
            notes: revisionNotes,
          }),
        },
      );
      if (!res.ok) throw new Error('Failed to request revision');
      await fetchApplication();
      setShowRevisionForm(false);
      setRevisionNotes('');
      alert('Revision request sent. Our team will follow up shortly.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div style={{ padding: 40, color: '#999' }}>Loading…</div>;
  }

  if (error || !application) {
    return (
      <div style={{ padding: 40, color: '#ff6b6b' }}>{error ?? 'Not found'}</div>
    );
  }

  if (!application.needDiagnosis) {
    return (
      <div style={{ padding: 40, color: '#999' }}>
        Your diagnosis is not ready yet. We will notify you by email when it
        is available.
      </div>
    );
  }

  const d = application.needDiagnosis;
  const content = d.clientFacingContent ?? d.aiContent ?? {};
  const isApproved = d.status === 'APPROVED';
  const isPendingClient = d.status === 'READY_FOR_CLIENT';
  const isRevisionRequested = d.status === 'REVISION_REQUESTED';

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', padding: '40px 20px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32, color: '#f5f3ef', marginTop: 0 }}>
          Your Diagnosis
        </h1>
        <p style={{ color: '#999', fontSize: 14, margin: '0 0 32px' }}>
          A summary of what we heard, and what we recommend.
        </p>

        <Section title="Analysis">
          <p style={{ color: '#f5f3ef', lineHeight: 1.6 }}>{content.analysis}</p>
        </Section>

        <Section title="Recommended Role">
          <p style={{ color: '#f5f3ef' }}>{content.recommendedRole}</p>
        </Section>

        <Section title="Estimated Sprint">
          <p style={{ color: '#f5f3ef' }}>{content.estimatedSprint}</p>
        </Section>

        {content.challenges && content.challenges.length > 0 && (
          <Section title="Key Challenges">
            <ul style={{ color: '#f5f3ef', lineHeight: 1.6 }}>
              {content.challenges.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </Section>
        )}

        {content.opportunities && content.opportunities.length > 0 && (
          <Section title="Opportunities">
            <ul style={{ color: '#f5f3ef', lineHeight: 1.6 }}>
              {content.opportunities.map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          </Section>
        )}

        {/* Decision area */}
        {isApproved && (
          <div style={{
            marginTop: 32,
            padding: 20,
            background: '#1f3320',
            color: '#a7f3a0',
            borderRadius: 8,
          }}>
            ✓ You approved this diagnosis on{' '}
            {d.clientApprovedAt ? new Date(d.clientApprovedAt).toLocaleDateString() : 'recently'}.
            We are working on next steps.
          </div>
        )}

        {isRevisionRequested && (
          <div style={{
            marginTop: 32,
            padding: 20,
            background: '#332b1f',
            color: '#fcd9a0',
            borderRadius: 8,
          }}>
            Your revision request has been sent. Our team will follow up.
          </div>
        )}

        {isPendingClient && !showRevisionForm && (
          <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
            <button
              onClick={handleApprove}
              disabled={submitting}
              style={{
                padding: '12px 24px',
                background: '#9e7f5a',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: submitting ? 'default' : 'pointer',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {submitting ? 'Approving…' : 'Approve & Continue'}
            </button>
            <button
              onClick={() => setShowRevisionForm(true)}
              disabled={submitting}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                color: '#9e7f5a',
                border: '1px solid #9e7f5a',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Request Revision
            </button>
          </div>
        )}

        {isPendingClient && showRevisionForm && (
          <div style={{ marginTop: 32 }}>
            <label style={{ display: 'block', color: '#f5f3ef', fontSize: 13, marginBottom: 6 }}>
              What would you like us to change?
            </label>
            <textarea
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              placeholder="Describe the changes or clarifications you would like…"
              style={{
                width: '100%',
                minHeight: 120,
                padding: 12,
                background: '#0f1117',
                border: '1px solid #2a2a2a',
                borderRadius: 4,
                color: '#f5f3ef',
                fontSize: 14,
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
              <button
                onClick={handleRequestRevision}
                disabled={submitting}
                style={{
                  padding: '10px 20px',
                  background: '#9e7f5a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  cursor: submitting ? 'default' : 'pointer',
                }}
              >
                {submitting ? 'Sending…' : 'Send Revision Request'}
              </button>
              <button
                onClick={() => {
                  setShowRevisionForm(false);
                  setRevisionNotes('');
                }}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  color: '#999',
                  border: '1px solid #2a2a2a',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
        color: '#9e7f5a',
        margin: '0 0 8px',
      }}>
        {title}
      </h3>
      {children}
    </div>
  );
}
