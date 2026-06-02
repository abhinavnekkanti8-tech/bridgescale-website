'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';

interface Reference {
  name: string;
  title: string;
  company: string;
  relationship: string;
  email: string;
  linkedIn: string;
}

const EMPTY_REF: Reference = { name: '', title: '', company: '', relationship: '', email: '', linkedIn: '' };

function CompleteReferencesContent() {
  const router = useRouter();
  const [references, setReferences] = useState<Reference[]>([
    { ...EMPTY_REF },
    { ...EMPTY_REF },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const updateRef = (index: number, field: keyof Reference, value: string) => {
    const updated = [...references];
    updated[index] = { ...updated[index], [field]: value };
    setReferences(updated);
  };

  const addReference = () => {
    setReferences([...references, { ...EMPTY_REF }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const filledRefs = references.filter(r => r.name && r.email);
    if (filledRefs.length < 2) {
      setError('Please provide at least 2 references with name and email.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/v1/applications/complete-references', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ references: filledRefs }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save references.');

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
        <h2>References saved ✓</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '640px', margin: '3rem auto', padding: '0 1.5rem' }}>
      <a href="/operator/dashboard" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'inline-block', marginBottom: '1.5rem' }}>
        ← Back to dashboard
      </a>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Complete your references</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
        Provide at least 2 professional references. This is required before you can unlock matching.
      </p>

      {error && (
        <div style={{ padding: '0.75rem', background: '#fef2f2', color: '#b91c1c', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {references.map((ref, i) => (
          <div key={i} style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>
              Reference {i + 1}{i < 2 ? ' *' : ' (optional)'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Full name *</label>
                <input type="text" value={ref.name} onChange={e => updateRef(i, 'name', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', background: 'var(--color-bg)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Email *</label>
                <input type="email" value={ref.email} onChange={e => updateRef(i, 'email', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', background: 'var(--color-bg)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Title / Role</label>
                <input type="text" value={ref.title} onChange={e => updateRef(i, 'title', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', background: 'var(--color-bg)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Company</label>
                <input type="text" value={ref.company} onChange={e => updateRef(i, 'company', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', background: 'var(--color-bg)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Relationship</label>
                <input type="text" value={ref.relationship} onChange={e => updateRef(i, 'relationship', e.target.value)}
                  placeholder="e.g. CEO / Founder, Direct Manager"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', background: 'var(--color-bg)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem' }}>LinkedIn URL</label>
                <input type="url" value={ref.linkedIn} onChange={e => updateRef(i, 'linkedIn', e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', background: 'var(--color-bg)' }} />
              </div>
            </div>
          </div>
        ))}

        {references.length < 5 && (
          <button type="button" onClick={addReference}
            style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.5rem' }}>
            + Add another reference
          </button>
        )}

        <button type="submit" disabled={loading}
          style={{ padding: '0.75rem 2rem', background: 'var(--color-text-primary, #0f0f0f)', color: 'var(--color-bg, #f5f3ef)', border: 'none', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Saving…' : 'Save references →'}
        </button>
      </form>
    </div>
  );
}

export default function CompleteReferencesPage() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <CompleteReferencesContent />
      </ProtectedLayout>
    </AuthProvider>
  );
}
