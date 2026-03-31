'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { startupsApi, ApiError } from '@/lib/api-client';
import styles from './page.module.css';

const STEPS = ['Company Info', 'Market & Motion', 'Readiness Check', 'Review'];

const INDUSTRIES = ['SaaS', 'FinTech', 'EdTech', 'HealthTech', 'AgriTech', 'CleanTech', 'E-Commerce', 'Logistics', 'AI/ML', 'Other'];
const STAGES = [
  { value: 'PRE_SEED', label: 'Pre-Seed' },
  { value: 'SEED', label: 'Seed' },
  { value: 'SERIES_A', label: 'Series A' },
  { value: 'SERIES_B_PLUS', label: 'Series B+' },
  { value: 'BOOTSTRAPPED', label: 'Bootstrapped' },
];
const SALES_MOTIONS = [
  { value: 'OUTBOUND', label: 'Outbound' },
  { value: 'INBOUND', label: 'Inbound' },
  { value: 'PARTNER_LED', label: 'Partner-Led' },
  { value: 'PRODUCT_LED', label: 'Product-Led (PLG)' },
  { value: 'BLENDED', label: 'Blended' },
];
const BUDGET_BANDS = [
  { value: 'UNDER_2K', label: 'Under $2,000 / month' },
  { value: 'TWO_TO_5K', label: '$2,000 – $5,000 / month' },
  { value: 'FIVE_TO_10K', label: '$5,000 – $10,000 / month' },
  { value: 'ABOVE_10K', label: 'Above $10,000 / month' },
];
const MARKETS = [
  { value: 'EU', label: '🇪🇺 Europe (EU)' },
  { value: 'US', label: '🇺🇸 United States' },
  { value: 'AU', label: '🇦🇺 Australia' },
  { value: 'REST_OF_WORLD', label: '🌍 Rest of World' },
];

type FormData = {
  industry: string;
  stage: string;
  targetMarkets: string[];
  salesMotion: string;
  budgetBand: string;
  executionOwner: string;
  hasProductDemo: boolean;
  hasDeck: boolean;
  toolingReady: boolean;
  responsivenessCommit: boolean;
  additionalContext: string;
};

const initialForm: FormData = {
  industry: '',
  stage: '',
  targetMarkets: [],
  salesMotion: '',
  budgetBand: '',
  executionOwner: '',
  hasProductDemo: false,
  hasDeck: false,
  toolingReady: false,
  responsivenessCommit: false,
  additionalContext: '',
};

function ProfileForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  function toggleMarket(market: string) {
    setForm((f) => ({
      ...f,
      targetMarkets: f.targetMarkets.includes(market)
        ? f.targetMarkets.filter((m) => m !== market)
        : [...f.targetMarkets, market],
    }));
  }

  function canAdvance() {
    if (step === 0) return form.industry && form.stage;
    if (step === 1) return form.targetMarkets.length > 0 && form.salesMotion && form.budgetBand;
    return true;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (step < 3) { setStep((s) => s + 1); return; }

    setSubmitting(true);
    setError('');
    try {
      const profile = await startupsApi.createOrUpdate(form as any);
      // Fire off scoring and redirect to readiness view
      await startupsApi.requestScore(profile.id);
      router.push(`/startup/readiness?profileId=${profile.id}`);
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

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Startup Readiness Profile</h1>
        <p className={styles.subtitle}>Complete all four sections to receive your AI-powered Demand Readiness Score.</p>
      </div>

      {/* Progress */}
      <div className={styles.progress}>
        {STEPS.map((label, i) => (
          <div key={label} className={`${styles.progressStep} ${i <= step ? styles.active : ''} ${i < step ? styles.done : ''}`}>
            <div className={styles.progressDot}>{i < step ? '✓' : i + 1}</div>
            <span className={styles.progressLabel}>{label}</span>
            {i < STEPS.length - 1 && <div className={styles.progressLine} />}
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className={styles.form} id="intake-form">
        {/* Step 0: Company Info */}
        {step === 0 && (
          <div className={styles.formStep} id="step-company-info">
            <h2 className={styles.stepTitle}>Company Information</h2>
            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <label className={styles.label}>Industry *</label>
                <select id="industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className={styles.select} required>
                  <option value="">Select industry…</option>
                  {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Funding Stage *</label>
                <select id="stage" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} className={styles.select} required>
                  <option value="">Select stage…</option>
                  {STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Market & Motion */}
        {step === 1 && (
          <div className={styles.formStep} id="step-market-motion">
            <h2 className={styles.stepTitle}>Market & Sales Motion</h2>
            <div className={styles.field}>
              <label className={styles.label}>Target Markets * (select all that apply)</label>
              <div className={styles.checkGrid}>
                {MARKETS.map((m) => (
                  <label key={m.value} className={`${styles.checkCard} ${form.targetMarkets.includes(m.value) ? styles.checkCardSelected : ''}`}>
                    <input type="checkbox" checked={form.targetMarkets.includes(m.value)} onChange={() => toggleMarket(m.value)} className="sr-only" />
                    {m.label}
                  </label>
                ))}
              </div>
            </div>
            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <label className={styles.label}>Primary Sales Motion *</label>
                <select id="salesMotion" value={form.salesMotion} onChange={(e) => setForm({ ...form, salesMotion: e.target.value })} className={styles.select} required>
                  <option value="">Select…</option>
                  {SALES_MOTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Monthly Budget Band *</label>
                <select id="budgetBand" value={form.budgetBand} onChange={(e) => setForm({ ...form, budgetBand: e.target.value })} className={styles.select} required>
                  <option value="">Select…</option>
                  {BUDGET_BANDS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Readiness Check */}
        {step === 2 && (
          <div className={styles.formStep} id="step-readiness-check">
            <h2 className={styles.stepTitle}>Readiness Checklist</h2>
            <div className={styles.field}>
              <label className={styles.label}>Named Execution Owner</label>
              <input id="executionOwner" type="text" placeholder="e.g. Jane Doe, Head of Sales" value={form.executionOwner} onChange={(e) => setForm({ ...form, executionOwner: e.target.value })} className={styles.input} />
            </div>
            <div className={styles.checkList}>
              {[
                { key: 'hasProductDemo', label: '✅ We have a working product demo ready for sales calls' },
                { key: 'hasDeck', label: '✅ We have a sales deck or pitch deck prepared' },
                { key: 'toolingReady', label: '✅ We have a CRM or lead tracker in place' },
                { key: 'responsivenessCommit', label: '✅ We commit to responding to weekly updates within 24 hours' },
              ].map(({ key, label }) => (
                <label key={key} className={`${styles.checkRow} ${form[key as keyof FormData] ? styles.checkRowSelected : ''}`}>
                  <input type="checkbox" id={key} checked={Boolean(form[key as keyof FormData])} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Additional Context (optional)</label>
              <textarea id="additionalContext" rows={4} maxLength={2000} placeholder="Any additional context that would help the scoring AI…" value={form.additionalContext} onChange={(e) => setForm({ ...form, additionalContext: e.target.value })} className={styles.textarea} />
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className={styles.formStep} id="step-review">
            <h2 className={styles.stepTitle}>Review & Submit</h2>
            <div className={styles.reviewGrid}>
              <ReviewRow label="Industry" value={form.industry} />
              <ReviewRow label="Stage" value={STAGES.find(s => s.value === form.stage)?.label ?? form.stage} />
              <ReviewRow label="Target Markets" value={form.targetMarkets.map(m => MARKETS.find(x => x.value === m)?.label ?? m).join(', ')} />
              <ReviewRow label="Sales Motion" value={SALES_MOTIONS.find(s => s.value === form.salesMotion)?.label ?? form.salesMotion} />
              <ReviewRow label="Budget Band" value={BUDGET_BANDS.find(b => b.value === form.budgetBand)?.label ?? form.budgetBand} />
              <ReviewRow label="Execution Owner" value={form.executionOwner || 'Not specified'} />
              <ReviewRow label="Product Demo" value={form.hasProductDemo ? 'Yes' : 'No'} />
              <ReviewRow label="Sales Deck" value={form.hasDeck ? 'Yes' : 'No'} />
              <ReviewRow label="Tooling Ready" value={form.toolingReady ? 'Yes' : 'No'} />
              <ReviewRow label="Responsiveness Commit" value={form.responsivenessCommit ? 'Yes' : 'No'} />
            </div>
            <p className={styles.reviewNote}>
              Once submitted, our AI will score your readiness (takes ~5 seconds). You will be redirected to view your score.
            </p>
          </div>
        )}

        {error && <div className={styles.errorBox}><span>⚠</span> {error}</div>}

        {/* Navigation */}
        <div className={styles.nav}>
          {step > 0 && (
            <button type="button" id="back-btn" onClick={() => setStep((s) => s - 1)} className="btn btn-secondary">
              ← Back
            </button>
          )}
          <button
            id={step === 3 ? 'submit-btn' : 'next-btn'}
            type="submit"
            className="btn btn-primary"
            disabled={!canAdvance() || submitting}
          >
            {submitting ? 'Scoring…' : step === 3 ? 'Submit & Score →' : 'Next →'}
          </button>
        </div>
      </form>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.reviewRow}>
      <span className={styles.reviewLabel}>{label}</span>
      <span className={styles.reviewValue}>{value}</span>
    </div>
  );
}

export default function StartupProfilePage() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <ProfileForm />
      </ProtectedLayout>
    </AuthProvider>
  );
}
