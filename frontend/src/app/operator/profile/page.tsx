'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { operatorsApi, ApiError } from '@/lib/api-client';
import styles from './page.module.css';

const LANES = [
  { value: 'PIPELINE_SPRINT', label: 'Pipeline Sprint' },
  { value: 'BD_SPRINT', label: 'BD Sprint' },
  { value: 'FRACTIONAL_RETAINER', label: 'Fractional Retainer' },
];
const REGIONS = [
  { value: 'EU', label: '🇪🇺 Europe' },
  { value: 'US', label: '🇺🇸 United States' },
  { value: 'AU', label: '🇦🇺 Australia' },
  { value: 'REST_OF_WORLD', label: '🌍 Rest of World' },
];
const BD_FUNCTIONS = ['Lead Generation', 'Account Management', 'Channel Sales', 'Partnership Development', 'Market Research', 'Strategic Alliances'];

type FormData = {
  lanes: string[];
  regions: string[];
  functions: string[];
  experienceTags: string;
  yearsExperience: string;
  linkedIn: string;
  availability: string;
  bio: string;
};

const initialForm: FormData = {
  lanes: [], regions: [], functions: [],
  experienceTags: '', yearsExperience: '', linkedIn: '', availability: '', bio: '',
};

function ProfileForm() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  function toggle(field: 'lanes' | 'regions' | 'functions', value: string) {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(value) ? f[field].filter((v) => v !== value) : [...f[field], value],
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const profile = await operatorsApi.createProfile({
        lanes: form.lanes,
        regions: form.regions,
        functions: form.functions,
        experienceTags: form.experienceTags.split(',').map((t) => t.trim()).filter(Boolean),
        yearsExperience: form.yearsExperience ? parseInt(form.yearsExperience) : undefined,
        linkedIn: form.linkedIn || undefined,
        availability: form.availability || undefined,
        bio: form.bio || undefined,
      } as any);
      // Trigger scoring
      await operatorsApi.requestScore(profile.id);
      setSuccess(true);
      setTimeout(() => router.push('/operator/dashboard'), 1500);
    } catch (err) {
      if (err instanceof ApiError) {
        const b = err.body as { message?: string | string[] };
        setError(Array.isArray(b?.message) ? b.message[0] : (b?.message ?? 'Submission failed'));
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (success) return (
    <div className={styles.page}>
      <div className={styles.successCard}>
        <span style={{ fontSize: '2.5rem' }}>✅</span>
        <h2>Profile Submitted!</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>Your quality score is being calculated. Redirecting to dashboard…</p>
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Operator Profile</h1>
        <p className={styles.subtitle}>Complete your professional profile to get scored and verified.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form} id="operator-profile-form">
        {/* Lanes */}
        <div className={styles.field}>
          <label className={styles.label}>Service Lanes * (select all that apply)</label>
          <div className={styles.checkGrid}>
            {LANES.map((l) => (
              <label key={l.value} className={`${styles.checkCard} ${form.lanes.includes(l.value) ? styles.selected : ''}`}>
                <input type="checkbox" checked={form.lanes.includes(l.value)} onChange={() => toggle('lanes', l.value)} className="sr-only" />
                {l.label}
              </label>
            ))}
          </div>
        </div>

        {/* Regions */}
        <div className={styles.field}>
          <label className={styles.label}>Target Regions * (select all that apply)</label>
          <div className={styles.checkGrid}>
            {REGIONS.map((r) => (
              <label key={r.value} className={`${styles.checkCard} ${form.regions.includes(r.value) ? styles.selected : ''}`}>
                <input type="checkbox" checked={form.regions.includes(r.value)} onChange={() => toggle('regions', r.value)} className="sr-only" />
                {r.label}
              </label>
            ))}
          </div>
        </div>

        {/* Functions */}
        <div className={styles.field}>
          <label className={styles.label}>BD Functions * (select all that apply)</label>
          <div className={styles.checkGrid}>
            {BD_FUNCTIONS.map((f) => (
              <label key={f} className={`${styles.checkCard} ${form.functions.includes(f) ? styles.selected : ''}`}>
                <input type="checkbox" checked={form.functions.includes(f)} onChange={() => toggle('functions', f)} className="sr-only" />
                {f}
              </label>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <label className={styles.label}>Years of Experience</label>
            <input id="yearsExperience" type="number" min="0" max="50" value={form.yearsExperience} onChange={(e) => setForm({ ...form, yearsExperience: e.target.value })} className={styles.input} placeholder="e.g. 8" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>LinkedIn URL</label>
            <input id="linkedIn" type="url" value={form.linkedIn} onChange={(e) => setForm({ ...form, linkedIn: e.target.value })} className={styles.input} placeholder="https://linkedin.com/in/…" />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Experience Tags (comma-separated)</label>
          <input id="experienceTags" type="text" value={form.experienceTags} onChange={(e) => setForm({ ...form, experienceTags: e.target.value })} className={styles.input} placeholder="e.g. SaaS, FinTech, Enterprise Sales" />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Availability</label>
          <input id="availability" type="text" value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} className={styles.input} placeholder="e.g. 20 hours/week, starting immediately" />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Professional Bio</label>
          <textarea id="bio" rows={5} maxLength={2000} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className={styles.textarea} placeholder="Tell startups about your background, approach, and key achievements…" />
        </div>

        {error && <div className={styles.errorBox}><span>⚠</span> {error}</div>}

        <div className={styles.nav}>
          <button id="submit-operator-profile" type="submit" className="btn btn-primary" disabled={!form.lanes.length || !form.regions.length || !form.functions.length || submitting}>
            {submitting ? 'Submitting…' : 'Submit Profile & Score →'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function OperatorProfilePage() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <ProfileForm />
      </ProtectedLayout>
    </AuthProvider>
  );
}
