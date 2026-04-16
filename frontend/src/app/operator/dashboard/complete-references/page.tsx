'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Reference = {
  name: string;
  title: string;
  company: string;
  relationship: string;
  email: string;
  linkedIn: string;
};

const EMPTY_REF: Reference = { name: '', title: '', company: '', relationship: '', email: '', linkedIn: '' };

const RELATIONSHIPS = [
  'CEO / Founder', 'Direct Manager', 'Peer (same level)', 'Direct Report',
  'Client / Customer', 'Board Member', 'Co-founder', 'Other',
];

export default function CompleteReferencesPage() {
  const router = useRouter();
  const [references, setReferences] = useState<Reference[]>([EMPTY_REF, EMPTY_REF]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function setRef(i: number, field: keyof Reference, val: string) {
    const updated = [...references];
    updated[i] = { ...updated[i], [field]: val };
    setReferences(updated);
  }

  function addReference() {
    setReferences([...references, EMPTY_REF]);
  }

  function removeReference(i: number) {
    if (references.length > 2) {
      setReferences(references.filter((_, idx) => idx !== i));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const filledRefs = references.filter(r => r.name && r.email && r.relationship);
    if (filledRefs.length < 2) {
      setError('Please provide at least 2 complete references (name, email, relationship required).');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/v1/applications/complete-references', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ references: filledRefs }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.message || 'Failed to save references');
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
        <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>Add Your References</h1>
        <p style={{ color: '#666' }}>
          We verify references before matching you with companies. Minimum 2 required.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {references.map((ref, i) => (
          <div key={i} style={{ padding: '1.5rem', backgroundColor: '#f9f7f5', borderRadius: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 500 }}>Reference {i + 1}</h3>
              {references.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeReference(i)}
                  disabled={loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#c00',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontSize: '0.875rem',
                  }}
                >
                  Remove
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Full name <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={ref.name}
                  onChange={e => setRef(i, 'name', e.target.value)}
                  placeholder="John Smith"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #ddd',
                    fontSize: '0.9rem',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Job title
                </label>
                <input
                  type="text"
                  value={ref.title}
                  onChange={e => setRef(i, 'title', e.target.value)}
                  placeholder="VP Sales"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #ddd',
                    fontSize: '0.9rem',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Company
                </label>
                <input
                  type="text"
                  value={ref.company}
                  onChange={e => setRef(i, 'company', e.target.value)}
                  placeholder="Acme Inc"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #ddd',
                    fontSize: '0.9rem',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Relationship <span style={{ color: 'red' }}>*</span>
                </label>
                <select
                  required
                  value={ref.relationship}
                  onChange={e => setRef(i, 'relationship', e.target.value)}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #ddd',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="">Select...</option>
                  {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Email <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="email"
                  required
                  value={ref.email}
                  onChange={e => setRef(i, 'email', e.target.value)}
                  placeholder="john@example.com"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #ddd',
                    fontSize: '0.9rem',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={ref.linkedIn}
                  onChange={e => setRef(i, 'linkedIn', e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #ddd',
                    fontSize: '0.9rem',
                  }}
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addReference}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: '1px solid #ddd',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            color: '#9e7f5a',
          }}
        >
          + Add reference
        </button>

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
          {loading ? 'Saving...' : 'Save references →'}
        </button>
      </form>
    </div>
  );
}
