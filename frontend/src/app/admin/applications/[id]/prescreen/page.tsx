'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type Recommendation = 'STRONG_PASS' | 'PASS' | 'CONDITIONAL' | 'FAIL';

type RedFlag = {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description?: string;
};

type LinkedinVerification = {
  verified: boolean;
  confidence: 'low' | 'medium' | 'high';
  source?: string;
};

type PreScreen = {
  id: string;
  applicationId: string;
  recommendation: Recommendation;
  completenessScore: number;
  consistencyScore: number;
  referenceScore: number;
  assessmentScore: number;
  redFlags: RedFlag[];
  suggestedProbeQuestions: string[];
  linkedinVerification?: LinkedinVerification;
  promptVersion?: string;
  generatedAt: string;
  application?: {
    id: string;
    name: string;
    email: string;
    type: string;
    talentCategory?: string;
    seniority?: string;
    linkedInUrl?: string;
  };
};

const RECOMMENDATIONS: Recommendation[] = [
  'STRONG_PASS',
  'PASS',
  'CONDITIONAL',
  'FAIL',
];

const RECOMMENDATION_COLOR: Record<Recommendation, string> = {
  STRONG_PASS: '#a7f3a0',
  PASS: '#9e7f5a',
  CONDITIONAL: '#fcd9a0',
  FAIL: '#ffb4b4',
};

export default function AdminPreScreenPage() {
  const params = useParams();
  const applicationId = params.id as string;

  const [preScreen, setPreScreen] = useState<PreScreen | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [recommendation, setRecommendation] = useState<Recommendation>('PASS');
  const [redFlagsText, setRedFlagsText] = useState('');
  const [probeQuestionsText, setProbeQuestionsText] = useState('');

  useEffect(() => {
    fetchPreScreen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchPreScreen() {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/talent-pre-screens/${applicationId}`, {
        credentials: 'include',
      });
      if (res.status === 404) {
        setPreScreen(null);
        setError(null);
        return;
      }
      if (!res.ok) throw new Error('Failed to load pre-screen');
      const data: PreScreen = await res.json();
      setPreScreen(data);
      setRecommendation(data.recommendation);
      setRedFlagsText(JSON.stringify(data.redFlags ?? [], null, 2));
      setProbeQuestionsText((data.suggestedProbeQuestions ?? []).join('\n'));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    try {
      setGenerating(true);
      const res = await fetch(
        `/api/v1/talent-pre-screens/${applicationId}/generate`,
        { method: 'POST', credentials: 'include' },
      );
      if (!res.ok) throw new Error('Failed to generate pre-screen');
      await fetchPreScreen();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!preScreen) return;
    let parsedFlags: RedFlag[] = [];
    try {
      parsedFlags = JSON.parse(redFlagsText || '[]');
      if (!Array.isArray(parsedFlags)) throw new Error('Red flags must be an array');
    } catch (err) {
      alert(`Invalid red flags JSON: ${err instanceof Error ? err.message : 'parse error'}`);
      return;
    }
    const probeQuestions = probeQuestionsText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    try {
      setSaving(true);
      const res = await fetch(`/api/v1/talent-pre-screens/${applicationId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recommendation,
          redFlags: parsedFlags,
          suggestedProbeQuestions: probeQuestions,
        }),
      });
      if (!res.ok) throw new Error('Failed to save pre-screen');
      await fetchPreScreen();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div style={{ padding: 40, color: '#999' }}>Loading pre-screen…</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', padding: '40px 20px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Link href="/admin/applications" style={{ color: '#9e7f5a', textDecoration: 'none' }}>
          ← Back to applications
        </Link>

        <h1 style={{ fontSize: 28, color: '#f5f3ef', margin: '12px 0 4px' }}>
          Talent Pre-Screen
        </h1>

        {error && (
          <p style={{ color: '#ff6b6b', marginTop: 8 }}>{error}</p>
        )}

        {!preScreen && !error && (
          <div
            style={{
              marginTop: 24,
              padding: 24,
              background: '#0f1117',
              border: '1px solid #2a2a2a',
              borderRadius: 8,
              color: '#f5f3ef',
            }}
          >
            <p style={{ marginTop: 0 }}>
              No pre-screen has been generated for this applicant yet.
            </p>
            <button
              onClick={handleGenerate}
              disabled={generating}
              style={{
                padding: '10px 20px',
                background: '#9e7f5a',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: generating ? 'default' : 'pointer',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {generating ? 'Generating…' : 'Generate Pre-Screen'}
            </button>
          </div>
        )}

        {preScreen && (
          <>
            <p style={{ color: '#999', margin: '0 0 24px', fontSize: 14 }}>
              {preScreen.application?.name ?? 'Applicant'} ·{' '}
              {preScreen.application?.email}
              {preScreen.promptVersion && (
                <>
                  {' · '}
                  <code style={{ color: '#777' }}>{preScreen.promptVersion}</code>
                </>
              )}
            </p>

            {/* Score grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 16,
                marginBottom: 24,
              }}
            >
              <ScoreCard label="Completeness" value={preScreen.completenessScore} />
              <ScoreCard label="Consistency" value={preScreen.consistencyScore} />
              <ScoreCard label="References" value={preScreen.referenceScore} />
              <ScoreCard label="Assessment" value={preScreen.assessmentScore} />
            </div>

            {/* AI recommendation badge */}
            <div
              style={{
                marginBottom: 24,
                padding: 16,
                background: '#0f1117',
                border: '1px solid #2a2a2a',
                borderRadius: 8,
              }}
            >
              <div style={{ color: '#999', fontSize: 12, marginBottom: 6 }}>
                AI Recommendation
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: RECOMMENDATION_COLOR[preScreen.recommendation],
                }}
              >
                {preScreen.recommendation.replace(/_/g, ' ')}
              </div>
              {preScreen.linkedinVerification && (
                <div style={{ color: '#999', fontSize: 12, marginTop: 8 }}>
                  LinkedIn:{' '}
                  {preScreen.linkedinVerification.verified ? '✓ verified' : '✗ unverified'}{' '}
                  ({preScreen.linkedinVerification.confidence} confidence)
                </div>
              )}
            </div>

            {/* Reviewer override */}
            <div
              style={{
                padding: 20,
                background: '#0f1117',
                border: '1px solid #2a2a2a',
                borderRadius: 8,
                marginBottom: 24,
              }}
            >
              <h3 style={{ color: '#f5f3ef', fontSize: 14, marginTop: 0 }}>
                Reviewer Override
              </h3>

              <label
                style={{
                  display: 'block',
                  color: '#999',
                  fontSize: 12,
                  marginTop: 12,
                  marginBottom: 4,
                }}
              >
                Recommendation
              </label>
              <select
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value as Recommendation)}
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
              >
                {RECOMMENDATIONS.map((r) => (
                  <option key={r} value={r}>
                    {r.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>

              <label
                style={{
                  display: 'block',
                  color: '#999',
                  fontSize: 12,
                  marginTop: 16,
                  marginBottom: 4,
                }}
              >
                Red Flags (JSON array of {`{type, severity, description?}`})
              </label>
              <textarea
                value={redFlagsText}
                onChange={(e) => setRedFlagsText(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: 100,
                  padding: 8,
                  background: '#0a0a0a',
                  border: '1px solid #2a2a2a',
                  borderRadius: 4,
                  color: '#f5f3ef',
                  fontSize: 12,
                  fontFamily: 'monospace',
                  boxSizing: 'border-box',
                }}
              />

              <label
                style={{
                  display: 'block',
                  color: '#999',
                  fontSize: 12,
                  marginTop: 16,
                  marginBottom: 4,
                }}
              >
                Suggested Probe Questions (one per line)
              </label>
              <textarea
                value={probeQuestionsText}
                onChange={(e) => setProbeQuestionsText(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: 100,
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

            {/* Action bar */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '10px 20px',
                  background: '#9e7f5a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  cursor: saving ? 'default' : 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {saving ? 'Saving…' : 'Save Override'}
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  color: '#9e7f5a',
                  border: '1px solid #9e7f5a',
                  borderRadius: 4,
                  cursor: generating ? 'default' : 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {generating ? 'Regenerating…' : 'Regenerate'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ScoreCard({ label, value }: { label: string; value: number }) {
  const color =
    value >= 80 ? '#a7f3a0' : value >= 60 ? '#fcd9a0' : value >= 40 ? '#9e7f5a' : '#ffb4b4';
  return (
    <div
      style={{
        padding: 16,
        background: '#0f1117',
        border: '1px solid #2a2a2a',
        borderRadius: 8,
      }}
    >
      <div style={{ color: '#999', fontSize: 12, marginBottom: 6 }}>{label}</div>
      <div style={{ color, fontSize: 28, fontWeight: 600 }}>{value}</div>
    </div>
  );
}
