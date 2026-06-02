'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';

const CASE_STUDY_PROMPT = `Scenario: An Indian B2B SaaS company (30 employees, $2M ARR, strong product-market fit in India) wants to break into the UK mid-market. They have no existing UK relationships, a basic pitch deck, and a £150k budget for the next 12 months.

In 300–500 words, describe: (1) How you would approach the first 30 days — what would you do, in what order, and why. (2) How you would identify and qualify the first 10 target accounts. (3) One risk you foresee and how you'd mitigate it.`;

const AVAILABILITY_OPTIONS = [
  { value: 'H5_10', label: '5–10 hours / week' },
  { value: 'H10_20', label: '10–20 hours / week' },
  { value: 'H20_30', label: '20–30 hours / week' },
  { value: 'FULL_FRACTIONAL', label: '30+ hours / week (full fractional)' },
];

const ENGAGEMENT_STRUCTURES = [
  'Monthly retainer', 'Sprint (30-day)', 'Success-fee', 'Hybrid (cash + equity)', 'Consultation / advisory',
];

function CompleteAssessmentContent() {
  const router = useRouter();
  const [form, setForm] = useState({
    caseStudyResponse: '',
    availabilityHours: '',
    earliestStart: '',
    rateExpectationMin: '',
    rateExpectationMax: '',
    preferredStructures: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const wordCount = form.caseStudyResponse.trim().split(/\s+/).filter(Boolean).length;

  function toggleStructure(s: string) {
    setForm(prev => ({
      ...prev,
      preferredStructures: prev.preferredStructures.includes(s)
        ? prev.preferredStructures.filter(x => x !== s)
        : [...prev.preferredStructures, s],
    }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (wordCount < 100) {
      setError('Your case study response must be at least 100 words.');
      return;
    }
    if (!form.availabilityHours) {
      setError('Please select your availability.');
      return;
    }
    if (!form.rateExpectationMin || !form.rateExpectationMax) {
      setError('Please provide your rate expectation range.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/applications/complete-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          caseStudyResponse: form.caseStudyResponse,
          availabilityHours: form.availabilityHours,
          earliestStart: form.earliestStart || undefined,
          rateExpectationMin: parseInt(form.rateExpectationMin, 10) || undefined,
          rateExpectationMax: parseInt(form.rateExpectationMax, 10) || undefined,
          rateCurrency: 'USD',
          preferredStructures: form.preferredStructures,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save assessment.');

      setSuccess(true);
      setTimeout(() => router.push('/operator/dashboard'), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>Assessment saved ✓</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>Redirecting to your dashboard...</p>
      </div>
    );
  }

  const fieldStyle = { width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', background: 'var(--color-bg)' };

  return (
    <div style={{ maxWidth: '680px', margin: '3rem auto', padding: '0 1.5rem' }}>
      <a href="/operator/dashboard" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'inline-block', marginBottom: '1.5rem' }}>
        ← Back to dashboard
      </a>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Complete your assessment</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
        Complete the case study and commercial details. This is required before you can unlock matching.
      </p>

      {error && (
        <div style={{ padding: '0.75rem', background: '#fef2f2', color: '#b91c1c', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Case study */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            Case study response *
          </label>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', background: 'var(--color-surface, #f0ece6)', padding: '1rem', marginBottom: '0.75rem', lineHeight: 1.6 }}>
            {CASE_STUDY_PROMPT}
          </div>
          <textarea
            rows={12}
            value={form.caseStudyResponse}
            onChange={e => setForm(prev => ({ ...prev, caseStudyResponse: e.target.value }))}
            placeholder="Write your response here (minimum 100 words)..."
            disabled={loading}
            style={{ ...fieldStyle, resize: 'vertical' }}
          />
          <p style={{ fontSize: '0.75rem', color: wordCount >= 100 ? 'var(--color-text-muted)' : '#b91c1c', marginTop: '0.25rem' }}>
            {wordCount} words {wordCount < 100 ? `(need ${100 - wordCount} more)` : '✓'}
          </p>
        </div>

        {/* Availability */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Availability *</label>
          <select value={form.availabilityHours} onChange={e => setForm(prev => ({ ...prev, availabilityHours: e.target.value }))} style={fieldStyle} disabled={loading}>
            <option value="">Select availability...</option>
            {AVAILABILITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Earliest start */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Earliest start date</label>
          <input type="date" value={form.earliestStart} onChange={e => setForm(prev => ({ ...prev, earliestStart: e.target.value }))} style={fieldStyle} disabled={loading} />
        </div>

        {/* Rate */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Monthly rate expectation (USD) *</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Minimum</label>
              <input type="number" min={0} value={form.rateExpectationMin} onChange={e => setForm(prev => ({ ...prev, rateExpectationMin: e.target.value }))} placeholder="e.g. 3000" style={fieldStyle} disabled={loading} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Maximum</label>
              <input type="number" min={0} value={form.rateExpectationMax} onChange={e => setForm(prev => ({ ...prev, rateExpectationMax: e.target.value }))} placeholder="e.g. 6000" style={fieldStyle} disabled={loading} />
            </div>
          </div>
        </div>

        {/* Preferred structures */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Preferred engagement structures</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {ENGAGEMENT_STRUCTURES.map(s => (
              <button key={s} type="button" onClick={() => toggleStructure(s)} disabled={loading}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', border: '1px solid var(--color-border)', cursor: 'pointer', background: form.preferredStructures.includes(s) ? 'var(--color-text-primary, #0f0f0f)' : 'transparent', color: form.preferredStructures.includes(s) ? 'var(--color-bg, #f5f3ef)' : 'inherit' }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading}
          style={{ padding: '0.75rem 2rem', background: 'var(--color-text-primary, #0f0f0f)', color: 'var(--color-bg, #f5f3ef)', border: 'none', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Saving…' : 'Save assessment →'}
        </button>
      </form>
    </div>
  );
}

export default function CompleteAssessmentPage() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <CompleteAssessmentContent />
      </ProtectedLayout>
    </AuthProvider>
  );
}
