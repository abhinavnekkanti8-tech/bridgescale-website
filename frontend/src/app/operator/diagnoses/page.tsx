'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type DiagnosisStatus = 'DRAFT_AI' | 'UNDER_REVIEW' | 'READY_FOR_CLIENT' | 'APPROVED' | 'REVISION_REQUESTED';

type Diagnosis = {
  id: string;
  applicationId: string;
  status: DiagnosisStatus;
  aiContent: {
    analysis: string;
    challenges: string[];
    opportunities: string[];
    recommendedRole: string;
    estimatedSprint: string;
  };
  humanEditedContent?: Record<string, any>;
  clientFacingContent?: Record<string, any>;
  reviewerNotes?: string;
  generatedAt: string;
  application: {
    id: string;
    name: string;
    email: string;
    type: 'COMPANY' | 'TALENT';
    createdAt: string;
  };
};

const STATUS_COLORS: Record<DiagnosisStatus, string> = {
  DRAFT_AI: '#f59e0b',
  UNDER_REVIEW: '#8b5cf6',
  READY_FOR_CLIENT: '#3b82f6',
  APPROVED: '#22c55e',
  REVISION_REQUESTED: '#ef4444',
};

export default function DiagnosesPage() {
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<DiagnosisStatus | 'all'>('all');

  useEffect(() => {
    fetchDiagnoses();
  }, [filter]);

  async function fetchDiagnoses() {
    try {
      setLoading(true);
      const url =
        filter === 'all'
          ? '/api/v1/diagnoses'
          : `/api/v1/diagnoses?status=${filter}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch diagnoses');

      const data = await res.json();
      setDiagnoses(data.diagnoses || []);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading diagnoses');
    } finally {
      setLoading(false);
    }
  }

  const selected = selectedId ? diagnoses.find((d) => d.id === selectedId) : null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg, #0a0a0a)' }}>
      {/* List panel */}
      <div style={{
        flex: '0 0 380px',
        borderRight: '1px solid var(--color-border, #2a2a2a)',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-bg-secondary, #0f1117)',
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border, #2a2a2a)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px', color: 'var(--color-text-primary, #f5f3ef)' }}>
            Diagnoses
          </h2>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['all', 'DRAFT_AI', 'APPROVED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  border: 'none',
                  fontSize: '12px',
                  cursor: 'pointer',
                  background: filter === status
                    ? 'var(--color-accent, #9e7f5a)'
                    : 'rgba(255, 255, 255, 0.05)',
                  color: filter === status ? '#fff' : 'var(--color-text-muted, #4a4a4a)',
                }}
              >
                {status === 'all' ? 'All' : status.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div style={{ padding: '24px', color: 'var(--color-text-muted, #4a4a4a)', textAlign: 'center' }}>
            Loading...
          </div>
        )}

        {error && (
          <div style={{ padding: '24px', color: '#ef4444', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {diagnoses.map((diagnosis) => (
            <button
              key={diagnosis.id}
              onClick={() => setSelectedId(diagnosis.id)}
              style={{
                width: '100%',
                padding: '16px',
                borderBottom: '1px solid var(--color-border, #2a2a2a)',
                border: 'none',
                background: selectedId === diagnosis.id
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary, #f5f3ef)' }}>
                  {diagnosis.application.name}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '3px',
                    background: STATUS_COLORS[diagnosis.status],
                    color: '#fff',
                  }}
                >
                  {diagnosis.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted, #4a4a4a)' }}>
                {diagnosis.application.email}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted, #4a4a4a)', marginTop: '4px' }}>
                {new Date(diagnosis.generatedAt).toLocaleDateString('en-GB')}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      <div style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
        {!selected ? (
          <div style={{ color: 'var(--color-text-muted, #4a4a4a)', textAlign: 'center', paddingTop: '100px' }}>
            Select a diagnosis to review
          </div>
        ) : (
          <DiagnosisDetailView diagnosis={selected} onUpdate={fetchDiagnoses} />
        )}
      </div>
    </div>
  );
}

function DiagnosisDetailView({
  diagnosis,
  onUpdate,
}: {
  diagnosis: Diagnosis;
  onUpdate: () => void;
}) {
  const [status, setStatus] = useState(diagnosis.status);
  const [reviewerNotes, setReviewerNotes] = useState(diagnosis.reviewerNotes || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSave() {
    try {
      setSaving(true);
      const res = await fetch(`/api/v1/diagnoses/${diagnosis.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          reviewerNotes,
        }),
      });

      if (!res.ok) throw new Error('Failed to update diagnosis');

      setMessage('Saved successfully');
      setTimeout(() => setMessage(''), 2000);
      onUpdate();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Error saving');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: '700px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '32px',
      }}>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 700,
            margin: '0 0 8px',
            color: 'var(--color-text-primary, #f5f3ef)',
          }}>
            {diagnosis.application.name}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted, #4a4a4a)', margin: 0 }}>
            {diagnosis.application.email}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted, #4a4a4a)', margin: '0 0 8px' }}>
            Generated: {new Date(diagnosis.generatedAt).toLocaleDateString('en-GB')}
          </p>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as DiagnosisStatus)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid var(--color-border, #2a2a2a)',
              background: 'var(--color-bg, #0a0a0a)',
              color: 'var(--color-text-primary, #f5f3ef)',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <option value="DRAFT_AI">Draft (AI)</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="READY_FOR_CLIENT">Ready for Client</option>
            <option value="APPROVED">Approved</option>
            <option value="REVISION_REQUESTED">Revision Requested</option>
          </select>
        </div>
      </div>

      {/* AI Content */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '16px',
          fontWeight: 700,
          margin: '0 0 16px',
          color: 'var(--color-text-primary, #f5f3ef)',
        }}>
          AI Analysis
        </h2>
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--color-border, #2a2a2a)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 12px', color: 'var(--color-text-primary, #f5f3ef)' }}>
            Analysis
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary, #8a8a8a)', margin: 0, lineHeight: 1.6 }}>
            {diagnosis.aiContent.analysis}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '16px',
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--color-border, #2a2a2a)',
            borderRadius: '8px',
            padding: '16px',
          }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 12px', color: 'var(--color-text-primary, #f5f3ef)' }}>
              Challenges
            </h3>
            <ul style={{ fontSize: '12px', color: 'var(--color-text-secondary, #8a8a8a)', margin: 0, paddingLeft: '16px' }}>
              {diagnosis.aiContent.challenges.map((c, i) => (
                <li key={i} style={{ marginBottom: '4px' }}>
                  {c}
                </li>
              ))}
            </ul>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--color-border, #2a2a2a)',
            borderRadius: '8px',
            padding: '16px',
          }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 12px', color: 'var(--color-text-primary, #f5f3ef)' }}>
              Opportunities
            </h3>
            <ul style={{ fontSize: '12px', color: 'var(--color-text-secondary, #8a8a8a)', margin: 0, paddingLeft: '16px' }}>
              {diagnosis.aiContent.opportunities.map((o, i) => (
                <li key={i} style={{ marginBottom: '4px' }}>
                  {o}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--color-border, #2a2a2a)',
            borderRadius: '8px',
            padding: '16px',
          }}>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted, #4a4a4a)', margin: '0 0 4px' }}>
              Recommended Role
            </p>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary, #f5f3ef)', margin: 0 }}>
              {diagnosis.aiContent.recommendedRole}
            </p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--color-border, #2a2a2a)',
            borderRadius: '8px',
            padding: '16px',
          }}>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted, #4a4a4a)', margin: '0 0 4px' }}>
              Estimated Sprint
            </p>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary, #f5f3ef)', margin: 0 }}>
              {diagnosis.aiContent.estimatedSprint}
            </p>
          </div>
        </div>
      </div>

      {/* Reviewer Notes */}
      <div style={{ marginBottom: '32px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: 600,
          margin: '0 0 12px',
          color: 'var(--color-text-primary, #f5f3ef)',
        }}>
          Reviewer Notes
        </label>
        <textarea
          value={reviewerNotes}
          onChange={(e) => setReviewerNotes(e.target.value)}
          placeholder="Add notes about this diagnosis..."
          style={{
            width: '100%',
            minHeight: '120px',
            padding: '12px',
            borderRadius: '4px',
            border: '1px solid var(--color-border, #2a2a2a)',
            background: 'var(--color-bg, #0a0a0a)',
            color: 'var(--color-text-primary, #f5f3ef)',
            fontSize: '13px',
            fontFamily: 'inherit',
            resize: 'vertical',
          }}
        />
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end',
        paddingTop: '24px',
        borderTop: '1px solid var(--color-border, #2a2a2a)',
      }}>
        {message && (
          <span style={{ fontSize: '13px', color: '#22c55e', alignSelf: 'center' }}>
            {message}
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '10px 20px',
            borderRadius: '4px',
            border: 'none',
            background: 'var(--color-accent, #9e7f5a)',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
