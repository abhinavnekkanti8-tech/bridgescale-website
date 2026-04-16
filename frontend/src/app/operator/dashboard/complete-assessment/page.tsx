'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CompleteAssessmentPage() {
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

  const wordCount = form.caseStudyResponse.trim().split(/\s+/).filter(Boolean).length;

  const AVAILABILITY_OPTIONS = [
    { value: 'H5_10', label: '5–10 hours / week' },
    { value: 'H10_20', label: '10–20 hours / week' },
    { value: 'H20_30', label: '20–30 hours / week' },
    { value: 'FULL_FRACTIONAL', label: '30+ hours / week (full fractional)' },
  ];

  const STRUCTURES = [
    'Monthly retainer', 'Sprint (30-day)', 'Success-fee', 'Hybrid (cash + equity)', 'Consultation / advisory',
  ];

  function toggleStructure(s: string) {
    setForm(prev => ({
      ...prev,
      preferredStructures: prev.preferredStructures.includes(s)
        ? prev.preferredStructures.filter(x => x !== s)
        : [...prev.preferredStructures, s],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (wordCount < 100) {
      setError('Case study response must be at least 100 words.');
      return;
    }

    if (!form.availabilityHours) {
      setError('Please select your availability.');
      return;
    }

    if (!form.rateExpectationMin || !form.rateExpectationMax) {
      setError('Please provide both minimum and maximum rate expectations.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/v1/applications/complete-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseStudyResponse: form.caseStudyResponse,
          availabilityHours: form.availabilityHours,
          earliestStart: form.earliestStart || undefined,
          rateExpectationMin: parseInt(form.rateExpectationMin, 10),
          rateExpectationMax: parseInt(form.rateExpectationMax, 10),
          preferredStructures: form.preferredStructures,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.message || 'Failed to save assessment');
      }

      // Success - redirect
      setTimeout(() => {
        router.push('/operator/dashboard');
      }, 500);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem' }}>
      <Link href="/operator/dashboard" style={{ marginBottom: '2rem', display: 'inline-block', color: '#666' }}>
        ← Back to dashboard
      </Link>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>Complete Your Assessment</h1>
        <p style={{ color: '#666' }}>
          This helps companies understand your approach and match you with the right projects.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Case study */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            Case Study Response <span style={{ color: 'red' }}>*</span>
          </label>
          <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
            Min 100 words. Tell us how you would approach expanding a B2B SaaS company into a new market.
          </p>
          <textarea
            required
            value={form.caseStudyResponse}
            onChange={e => setForm(prev => ({ ...prev, caseStudyResponse: e.target.value }))}
            placeholder="Describe your approach..."
            rows={6}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid #ddd',
              fontFamily: 'inherit',
              fontSize: '1rem',
              resize: 'none',
            }}
          />
          <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: wordCount < 100 ? '#c00' : '#666' }}>
            {wordCount} / 100 words
          </div>
        </div>

        {/* Availability */}
        <div>
          <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 500 }}>
            Availability <span style={{ color: 'red' }}>*</span>
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {AVAILABILITY_OPTIONS.map(opt => (
              <label key={opt.value} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="availability"
                  value={opt.value}
                  checked={form.availabilityHours === opt.value}
                  onChange={e => setForm(prev => ({ ...prev, availabilityHours: e.target.value }))}
                  disabled={loading}
                  style={{ marginRight: '0.5rem' }}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {/* Earliest start */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            Earliest start date
          </label>
          <input
            type="date"
            value={form.earliestStart}
            onChange={e => setForm(prev => ({ ...prev, earliestStart: e.target.value }))}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid #ddd',
              fontSize: '1rem',
            }}
          />
        </div>

        {/* Rate expectations */}
        <div>
          <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 500 }}>
            Rate expectation (USD/month) <span style={{ color: 'red' }}>*</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Minimum</label>
              <input
                type="number"
                required
                value={form.rateExpectationMin}
                onChange={e => setForm(prev => ({ ...prev, rateExpectationMin: e.target.value }))}
                placeholder="5000"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #ddd',
                  fontSize: '1rem',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Maximum</label>
              <input
                type="number"
                required
                value={form.rateExpectationMax}
                onChange={e => setForm(prev => ({ ...prev, rateExpectationMax: e.target.value }))}
                placeholder="15000"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #ddd',
                  fontSize: '1rem',
                }}
              />
            </div>
          </div>
        </div>

        {/* Preferred structures */}
        <div>
          <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 500 }}>
            Preferred engagement structures
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {STRUCTURES.map(s => (
              <label key={s} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.preferredStructures.includes(s)}
                  onChange={() => toggleStructure(s)}
                  disabled={loading}
                  style={{ marginRight: '0.5rem' }}
                />
                {s}
              </label>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ padding: '1rem', backgroundColor: '#fee', color: '#c00', borderRadius: '0.5rem' }}>
            ⚠ {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#9e7f5a',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Saving...' : 'Save assessment →'}
        </button>
      </form>
    </div>
  );
}
