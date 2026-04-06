'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './apply.module.css';

const INDUSTRIES = [
  'SaaS / Software', 'Deep Tech / AI', 'HealthTech', 'FinTech',
  'EdTech', 'AgriTech', 'CleanTech', 'Manufacturing', 'Logistics', 'Other',
];

const STAGES = ['Pre-Seed', 'Seed', 'Series A', 'Series B+', 'Bootstrapped'];

const NEED_AREAS = [
  'Pipeline generation & outbound sales',
  'Market entry & ICP validation',
  'Channel & partnership development',
  'Fractional sales leadership',
  'Revenue operating cadence',
  'Other',
];

const TARGET_MARKETS = ['EU', 'US', 'AU / New Zealand', 'UK', 'Singapore / SEA', 'UAE / Middle East', 'Canada', 'Rest of World'];

const BUDGET_BANDS = [
  '₹5L–₹10L total', '₹10L–₹25L total', '₹25L–₹50L total', '₹50L+ total',
];

const URGENCY_OPTIONS = [
  'Within 2 weeks', 'Within a month', '1–3 months', 'No fixed timeline',
];

const SALES_MOTIONS = ['Outbound', 'Inbound', 'Partner-led', 'Product-led', 'Blended / multiple'];

const ENGAGEMENT_MODELS = [
  'Sprint (30-day scoped project)',
  'Retainer (ongoing, 3+ months)',
  'Consultation / market entry report',
  'Hybrid (cash + equity)',
  'Not sure — open to recommendation',
];

type FormState = {
  name: string;
  email: string;
  companyName: string;
  companyWebsite: string;
  industry: string;
  companyStage: string;
  targetMarkets: string[];
  needArea: string;
  budgetRange: string;
  urgency: string;
  engagementModel: string;
  notes: string;
  salesMotion: string;
  teamStructure: string;
  hasDeck: boolean | null;
  hasDemo: boolean | null;
  hasCrm: boolean | null;
  previousAttempts: string;
  idealOutcome90d: string;
  specificTargets: string;
};

const INITIAL: FormState = {
  name: '', email: '',
  companyName: '', companyWebsite: '', industry: '', companyStage: '',
  targetMarkets: [], needArea: '', budgetRange: '', urgency: '',
  engagementModel: '', notes: '',
  salesMotion: '', teamStructure: '',
  hasDeck: null, hasDemo: null, hasCrm: null,
  previousAttempts: '', idealOutcome90d: '', specificTargets: '',
};

function optionalFilled(form: FormState): number {
  let count = 0;
  if (form.salesMotion) count++;
  if (form.teamStructure) count++;
  if (form.hasDeck !== null) count++;
  if (form.hasDemo !== null) count++;
  if (form.hasCrm !== null) count++;
  if (form.previousAttempts) count++;
  if (form.idealOutcome90d) count++;
  if (form.specificTargets) count++;
  return count;
}

const OPTIONAL_TOTAL = 8;

function diagnosisQuality(filled: number): { label: string; color: string } {
  if (filled >= 6) return { label: 'Excellent', color: '#2e7d52' };
  if (filled >= 3) return { label: 'Good', color: '#7E93B5' };
  return { label: 'Basic', color: '#9e9890' };
}

/** Load Razorpay checkout.js dynamically (idempotent) */
function loadRazorpay(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).Razorpay) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout.js'));
    document.head.appendChild(script);
  });
}

type PaymentInitResponse = {
  applicationId: string;
  status: string;
  provider: 'RAZORPAY' | 'STRIPE';
  keyId?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  prefill?: { name: string; email: string };
  dummyMode: boolean;
};

// ── Page states ────────────────────────────────────────────────────────────────
type PageState =
  | { phase: 'form' }
  | { phase: 'payment'; data: PaymentInitResponse }
  | { phase: 'processing' }
  | { phase: 'success' };

export default function CompanyApplyPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [optionalOpen, setOptionalOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState<PageState>({ phase: 'form' });

  const filled = optionalFilled(form);
  const quality = diagnosisQuality(filled);

  function set(field: keyof FormState, value: any) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function toggleMarket(m: string) {
    setForm(prev => ({
      ...prev,
      targetMarkets: prev.targetMarkets.includes(m)
        ? prev.targetMarkets.filter(x => x !== m)
        : [...prev.targetMarkets, m],
    }));
  }

  function toggleTriBool(field: 'hasDeck' | 'hasDemo' | 'hasCrm', val: boolean) {
    setForm(prev => ({ ...prev, [field]: prev[field] === val ? null : val }));
  }

  // ── Step 1: Submit form → get payment initiation data ─────────────────────
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.companyName || !form.industry ||
        !form.companyStage || form.targetMarkets.length === 0 ||
        !form.needArea || !form.budgetRange || !form.urgency) {
      setError('Please fill in all required fields before submitting.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        type: 'COMPANY',
        name: form.name,
        email: form.email,
        companyName: form.companyName,
        companyWebsite: form.companyWebsite || undefined,
        companyStage: form.companyStage,
        needArea: form.needArea,
        targetMarkets: form.targetMarkets.join(', '),
        engagementModel: form.engagementModel || undefined,
        budgetRange: form.budgetRange,
        urgency: form.urgency,
        notes: form.notes || undefined,
        salesMotion: form.salesMotion || undefined,
        teamStructure: form.teamStructure || undefined,
        hasDeck: form.hasDeck ?? undefined,
        hasDemo: form.hasDemo ?? undefined,
        hasCrm: form.hasCrm ?? undefined,
        previousAttempts: form.previousAttempts || undefined,
        idealOutcome90d: form.idealOutcome90d || undefined,
        specificTargets: form.specificTargets || undefined,
      };

      const res = await fetch('/api/v1/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data: PaymentInitResponse = await res.json();
      if (!res.ok) {
        const msg = Array.isArray((data as any)?.message) ? (data as any).message[0] : (data as any)?.message;
        throw new Error(msg || 'Submission failed. Please try again.');
      }

      // Show payment step
      setPage({ phase: 'payment', data });
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2a: Real Razorpay modal (live mode) ───────────────────────────────
  async function openRazorpayModal(data: PaymentInitResponse) {
    setError('');
    setLoading(true);
    try {
      await loadRazorpay();

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'BridgeScale',
        description: 'Company application fee',
        order_id: data.orderId,
        prefill: data.prefill,
        theme: { color: '#9e7f5a' },
        handler: async (response: any) => {
          setPage({ phase: 'processing' });
          try {
            const res = await fetch('/api/v1/applications/payment/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                applicationId: data.applicationId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            if (!res.ok) throw new Error('Payment verification failed.');
            setPage({ phase: 'success' });
            setTimeout(() => router.push(`/application/status?id=${data.applicationId}`), 1500);
          } catch (err: any) {
            setPage({ phase: 'payment', data });
            setError(err.message || 'Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setPage({ phase: 'payment', data });
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err.message || 'Could not open payment window.');
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2b: Dummy confirm (dev mode) ─────────────────────────────────────
  async function handleDummyConfirm(applicationId: string) {
    setError('');
    setLoading(true);
    setPage({ phase: 'processing' });
    try {
      const res = await fetch('/api/v1/applications/payment/dummy-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId }),
      });

      if (!res.ok) throw new Error('Dummy confirm failed.');
      setPage({ phase: 'success' });
      setTimeout(() => router.push(`/application/status?id=${applicationId}`), 1500);
    } catch (err: any) {
      setPage(prev => prev.phase === 'processing' ? { phase: 'payment', data: (prev as any).data } : prev);
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  }

  // ── Success screen ─────────────────────────────────────────────────────────
  if (page.phase === 'success' || page.phase === 'processing') {
    return (
      <div className={styles.page}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>{page.phase === 'success' ? '✓' : '…'}</div>
          <h2>{page.phase === 'success' ? 'Payment confirmed' : 'Processing payment…'}</h2>
          <p>
            {page.phase === 'success'
              ? 'Your application has been received. We\'ll begin generating your needs diagnosis shortly.'
              : 'Please wait while we confirm your payment.'}
          </p>
        </div>
      </div>
    );
  }

  // ── Payment screen ─────────────────────────────────────────────────────────
  if (page.phase === 'payment') {
    const { data } = page;
    return (
      <div className={styles.page}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>₹</div>
          <h2>Complete your payment</h2>
          <p style={{ marginBottom: '8px' }}>
            Your application has been saved. Pay the ₹15,000 application fee to begin your diagnosis.
          </p>
          {data.dummyMode && (
            <p style={{ fontSize: '12px', color: '#9e9890', marginBottom: '24px' }}>
              [Dev mode — payment is simulated]
            </p>
          )}
          {error && <div className={styles.errorBox} style={{ marginBottom: '16px' }}>⚠ {error}</div>}

          {data.dummyMode ? (
            <button
              className={styles.submitBtn}
              onClick={() => handleDummyConfirm(data.applicationId)}
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Processing…' : 'Simulate ₹15,000 payment →'}
            </button>
          ) : (
            <button
              className={styles.submitBtn}
              onClick={() => openRazorpayModal(data)}
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Opening payment…' : 'Pay ₹15,000 →'}
            </button>
          )}

          <p className={styles.submitNote} style={{ marginTop: '16px' }}>
            Secured by Razorpay. Fully credited if we can't find a match.
          </p>
        </div>
      </div>
    );
  }

  // ── Form screen ────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* ── Left panel ── */}
        <div className={styles.left}>
          <Link href="/for-companies" className={styles.backLink}>← For Companies</Link>
          <div className={styles.leftLabel}>Company application</div>
          <h1 className={styles.leftTitle}>Tell us what you need.</h1>
          <p className={styles.leftSub}>
            We'll use this information to generate a needs diagnosis — a structured
            analysis of your commercial gap and what fractional talent could move the needle.
          </p>

          <div className={styles.feeCard}>
            <div className={styles.feeLabel}>Application fee</div>
            <div className={styles.feeAmount}>₹15,000</div>
            <div className={styles.feeNote}>One-time. Payable after submitting this form. Fully credited if we can't find a match.</div>
          </div>

          <div className={styles.steps}>
            <div className={styles.step}><span>01</span> Submit this form</div>
            <div className={styles.step}><span>02</span> Pay ₹15,000 application fee</div>
            <div className={styles.step}><span>03</span> Receive AI-generated diagnosis</div>
            <div className={styles.step}><span>04</span> Review, approve, and get matched</div>
          </div>
        </div>

        {/* ── Form ── */}
        <div className={styles.right}>
          <form onSubmit={handleSubmit} className={styles.form}>

            {/* Contact */}
            <div className={styles.formSection}>
              <div className={styles.formSectionTitle}>Contact</div>
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label>Your full name <span className={styles.req}>*</span></label>
                  <input type="text" required value={form.name} onChange={e => set('name', e.target.value)}
                    placeholder="Ravi Kumar" disabled={loading} />
                </div>
                <div className={styles.field}>
                  <label>Email address <span className={styles.req}>*</span></label>
                  <input type="email" required value={form.email} onChange={e => set('email', e.target.value)}
                    placeholder="ravi@yourcompany.com" disabled={loading} />
                </div>
              </div>
            </div>

            {/* Company */}
            <div className={styles.formSection}>
              <div className={styles.formSectionTitle}>Your company</div>
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label>Company name <span className={styles.req}>*</span></label>
                  <input type="text" required value={form.companyName} onChange={e => set('companyName', e.target.value)}
                    placeholder="Acme Technologies Pvt. Ltd." disabled={loading} />
                </div>
                <div className={styles.field}>
                  <label>Website</label>
                  <input type="url" value={form.companyWebsite} onChange={e => set('companyWebsite', e.target.value)}
                    placeholder="https://yourcompany.com" disabled={loading} />
                </div>
              </div>
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label>Industry <span className={styles.req}>*</span></label>
                  <select required value={form.industry} onChange={e => set('industry', e.target.value)} disabled={loading}>
                    <option value="">Select industry...</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Funding stage <span className={styles.req}>*</span></label>
                  <select required value={form.companyStage} onChange={e => set('companyStage', e.target.value)} disabled={loading}>
                    <option value="">Select stage...</option>
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Need */}
            <div className={styles.formSection}>
              <div className={styles.formSectionTitle}>What you need</div>
              <div className={styles.field}>
                <label>Primary need area <span className={styles.req}>*</span></label>
                <div className={styles.radioCards}>
                  {NEED_AREAS.map(n => (
                    <label key={n} className={`${styles.radioCard} ${form.needArea === n ? styles.radioCardSelected : ''}`}>
                      <input type="radio" name="needArea" value={n} checked={form.needArea === n}
                        onChange={() => set('needArea', n)} disabled={loading} />
                      {n}
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.field}>
                <label>Target markets <span className={styles.req}>*</span></label>
                <div className={styles.chipGrid}>
                  {TARGET_MARKETS.map(m => (
                    <button key={m} type="button" disabled={loading}
                      className={`${styles.chip} ${form.targetMarkets.includes(m) ? styles.chipSelected : ''}`}
                      onClick={() => toggleMarket(m)}>{m}</button>
                  ))}
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label>Budget range <span className={styles.req}>*</span></label>
                  <select required value={form.budgetRange} onChange={e => set('budgetRange', e.target.value)} disabled={loading}>
                    <option value="">Select budget...</option>
                    {BUDGET_BANDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label>How soon do you need someone? <span className={styles.req}>*</span></label>
                  <select required value={form.urgency} onChange={e => set('urgency', e.target.value)} disabled={loading}>
                    <option value="">Select urgency...</option>
                    {URGENCY_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div className={styles.field}>
                <label>Preferred engagement type</label>
                <select value={form.engagementModel} onChange={e => set('engagementModel', e.target.value)} disabled={loading}>
                  <option value="">Not sure / open to recommendation</option>
                  {ENGAGEMENT_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className={styles.field}>
                <label>Anything else we should know?</label>
                <textarea rows={3} value={form.notes} onChange={e => set('notes', e.target.value)}
                  placeholder="Additional context about your company, market, or situation..." disabled={loading} />
              </div>
            </div>

            {/* Optional section */}
            <div className={styles.optionalSection}>
              <button type="button" className={styles.optionalToggle}
                onClick={() => setOptionalOpen(o => !o)}>
                <span>Help us diagnose your need more precisely</span>
                <span className={styles.optionalBadge}>
                  {filled}/{OPTIONAL_TOTAL} answered —{' '}
                  <span style={{ color: quality.color }}>Diagnosis quality: {quality.label}</span>
                </span>
                <span className={styles.optionalChevron}>{optionalOpen ? '↑' : '↓'}</span>
              </button>

              {optionalOpen && (
                <div className={styles.optionalFields}>
                  <div className={styles.optionalHint}>
                    Answering these questions helps our AI generate a more specific diagnosis.
                    All are optional — skip anything you'd rather not share.
                  </div>

                  <div className={styles.field}>
                    <label>Current sales motion</label>
                    <select value={form.salesMotion} onChange={e => set('salesMotion', e.target.value)} disabled={loading}>
                      <option value="">Select...</option>
                      {SALES_MOTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className={styles.field}>
                    <label>Who currently owns commercial activity in your company?</label>
                    <textarea rows={2} value={form.teamStructure} onChange={e => set('teamStructure', e.target.value)}
                      placeholder="e.g. Founder-led sales, a part-time SDR, no dedicated commercial person..." disabled={loading} />
                  </div>

                  <div className={styles.triBoolRow}>
                    {([
                      { field: 'hasDeck', label: 'We have a pitch deck / sales deck' },
                      { field: 'hasDemo', label: 'We have a live product demo' },
                      { field: 'hasCrm', label: 'We use a CRM (HubSpot, Salesforce, etc.)' },
                    ] as { field: 'hasDeck' | 'hasDemo' | 'hasCrm'; label: string }[]).map(({ field, label }) => (
                      <div key={field} className={styles.triBool}>
                        <span>{label}</span>
                        <div className={styles.triBoolButtons}>
                          <button type="button" disabled={loading}
                            className={form[field] === true ? styles.triBoolActive : ''}
                            onClick={() => toggleTriBool(field, true)}>Yes</button>
                          <button type="button" disabled={loading}
                            className={form[field] === false ? styles.triBoolActive : ''}
                            onClick={() => toggleTriBool(field, false)}>No</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.field}>
                    <label>Have you attempted international expansion before?</label>
                    <textarea rows={3} value={form.previousAttempts} onChange={e => set('previousAttempts', e.target.value)}
                      placeholder="What happened, what did you learn, why did it stall?" disabled={loading} />
                  </div>

                  <div className={styles.field}>
                    <label>What does success look like in 90 days?</label>
                    <textarea rows={3} value={form.idealOutcome90d} onChange={e => set('idealOutcome90d', e.target.value)}
                      placeholder="e.g. 8 qualified meetings in the UK, one signed pilot, a validated ICP..." disabled={loading} />
                  </div>

                  <div className={styles.field}>
                    <label>Any specific markets, accounts, or channels you want cracked?</label>
                    <textarea rows={2} value={form.specificTargets} onChange={e => set('specificTargets', e.target.value)}
                      placeholder="e.g. NHS in the UK, mid-market SaaS in Germany, BFSI in Singapore..." disabled={loading} />
                  </div>
                </div>
              )}
            </div>

            {error && <div className={styles.errorBox}>⚠ {error}</div>}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Submitting…' : 'Submit application — proceed to payment →'}
            </button>

            <p className={styles.submitNote}>
              After submitting, you'll be asked to pay the ₹15,000 application fee before your diagnosis is generated.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
