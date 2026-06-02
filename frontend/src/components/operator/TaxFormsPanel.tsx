'use client';

/**
 * TaxFormsPanel
 *
 * Operator-facing surface for tax-form collection (W-9 / W-8BEN / GST/PAN / VAT).
 * Phase-3 plumbing per Implementation Plan §P3.5: collect basic info at onboarding,
 * full forms before MSA generation. UI persists status via the operator-tax-profile API.
 *
 * Backend gating logic (msaReady / payoutReady) is mirrored visually so the operator
 * sees what they still owe before unlocking the next stage.
 */

import { useEffect, useState } from 'react';
import {
  TaxFormStatus,
  TaxFormType,
  TaxProfileStatus,
  operatorTaxApi,
} from '@/lib/api-client';
import styles from './TaxFormsPanel.module.css';

const FORM_LABELS: Record<TaxFormType, string> = {
  W9: 'W-9 (US persons)',
  W8BEN: 'W-8BEN (non-US individuals)',
  W8BEN_E: 'W-8BEN-E (non-US entities)',
  GST_PAN: 'GST / PAN (India)',
  VAT: 'VAT (EU / UK)',
  OTHER: 'Other tax form',
};

const STATUS_PILL: Record<TaxFormStatus, string> = {
  NOT_STARTED: 'pill_muted',
  COLLECTED: 'pill_partial',
  UNDER_REVIEW: 'pill_partial',
  VERIFIED: 'pill_done',
  EXPIRED: 'pill_pending',
  REJECTED: 'pill_pending',
};

const STATUS_LABEL: Record<TaxFormStatus, string> = {
  NOT_STARTED: 'Not started',
  COLLECTED: 'Collected — pending review',
  UNDER_REVIEW: 'Under review',
  VERIFIED: 'Verified',
  EXPIRED: 'Expired',
  REJECTED: 'Rejected — please re-submit',
};

const COMMON_COUNTRIES = ['US', 'IN', 'GB', 'DE', 'FR', 'NL', 'IE', 'AE', 'SG', 'AU', 'CA'];
const COMMON_CURRENCIES = ['USD', 'INR', 'EUR', 'GBP', 'AUD', 'SGD', 'AED'];

export default function TaxFormsPanel() {
  const [status, setStatus] = useState<TaxProfileStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // Collection-form state
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<TaxFormType>('W9');
  const [taxResidencyCountry, setTaxResidencyCountry] = useState('US');
  const [payoutCountry, setPayoutCountry] = useState('US');
  const [payoutCurrency, setPayoutCurrency] = useState('USD');
  const [individualOrEntity, setIndividualOrEntity] = useState<'INDIVIDUAL' | 'ENTITY'>('INDIVIDUAL');
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      const data = await operatorTaxApi.getMine();
      setStatus(data);
    } catch {
      setErr('Could not load tax-profile status.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErr('');
    try {
      await operatorTaxApi.upsert({
        formType,
        formStatus: 'COLLECTED',
        taxResidencyCountry,
        payoutCountry,
        payoutCurrency,
        individualOrEntity,
      });
      setShowForm(false);
      await load();
    } catch {
      setErr('Could not save tax form. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className={styles.panel}><p className={styles.muted}>Loading tax forms…</p></div>;

  const formsByType = new Map(status?.forms.map((f) => [f.formType, f]) ?? []);
  const allTypes: TaxFormType[] = ['W9', 'W8BEN', 'W8BEN_E', 'GST_PAN', 'VAT'];
  const expected = new Set(status?.expectedForms ?? []);

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <div>
          <h2>Tax forms</h2>
          <p className={styles.sub}>Collected during onboarding. Required before your first MSA.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm((v) => !v)}
          style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
        >
          {showForm ? 'Cancel' : '+ Add / update form'}
        </button>
      </div>

      <div className={styles.gateRow}>
        <Gate label="Basic info" ok={!!status?.basicComplete} hint="Tax residency + payout preference set" />
        <Gate label="MSA-ready" ok={!!status?.msaReady} hint="At least one form collected" />
        <Gate label="Payout-ready" ok={!!status?.payoutReady} hint="At least one form verified by ops" />
      </div>

      <div className={styles.formsList}>
        {allTypes.map((type) => {
          const f = formsByType.get(type);
          const rowStatus: TaxFormStatus = f?.formStatus ?? 'NOT_STARTED';
          const isExpected = expected.has(type);
          return (
            <div key={type} className={`${styles.formRow} ${isExpected ? styles.formRowExpected : ''}`}>
              <div>
                <div className={styles.formName}>
                  {FORM_LABELS[type]}
                  {isExpected && <span className={styles.expectedTag}>Expected for your payout country</span>}
                </div>
                <div className={styles.formMeta}>
                  {f?.taxResidencyCountry ? `Residency: ${f.taxResidencyCountry}` : 'No data on file'}
                  {f?.payoutCountry ? ` · Payout: ${f.payoutCountry} ${f.payoutCurrency ?? ''}` : ''}
                  {f?.individualOrEntity ? ` · ${f.individualOrEntity}` : ''}
                </div>
              </div>
              <span className={`${styles.pill} ${styles[STATUS_PILL[rowStatus]]}`}>
                {STATUS_LABEL[rowStatus]}
              </span>
            </div>
          );
        })}
      </div>

      {showForm && (
        <form onSubmit={onSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Form type</span>
              <select value={formType} onChange={(e) => setFormType(e.target.value as TaxFormType)}>
                {allTypes.map((t) => <option key={t} value={t}>{FORM_LABELS[t]}</option>)}
              </select>
            </label>
            <label className={styles.field}>
              <span>Tax residency country</span>
              <select value={taxResidencyCountry} onChange={(e) => setTaxResidencyCountry(e.target.value)}>
                {COMMON_COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className={styles.field}>
              <span>Payout country</span>
              <select value={payoutCountry} onChange={(e) => setPayoutCountry(e.target.value)}>
                {COMMON_COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className={styles.field}>
              <span>Payout currency</span>
              <select value={payoutCurrency} onChange={(e) => setPayoutCurrency(e.target.value)}>
                {COMMON_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className={styles.field}>
              <span>Filing as</span>
              <select value={individualOrEntity} onChange={(e) => setIndividualOrEntity(e.target.value as 'INDIVIDUAL' | 'ENTITY')}>
                <option value="INDIVIDUAL">Individual</option>
                <option value="ENTITY">Entity / Company</option>
              </select>
            </label>
          </div>
          <p className={styles.muted}>
            Form upload is coming in Phase 6 — this records the basic info on file. Ops will reach out to collect the full document.
          </p>
          <div className={styles.formActions}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      )}

      {err && <div className={styles.err}>{err}</div>}
    </section>
  );
}

function Gate({ label, ok, hint }: { label: string; ok: boolean; hint: string }) {
  return (
    <div className={`${styles.gate} ${ok ? styles.gateOk : ''}`}>
      <span className={styles.gateIcon} aria-hidden>{ok ? '✓' : '○'}</span>
      <div>
        <div className={styles.gateLabel}>{label}</div>
        <div className={styles.gateHint}>{hint}</div>
      </div>
    </div>
  );
}
