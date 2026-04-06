'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './apply.module.css';

// ── Constants ─────────────────────────────────────────────────────

const TALENT_CATEGORIES = [
  'Fractional Sales Leadership (VP Sales, CRO, Head of Sales)',
  'Fractional Sales Execution (SDR, BDR, Account Executive)',
  'Fractional BD & Partnerships',
];

const SENIORITY_LEVELS = [
  { value: 'IC', label: 'Individual Contributor (IC)' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'DIRECTOR', label: 'Director' },
  { value: 'VP', label: 'VP' },
  { value: 'C_SUITE', label: 'C-Suite (CRO, CSO, CCO)' },
];

const EMPLOYMENT_STATUSES = [
  { value: 'EMPLOYED_FULL_TIME', label: 'Employed full-time (side capacity)' },
  { value: 'FREELANCE', label: 'Freelance / independent consultant' },
  { value: 'BETWEEN_ROLES', label: 'Between roles' },
  { value: 'OTHER', label: 'Other' },
];

const MARKETS = ['EU', 'UK', 'US', 'Canada', 'AU / NZ', 'Singapore / SEA', 'UAE / Middle East', 'Rest of World'];

const DEAL_SIZE_RANGES = ['<$10k', '$10k–$50k', '$50k–$200k', '$200k–$500k', '>$500k', 'Not applicable'];

const CONFIDENCE_LEVELS = ['STRONG', 'MODERATE', 'LIGHT'];

const RELATIONSHIP_TYPES = [
  'CEO / Founder', 'Direct Manager', 'Peer (same level)', 'Direct Report',
  'Client / Customer', 'Board Member', 'Co-founder', 'Other',
];

const AVAILABILITY_OPTIONS = [
  { value: 'H5_10', label: '5–10 hours / week' },
  { value: 'H10_20', label: '10–20 hours / week' },
  { value: 'H20_30', label: '20–30 hours / week' },
  { value: 'FULL_FRACTIONAL', label: '30+ hours / week (full fractional)' },
];

const ENGAGEMENT_STRUCTURES = [
  'Monthly retainer', 'Sprint (30-day)', 'Success-fee', 'Hybrid (cash + equity)', 'Consultation / advisory',
];

const LANGUAGES = ['English', 'Hindi', 'Telugu', 'Tamil', 'Kannada', 'Marathi', 'German', 'French', 'Dutch', 'Spanish', 'Mandarin', 'Other'];

// ── Types ────────────────────────────────────────────────────────

type DealRow = { company: string; dealSizeRange: string; geography: string; outcome: string; role: string };
type MarketConf = { market: string; confidence: string };
type ReferenceRow = { name: string; title: string; company: string; relationship: string; email: string; linkedIn: string };

type FormState = {
  // Step 1 — Profile
  name: string; email: string; linkedInUrl: string;
  currentRole: string; currentEmployer: string; employmentStatus: string;
  location: string; yearsExperience: string; seniorityLevel: string; talentCategory: string;
  // Step 2 — Track record
  dealHistory: DealRow[];
  confidenceMarkets: MarketConf[];
  languagesSpoken: string[];
  // Step 3 — References
  references: ReferenceRow[];
  // Step 4 — Assessment & commercials
  caseStudyResponse: string;
  availabilityHours: string; earliestStart: string;
  rateExpectationMin: string; rateExpectationMax: string;
  preferredStructures: string[];
};

const EMPTY_DEAL: DealRow = { company: '', dealSizeRange: '', geography: '', outcome: '', role: '' };
const EMPTY_REF: ReferenceRow = { name: '', title: '', company: '', relationship: '', email: '', linkedIn: '' };

const INITIAL: FormState = {
  name: '', email: '', linkedInUrl: '',
  currentRole: '', currentEmployer: '', employmentStatus: '',
  location: '', yearsExperience: '', seniorityLevel: '', talentCategory: '',
  dealHistory: [{ ...EMPTY_DEAL }, { ...EMPTY_DEAL }, { ...EMPTY_DEAL }],
  confidenceMarkets: MARKETS.map(m => ({ market: m, confidence: '' })),
  languagesSpoken: [],
  references: [{ ...EMPTY_REF }, { ...EMPTY_REF }, { ...EMPTY_REF }],
  caseStudyResponse: '',
  availabilityHours: '', earliestStart: '',
  rateExpectationMin: '', rateExpectationMax: '',
  preferredStructures: [],
};

const STEPS = ['Profile', 'Track record', 'References', 'Assessment & terms'];

const CASE_STUDY_PROMPT = `Scenario: An Indian B2B SaaS company (30 employees, $2M ARR, strong product-market fit in India) wants to break into the UK mid-market. They have no existing UK relationships, a basic pitch deck, and a £150k budget for the next 12 months.

In 300–500 words, describe: (1) How you would approach the first 30 days — what would you do, in what order, and why. (2) How you would identify and qualify the first 10 target accounts. (3) One risk you foresee and how you'd mitigate it.`;

export default function TalentApplyPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const wordCount = form.caseStudyResponse.trim().split(/\s+/).filter(Boolean).length;

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function setDeal(i: number, field: keyof DealRow, val: string) {
    setForm(prev => {
      const arr = [...prev.dealHistory];
      arr[i] = { ...arr[i], [field]: val };
      return { ...prev, dealHistory: arr };
    });
  }

  function setRef(i: number, field: keyof ReferenceRow, val: string) {
    setForm(prev => {
      const arr = [...prev.references];
      arr[i] = { ...arr[i], [field]: val };
      return { ...prev, references: arr };
    });
  }

  function setMarketConf(market: string, confidence: string) {
    setForm(prev => ({
      ...prev,
      confidenceMarkets: prev.confidenceMarkets.map(m =>
        m.market === market ? { ...m, confidence: m.confidence === confidence ? '' : confidence } : m
      ),
    }));
  }

  function toggleLanguage(lang: string) {
    setForm(prev => ({
      ...prev,
      languagesSpoken: prev.languagesSpoken.includes(lang)
        ? prev.languagesSpoken.filter(l => l !== lang)
        : [...prev.languagesSpoken, lang],
    }));
  }

  function toggleStructure(s: string) {
    setForm(prev => ({
      ...prev,
      preferredStructures: prev.preferredStructures.includes(s)
        ? prev.preferredStructures.filter(x => x !== s)
        : [...prev.preferredStructures, s],
    }));
  }

  function validateStep(): string | null {
    if (step === 0) {
      if (!form.name || !form.email || !form.linkedInUrl ||
          !form.currentRole || !form.employmentStatus ||
          !form.location || !form.yearsExperience ||
          !form.seniorityLevel || !form.talentCategory) {
        return 'Please fill in all required fields.';
      }
    }
    if (step === 2) {
      const filled = form.references.filter(r => r.name && r.email && r.relationship);
      if (filled.length < 2) return 'Please provide at least 2 references with name, email, and relationship.';
    }
    if (step === 3) {
      if (wordCount < 100) return 'Your case study response must be at least 100 words.';
      if (!form.availabilityHours) return 'Please select your availability.';
      if (!form.rateExpectationMin || !form.rateExpectationMax) return 'Please provide your rate expectation range.';
    }
    return null;
  }

  function next() {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    setStep(s => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo(0, 0);
  }

  function prev() {
    setError('');
    setStep(s => Math.max(s - 1, 0));
    window.scrollTo(0, 0);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);

    try {
      const filledDeals = form.dealHistory.filter(d => d.company || d.outcome);
      const filledMarkets = form.confidenceMarkets.filter(m => m.confidence);
      const filledRefs = form.references.filter(r => r.name && r.email);

      const payload = {
        type: 'TALENT',
        name: form.name,
        email: form.email,
        linkedInUrl: form.linkedInUrl,
        currentRole: form.currentRole,
        currentEmployer: form.currentEmployer || undefined,
        employmentStatus: form.employmentStatus,
        location: form.location,
        yearsExperience: parseInt(form.yearsExperience, 10) || undefined,
        seniorityLevel: form.seniorityLevel,
        talentCategory: form.talentCategory,
        dealHistory: filledDeals.length > 0 ? filledDeals : undefined,
        confidenceMarkets: filledMarkets.length > 0 ? filledMarkets : undefined,
        languagesSpoken: form.languagesSpoken,
        references: filledRefs,
        caseStudyResponse: form.caseStudyResponse,
        availabilityHours: form.availabilityHours,
        earliestStart: form.earliestStart || undefined,
        rateExpectationMin: parseInt(form.rateExpectationMin, 10) || undefined,
        rateExpectationMax: parseInt(form.rateExpectationMax, 10) || undefined,
        rateCurrency: 'USD',
        preferredStructures: form.preferredStructures,
      };

      const res = await fetch('/api/v1/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        const msg = Array.isArray(data?.message) ? data.message[0] : data?.message;
        throw new Error(msg || 'Submission failed. Please try again.');
      }

      if (data.status === 'SUBMITTED') {
        // Dummy mode: backend auto-confirmed payment, go straight to status
        setSubmitted(true);
        setTimeout(() => router.push(`/application/status?id=${data.applicationId}`), 1500);
      } else if (data.checkoutUrl) {
        // Live Stripe mode: redirect to Stripe Checkout
        window.location.href = data.checkoutUrl;
      } else {
        // Fallback: show success and redirect
        setSubmitted(true);
        setTimeout(() => router.push(`/application/status?id=${data.applicationId}`), 1500);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className={styles.page}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>✓</div>
          <h2>Application received</h2>
          <p>We'll review your application and be in touch within 3–5 business days. Check your email for next steps.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* ── Left panel ── */}
        <div className={styles.left}>
          <Link href="/for-talent" className={styles.backLink}>← For Talent</Link>
          <div className={styles.leftLabel}>Talent application</div>
          <h1 className={styles.leftTitle}>Join the network.</h1>
          <p className={styles.leftSub}>
            We vet every professional before they join. This application is the start of
            that process — be thorough. Strong applications move faster.
          </p>

          <div className={styles.feeCard}>
            <div className={styles.feeLabel}>Application fee</div>
            <div className={styles.feeAmount}>$50</div>
            <div className={styles.feeNote}>One-time. Covers the cost of our vetting process. Non-refundable.</div>
          </div>

          {/* Step progress */}
          <div className={styles.stepList}>
            {STEPS.map((s, i) => (
              <div key={s} className={`${styles.stepItem} ${i === step ? styles.stepActive : ''} ${i < step ? styles.stepDone : ''}`}>
                <div className={styles.stepDot}>{i < step ? '✓' : i + 1}</div>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Form ── */}
        <div className={styles.right}>
          <form onSubmit={step === STEPS.length - 1 ? handleSubmit : (e) => { e.preventDefault(); next(); }}
            className={styles.form}>

            <div className={styles.stepHeader}>
              <div className={styles.stepNum}>Step {step + 1} of {STEPS.length}</div>
              <h2 className={styles.stepTitle}>{STEPS[step]}</h2>
            </div>

            {/* ── Step 0: Profile ── */}
            {step === 0 && (
              <>
                <div className={styles.fieldRow}>
                  <Field label="Full name" req>
                    <input type="text" required value={form.name} onChange={e => set('name', e.target.value)}
                      placeholder="Priya Sharma" disabled={loading} />
                  </Field>
                  <Field label="Email address" req>
                    <input type="email" required value={form.email} onChange={e => set('email', e.target.value)}
                      placeholder="priya@example.com" disabled={loading} />
                  </Field>
                </div>

                <Field label="LinkedIn profile URL" req>
                  <input type="url" required value={form.linkedInUrl} onChange={e => set('linkedInUrl', e.target.value)}
                    placeholder="https://linkedin.com/in/priyasharma" disabled={loading} />
                </Field>

                <Field label="Talent category" req>
                  <div className={styles.radioCards}>
                    {TALENT_CATEGORIES.map(c => (
                      <label key={c} className={`${styles.radioCard} ${form.talentCategory === c ? styles.radioCardSelected : ''}`}>
                        <input type="radio" name="category" value={c} checked={form.talentCategory === c}
                          onChange={() => set('talentCategory', c)} disabled={loading} />
                        {c}
                      </label>
                    ))}
                  </div>
                </Field>

                <div className={styles.fieldRow}>
                  <Field label="Current role title" req>
                    <input type="text" required value={form.currentRole} onChange={e => set('currentRole', e.target.value)}
                      placeholder="VP Sales, EMEA" disabled={loading} />
                  </Field>
                  <Field label="Current employer">
                    <input type="text" value={form.currentEmployer} onChange={e => set('currentEmployer', e.target.value)}
                      placeholder="Company name (optional)" disabled={loading} />
                  </Field>
                </div>

                <div className={styles.fieldRow}>
                  <Field label="Employment status" req>
                    <select required value={form.employmentStatus} onChange={e => set('employmentStatus', e.target.value)} disabled={loading}>
                      <option value="">Select...</option>
                      {EMPLOYMENT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Based in" req>
                    <input type="text" required value={form.location} onChange={e => set('location', e.target.value)}
                      placeholder="London, UK" disabled={loading} />
                  </Field>
                </div>

                <div className={styles.fieldRow}>
                  <Field label="Years in B2B sales / BD" req>
                    <input type="number" required min={0} max={50} value={form.yearsExperience}
                      onChange={e => set('yearsExperience', e.target.value)}
                      placeholder="12" disabled={loading} />
                  </Field>
                  <Field label="Seniority level" req>
                    <select required value={form.seniorityLevel} onChange={e => set('seniorityLevel', e.target.value)} disabled={loading}>
                      <option value="">Select...</option>
                      {SENIORITY_LEVELS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </Field>
                </div>
              </>
            )}

            {/* ── Step 1: Track record ── */}
            {step === 1 && (
              <>
                <div className={styles.sectionTitle}>Deal & engagement history</div>
                <p className={styles.sectionHint}>
                  Share up to 3 deals, projects, or engagements you've led. Company names can be anonymised.
                </p>

                {form.dealHistory.map((deal, i) => (
                  <div key={i} className={styles.dealRow}>
                    <div className={styles.dealRowNum}>{i + 1}</div>
                    <div className={styles.dealRowFields}>
                      <div className={styles.fieldRow}>
                        <Field label="Company (or type, e.g. 'UK SaaS')">
                          <input type="text" value={deal.company} onChange={e => setDeal(i, 'company', e.target.value)}
                            placeholder="Acme Corp (or 'UK HealthTech')" disabled={loading} />
                        </Field>
                        <Field label="Deal size range">
                          <select value={deal.dealSizeRange} onChange={e => setDeal(i, 'dealSizeRange', e.target.value)} disabled={loading}>
                            <option value="">Select...</option>
                            {DEAL_SIZE_RANGES.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </Field>
                      </div>
                      <div className={styles.fieldRow}>
                        <Field label="Geography">
                          <input type="text" value={deal.geography} onChange={e => setDeal(i, 'geography', e.target.value)}
                            placeholder="e.g. Germany, UK mid-market" disabled={loading} />
                        </Field>
                        <Field label="Your role">
                          <input type="text" value={deal.role} onChange={e => setDeal(i, 'role', e.target.value)}
                            placeholder="e.g. Lead AE, fractional VP Sales" disabled={loading} />
                        </Field>
                      </div>
                      <Field label="Outcome">
                        <input type="text" value={deal.outcome} onChange={e => setDeal(i, 'outcome', e.target.value)}
                          placeholder="e.g. Closed £200k ACV, built 40-account pipeline" disabled={loading} />
                      </Field>
                    </div>
                  </div>
                ))}

                <div className={styles.sectionTitle} style={{ marginTop: 32 }}>Market activation confidence</div>
                <p className={styles.sectionHint}>
                  For each market, indicate how confident you are in activating real relationships and opportunities. Leave blank if not applicable.
                </p>

                <div className={styles.marketTable}>
                  <div className={styles.marketTableHeader}>
                    <span>Market</span>
                    {CONFIDENCE_LEVELS.map(c => <span key={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</span>)}
                  </div>
                  {form.confidenceMarkets.map(({ market, confidence }) => (
                    <div key={market} className={styles.marketTableRow}>
                      <span className={styles.marketName}>{market}</span>
                      {CONFIDENCE_LEVELS.map(c => (
                        <button key={c} type="button" disabled={loading}
                          className={`${styles.confBtn} ${confidence === c ? styles.confBtnActive : ''}`}
                          onClick={() => setMarketConf(market, c)}>{confidence === c ? '●' : '○'}</button>
                      ))}
                    </div>
                  ))}
                </div>

                <div className={styles.sectionTitle} style={{ marginTop: 32 }}>Languages spoken</div>
                <div className={styles.chipGrid}>
                  {LANGUAGES.map(l => (
                    <button key={l} type="button" disabled={loading}
                      className={`${styles.chip} ${form.languagesSpoken.includes(l) ? styles.chipSelected : ''}`}
                      onClick={() => toggleLanguage(l)}>{l}</button>
                  ))}
                </div>
              </>
            )}

            {/* ── Step 2: References ── */}
            {step === 2 && (
              <>
                <p className={styles.sectionHint} style={{ marginBottom: 32 }}>
                  Provide at least 2 professional references. These should be senior leaders, direct managers, clients,
                  or peers who can speak to the quality of your commercial work. References may be contacted if you are
                  shortlisted for an engagement.
                </p>

                {form.references.map((ref, i) => (
                  <div key={i} className={styles.refCard}>
                    <div className={styles.refCardNum}>Reference {i + 1}{i < 2 && <span className={styles.req}> *</span>}</div>
                    <div className={styles.fieldRow}>
                      <Field label="Full name">
                        <input type="text" value={ref.name} onChange={e => setRef(i, 'name', e.target.value)}
                          placeholder="James Wilson" disabled={loading} />
                      </Field>
                      <Field label="Title / role">
                        <input type="text" value={ref.title} onChange={e => setRef(i, 'title', e.target.value)}
                          placeholder="CEO, VP Sales..." disabled={loading} />
                      </Field>
                    </div>
                    <div className={styles.fieldRow}>
                      <Field label="Company">
                        <input type="text" value={ref.company} onChange={e => setRef(i, 'company', e.target.value)}
                          placeholder="Company name" disabled={loading} />
                      </Field>
                      <Field label="Your relationship">
                        <select value={ref.relationship} onChange={e => setRef(i, 'relationship', e.target.value)} disabled={loading}>
                          <option value="">Select relationship...</option>
                          {RELATIONSHIP_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </Field>
                    </div>
                    <div className={styles.fieldRow}>
                      <Field label="Email address">
                        <input type="email" value={ref.email} onChange={e => setRef(i, 'email', e.target.value)}
                          placeholder="james@company.com" disabled={loading} />
                      </Field>
                      <Field label="LinkedIn URL">
                        <input type="url" value={ref.linkedIn} onChange={e => setRef(i, 'linkedIn', e.target.value)}
                          placeholder="https://linkedin.com/in/..." disabled={loading} />
                      </Field>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* ── Step 3: Assessment & commercials ── */}
            {step === 3 && (
              <>
                <div className={styles.sectionTitle}>Domain assessment</div>
                <div className={styles.caseStudyPrompt}>
                  <div className={styles.caseStudyLabel}>Case study prompt</div>
                  <p>{CASE_STUDY_PROMPT}</p>
                </div>

                <Field label={`Your response (${wordCount} / 300–500 words)`}>
                  <textarea rows={14} value={form.caseStudyResponse}
                    onChange={e => set('caseStudyResponse', e.target.value)}
                    placeholder="Write your response here..."
                    className={wordCount > 0 && wordCount < 100 ? styles.fieldError : ''}
                    disabled={loading} />
                  {wordCount > 0 && wordCount < 100 && (
                    <span className={styles.fieldErrorMsg}>Minimum 100 words — you have {wordCount}.</span>
                  )}
                </Field>

                <div className={styles.sectionTitle} style={{ marginTop: 32 }}>Availability & terms</div>

                <Field label="Availability" req>
                  <div className={styles.radioCards}>
                    {AVAILABILITY_OPTIONS.map(a => (
                      <label key={a.value} className={`${styles.radioCard} ${form.availabilityHours === a.value ? styles.radioCardSelected : ''}`}>
                        <input type="radio" name="availability" value={a.value} checked={form.availabilityHours === a.value}
                          onChange={() => set('availabilityHours', a.value)} disabled={loading} />
                        {a.label}
                      </label>
                    ))}
                  </div>
                </Field>

                <Field label="Earliest start date">
                  <input type="date" value={form.earliestStart} onChange={e => set('earliestStart', e.target.value)}
                    disabled={loading} />
                </Field>

                <div className={styles.fieldRow}>
                  <Field label="Rate expectation — min (USD/month)" req>
                    <input type="number" min={0} value={form.rateExpectationMin}
                      onChange={e => set('rateExpectationMin', e.target.value)}
                      placeholder="2000" disabled={loading} />
                  </Field>
                  <Field label="Rate expectation — max (USD/month)" req>
                    <input type="number" min={0} value={form.rateExpectationMax}
                      onChange={e => set('rateExpectationMax', e.target.value)}
                      placeholder="6000" disabled={loading} />
                  </Field>
                </div>

                <Field label="Preferred engagement structures">
                  <div className={styles.chipGrid}>
                    {ENGAGEMENT_STRUCTURES.map(s => (
                      <button key={s} type="button" disabled={loading}
                        className={`${styles.chip} ${form.preferredStructures.includes(s) ? styles.chipSelected : ''}`}
                        onClick={() => toggleStructure(s)}>{s}</button>
                    ))}
                  </div>
                </Field>
              </>
            )}

            {error && <div className={styles.errorBox}>⚠ {error}</div>}

            {/* Navigation */}
            <div className={styles.navRow}>
              {step > 0 && (
                <button type="button" className={styles.prevBtn} onClick={prev} disabled={loading}>
                  ← Back
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button type="submit" className={styles.nextBtn} disabled={loading}>
                  Continue →
                </button>
              ) : (
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit application →'}
                </button>
              )}
            </div>

            {step === STEPS.length - 1 && (
              <p className={styles.submitNote}>
                After submitting, you'll be asked to pay the $50 application fee before your pre-screen begins.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Field helper component ────────────────────────────────────────
function Field({ label, req, children }: { label: string; req?: boolean; children: React.ReactNode }) {
  return (
    <div className={styles.field}>
      <label>{label}{req && <span className={styles.req}> *</span>}</label>
      {children}
    </div>
  );
}
