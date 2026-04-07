'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

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

type Diagnosis = {
  id: string;
  applicationId: string;
  status: DiagnosisStatus;
  aiContent: DiagnosisContent;
  humanEditedContent?: DiagnosisContent;
  clientFacingContent?: DiagnosisContent;
  reviewerNotes?: string;
  revisionNotes?: string;
  generatedAt: string;
  finalizedAt?: string;
  application?: {
    id: string;
    name: string;
    email: string;
    type: string;
    companyName?: string;
  };
};

export default function AdminDiagnosisReviewPage() {
  const params = useParams();
  const applicationId = params.id as string;

  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [edited, setEdited] = useState<DiagnosisContent>({});
  const [reviewerNotes, setReviewerNotes] = useState('');

  useEffect(() => {
    fetchDiagnosis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchDiagnosis() {
    try {
      setLoading(true);
      // The diagnoses API is keyed by diagnosis id, not application id, so
      // we list pending and find the matching record. For a richer
      // experience an /api/v1/applications/:id/diagnosis endpoint could be
      // added later.
      const res = await fetch('/api/v1/diagnoses');
      if (!res.ok) throw new Error('Failed to load diagnoses');
      const data = await res.json();
      const match: Diagnosis | undefined = (data.diagnoses || []).find(
        (d: Diagnosis) => d.applicationId === applicationId,
      );
      if (!match) {
        setError('No diagnosis found for this application yet.');
        return;
      }
      setDiagnosis(match);
      setEdited(match.humanEditedContent ?? match.aiContent ?? {});
      setReviewerNotes(match.reviewerNotes ?? '');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveDraft() {
    if (!diagnosis) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/v1/diagnoses/${diagnosis.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          humanEditedContent: edited,
          reviewerNotes,
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      await fetchDiagnosis();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleFinalize() {
    if (!diagnosis) return;
    if (!confirm('Finalize and send to client? They will be able to approve or request revisions.')) return;
    try {
      setFinalizing(true);
      const res = await fetch(`/api/v1/diagnoses/${diagnosis.id}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientFacingContent: edited,
          reviewerNotes,
        }),
      });
      if (!res.ok) throw new Error('Failed to finalize');
      await fetchDiagnosis();
      alert('Diagnosis finalized and sent to client.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Finalize failed');
    } finally {
      setFinalizing(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 40, color: '#999' }}>Loading diagnosis…</div>
    );
  }

  if (error || !diagnosis) {
    return (
      <div style={{ padding: 40 }}>
        <Link href={`/admin/applications`} style={{ color: '#9e7f5a' }}>
          ← Back to applications
        </Link>
        <p style={{ color: '#ff6b6b', marginTop: 16 }}>{error ?? 'Not found'}</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', padding: '40px 20px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Link href="/admin/applications" style={{ color: '#9e7f5a', textDecoration: 'none' }}>
          ← Back to applications
        </Link>

        <h1 style={{ fontSize: 28, color: '#f5f3ef', margin: '12px 0 4px' }}>
          Diagnosis Review
        </h1>
        <p style={{ color: '#999', margin: '0 0 24px', fontSize: 14 }}>
          {diagnosis.application?.companyName ?? diagnosis.application?.name} ·{' '}
          <code>{diagnosis.status}</code>
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          {/* AI Original */}
          <div style={{ padding: 20, background: '#0f1117', border: '1px solid #2a2a2a', borderRadius: 8 }}>
            <h3 style={{ color: '#f5f3ef', fontSize: 14, marginTop: 0 }}>AI-Generated (read-only)</h3>
            <pre style={{ color: '#999', fontSize: 12, whiteSpace: 'pre-wrap', margin: 0 }}>
              {JSON.stringify(diagnosis.aiContent, null, 2)}
            </pre>
          </div>

          {/* Editable */}
          <div style={{ padding: 20, background: '#0f1117', border: '1px solid #2a2a2a', borderRadius: 8 }}>
            <h3 style={{ color: '#f5f3ef', fontSize: 14, marginTop: 0 }}>Edited (will be sent to client)</h3>

            <Field
              label="Analysis"
              value={edited.analysis ?? ''}
              onChange={(v) => setEdited({ ...edited, analysis: v })}
              multiline
            />
            <Field
              label="Recommended Role"
              value={edited.recommendedRole ?? ''}
              onChange={(v) => setEdited({ ...edited, recommendedRole: v })}
            />
            <Field
              label="Estimated Sprint"
              value={edited.estimatedSprint ?? ''}
              onChange={(v) => setEdited({ ...edited, estimatedSprint: v })}
            />
            <ListField
              label="Challenges"
              values={edited.challenges ?? []}
              onChange={(v) => setEdited({ ...edited, challenges: v })}
            />
            <ListField
              label="Opportunities"
              values={edited.opportunities ?? []}
              onChange={(v) => setEdited({ ...edited, opportunities: v })}
            />
          </div>
        </div>

        {/* Reviewer notes */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', color: '#f5f3ef', fontSize: 13, marginBottom: 6 }}>
            Reviewer Notes (internal)
          </label>
          <textarea
            value={reviewerNotes}
            onChange={(e) => setReviewerNotes(e.target.value)}
            style={{
              width: '100%',
              minHeight: 80,
              padding: 10,
              background: '#0f1117',
              border: '1px solid #2a2a2a',
              borderRadius: 4,
              color: '#f5f3ef',
              fontSize: 13,
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Action bar */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            style={{
              padding: '10px 20px',
              borderRadius: 4,
              border: '1px solid #9e7f5a',
              background: 'transparent',
              color: '#9e7f5a',
              cursor: saving ? 'default' : 'pointer',
            }}
          >
            {saving ? 'Saving…' : 'Save Draft'}
          </button>
          <button
            onClick={handleFinalize}
            disabled={finalizing || diagnosis.status === 'APPROVED'}
            style={{
              padding: '10px 20px',
              borderRadius: 4,
              border: 'none',
              background: '#9e7f5a',
              color: '#fff',
              cursor: finalizing ? 'default' : 'pointer',
            }}
          >
            {finalizing ? 'Finalizing…' : 'Finalize & Send to Client'}
          </button>
        </div>

        {diagnosis.revisionNotes && (
          <div style={{
            marginTop: 24,
            padding: 16,
            background: '#3d2020',
            color: '#ffb4b4',
            borderRadius: 4,
            fontSize: 13,
          }}>
            <strong>Client requested revisions:</strong> {diagnosis.revisionNotes}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', color: '#999', fontSize: 12, marginBottom: 4 }}>
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            minHeight: 60,
            padding: 8,
            background: '#0a0a0a',
            border: '1px solid #2a2a2a',
            borderRadius: 4,
            color: '#f5f3ef',
            fontSize: 13,
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            padding: 8,
            background: '#0a0a0a',
            border: '1px solid #2a2a2a',
            borderRadius: 4,
            color: '#f5f3ef',
            fontSize: 13,
            boxSizing: 'border-box',
          }}
        />
      )}
    </div>
  );
}

function ListField({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', color: '#999', fontSize: 12, marginBottom: 4 }}>
        {label} (one per line)
      </label>
      <textarea
        value={values.join('\n')}
        onChange={(e) =>
          onChange(e.target.value.split('\n').filter((s) => s.trim().length > 0))
        }
        style={{
          width: '100%',
          minHeight: 60,
          padding: 8,
          background: '#0a0a0a',
          border: '1px solid #2a2a2a',
          borderRadius: 4,
          color: '#f5f3ef',
          fontSize: 13,
          fontFamily: 'inherit',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}
