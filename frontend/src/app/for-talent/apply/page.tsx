'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError, authApi } from '@/lib/api-client';
import { CURRENT_NOTICE_VERSION, PRIVACY_PATH, TERMS_PATH } from '@/lib/legal';
import styles from './apply.module.css';

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
const DEAL_SIZE_RANGES = ['<$10k', '$10k-$50k', '$50k-$200k', '$200k-$500k', '>$500k', 'Not applicable'];
const CONFIDENCE_LEVELS = ['STRONG', 'MODERATE', 'LIGHT'];
const RELATIONSHIP_TYPES = [
  'CEO / Founder', 'Direct Manager', 'Peer (same level)', 'Direct Report',
  'Client / Customer', 'Board Member', 'Co-founder', 'Other',
];
const AVAILABILITY_OPTIONS = [
  { value: 'H5_10', label: '5-10 hours / week' },
  { value: 'H10_20', label: '10-20 hours / week' },
  { value: 'H20_30', label: '20-30 hours / week' },
  { value: 'FULL_FRACTIONAL', label: '30+ hours / week (full fractional)' },
];
const ENGAGEMENT_STRUCTURES = [
  'Monthly retainer', 'Sprint (30-day)', 'Success-fee', 'Hybrid (cash + equity)', 'Consultation / advisory',
];
const LANGUAGES = ['English', 'Hindi', 'Telugu', 'Tamil', 'Kannada', 'Marathi', 'German', 'French', 'Dutch', 'Spanish', 'Mandarin', 'Other'];

type DealRow = { company: string; dealSizeRange: string; geography: string; outcome: string; role: string };
type MarketConf = { market: string; confidence: string };
type ReferenceRow = { name: string; title: string; company: string; relationship: string; email: string; linkedIn: string };

type FormState = {
  linkedInUrl: string;
  currentRole: string;
  currentEmployer: string;
  employmentStatus: string;
  location: string;
  yearsExperience: string;
  seniorityLevel: string;
  talentCategory: string;
  dealHistory: DealRow[];
  confidenceMarkets: MarketConf[];
  languagesSpoken: string[];
  references: ReferenceRow[];
  caseStudyResponse: string;
  availabilityHours: string;
  earliestStart: string;
  rateExpectationMin: string;
  rateExpectationMax: string;
  preferredStructures: string[];
  privacyAccepted: boolean;
  termsAccepted: boolean;
};

const EMPTY_DEAL: DealRow = { company: '', dealSizeRange: '', geography: '', outcome: '', role: '' };
const EMPTY_REF: ReferenceRow = { name: '', title: '', company: '', relationship: '', email: '', linkedIn: '' };

const INITIAL: FormState = {
  linkedInUrl: '',
  currentRole: '',
  currentEmployer: '',
  employmentStatus: '',
  location: '',
  yearsExperience: '',
  seniorityLevel: '',
  talentCategory: '',
  dealHistory: [{ ...EMPTY_DEAL }, { ...EMPTY_DEAL }, { ...EMPTY_DEAL }],
  confidenceMarkets: MARKETS.map((market) => ({ market, confidence: '' })),
  languagesSpoken: [],
  references: [{ ...EMPTY_REF }, { ...EMPTY_REF }, { ...EMPTY_REF }],
  caseStudyResponse: '',
  availabilityHours: '',
  earliestStart: '',
  rateExpectationMin: '',
  rateExpectationMax: '',
  preferredStructures: [],
  privacyAccepted: false,
  termsAccepted: false,
};

const STEPS = ['Profile', 'Track record', 'References', 'Assessment & terms'];

const CASE_STUDY_PROMPT = `Scenario: An Indian B2B SaaS company (30 employees, $2M ARR, strong product-market fit in India) wants to break into the UK mid-market. They have no existing UK relationships, a basic pitch deck, and a GBP150k budget for the next 12 months.

In 300-500 words, describe: (1) How you would approach the first 30 days, what you would do, in what order, and why. (2) How you would identify and qualify the first 10 target accounts. (3) One risk you foresee and how you would mitigate it.`;

export const dynamic = 'force-dynamic';

export default function TalentApplyPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPrivacyAccepted, setSignupPrivacyAccepted] = useState(false);
  const [signupTermsAccepted, setSignupTermsAccepted] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (user.role !== 'OPERATOR') {
      router.replace('/dashboard');
      return;
    }

    if (user.stage === 'PENDING_APPROVAL') {
      router.replace('/application/status');
      return;
    }

    if (user.stage === 'ACTIVE') {
      router.replace('/operator/dashboard');
    }
  }, [router, user]);

  const wordCount = form.caseStudyResponse.trim().split(/\s+/).filter(Boolean).length;

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function setDeal(index: number, field: keyof DealRow, value: string) {
    setForm((prev) => {
      const next = [...prev.dealHistory];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, dealHistory: next };
    });
  }

  function setRef(index: number, field: keyof ReferenceRow, value: string) {
    setForm((prev) => {
      const next = [...prev.references];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, references: next };
    });
  }

  function setMarketConf(market: string, confidence: string) {
    setForm((prev) => ({
      ...prev,
      confidenceMarkets: prev.confidenceMarkets.map((entry) =>
        entry.market === market
          ? { ...entry, confidence: entry.confidence === confidence ? '' : confidence }
          : entry,
      ),
    }));
  }

  function toggleLanguage(language: string) {
    setForm((prev) => ({
      ...prev,
      languagesSpoken: prev.languagesSpoken.includes(language)
        ? prev.languagesSpoken.filter((item) => item !== language)
        : [...prev.languagesSpoken, language],
    }));
  }

  function toggleStructure(structure: string) {
    setForm((prev) => ({
      ...prev,
      preferredStructures: prev.preferredStructures.includes(structure)
        ? prev.preferredStructures.filter((item) => item !== structure)
        : [...prev.preferredStructures, structure],
    }));
  }

  function validateStep() {
    if (step === 0) {
      if (
        !form.linkedInUrl ||
        !form.currentRole ||
        !form.employmentStatus ||
        !form.location ||
        !form.yearsExperience ||
        !form.seniorityLevel ||
        !form.talentCategory
      ) {
        return 'Please fill in all required fields.';
      }
    }

    if (step === 2) {
      const filledReferences = form.references.filter(
        (reference) => reference.name && reference.email && reference.relationship,
      );
      if (filledReferences.length < 2) {
        return 'Please provide at least 2 references with name, email, and relationship.';
      }
    }

    if (step === 3) {
      if (wordCount < 100) {
        return 'Your case study response must be at least 100 words.';
      }
      if (!form.availabilityHours) {
        return 'Please select your availability.';
      }
      if (!form.rateExpectationMin || !form.rateExpectationMax) {
        return 'Please provide your rate expectation range.';
      }
      if (!form.privacyAccepted || !form.termsAccepted) {
        return 'Please accept the privacy notice and terms before submitting.';
      }
    }

    return null;
  }

  function next() {
    const message = validateStep();
    if (message) {
      setError(message);
      return;
    }

    setError('');
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
    window.scrollTo(0, 0);
  }

  function prev() {
    setError('');
    setStep((current) => Math.max(current - 1, 0));
    window.scrollTo(0, 0);
  }

  async function handleTalentSignup(event: FormEvent) {
    event.preventDefault();
    setSignupError('');
    setSignupLoading(true);

    if (!signupPrivacyAccepted || !signupTermsAccepted) {
      setSignupError('Please accept the privacy notice and terms before creating an account.');
      setSignupLoading(false);
      return;
    }

    try {
      await authApi.signupTalent({
        name: signupName,
        email: signupEmail,
        password: signupPassword,
        privacyAccepted: signupPrivacyAccepted,
        termsAccepted: signupTermsAccepted,
        noticeVersion: CURRENT_NOTICE_VERSION,
      });
      router.push(
        `/auth/verify-email?sent=1&email=${encodeURIComponent(signupEmail)}&next=${encodeURIComponent('/for-talent/apply')}`,
      );
    } catch (error) {
      if (error instanceof ApiError) {
        const body = error.body as { message?: string | string[] };
        const message = Array.isArray(body?.message) ? body.message[0] : body?.message;
        setSignupError(message || 'Talent signup failed. Please try again.');
      } else {
        setSignupError('Talent signup failed. Please try again.');
      }
    } finally {
      setSignupLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const message = validateStep();
    if (message) {
      setError(message);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const filledDeals = form.dealHistory.filter((deal) => deal.company || deal.outcome);
      const filledMarkets = form.confidenceMarkets.filter((market) => market.confidence);
      const filledReferences = form.references.filter((reference) => reference.name && reference.email);

      const payload = {
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
        references: filledReferences,
        caseStudyResponse: form.caseStudyResponse,
        availabilityHours: form.availabilityHours,
        earliestStart: form.earliestStart || undefined,
        rateExpectationMin: parseInt(form.rateExpectationMin, 10) || undefined,
        rateExpectationMax: parseInt(form.rateExpectationMax, 10) || undefined,
        rateCurrency: 'USD',
        preferredStructures: form.preferredStructures,
        privacyAccepted: form.privacyAccepted,
        termsAccepted: form.termsAccepted,
        noticeVersion: CURRENT_NOTICE_VERSION,
      };

      const response = await fetch('/api/v1/applications/talent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        const message = Array.isArray(data?.message) ? data.message[0] : data?.message;
        throw new Error(message || 'Submission failed. Please try again.');
      }

      setSubmitted(true);
      setTimeout(() => router.push('/application/status'), 1000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className={styles.page}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>OK</div>
          <h2>Application submitted</h2>
          <p>Your profile is now in review. We&apos;re moving you into the pending-approval stage and will email you with updates.</p>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return <div className={styles.page} />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.left}>
          <Link href="/for-talent" className={styles.backLink}>Back to talent overview</Link>
          <div className={styles.leftLabel}>Talent application</div>
          <h1 className={styles.leftTitle}>Join the network.</h1>
          <p className={styles.leftSub}>
            Talent onboarding starts with authentication. Once signed in, complete your application and move into review.
          </p>

          <div className={styles.feeCard}>
            <div className={styles.feeLabel}>Account</div>
            <div className={styles.feeAmount}>Free</div>
            <div className={styles.feeNote}>Use Google, Microsoft, Apple, or a verified email/password fallback. Unlock matching later from your dashboard.</div>
          </div>

          <div className={styles.stepList}>
            {STEPS.map((stepName, index) => (
              <div
                key={stepName}
                className={`${styles.stepItem} ${index === step ? styles.stepActive : ''} ${index < step ? styles.stepDone : ''}`}
              >
                <div className={styles.stepDot}>{index < step ? 'OK' : index + 1}</div>
                <span>{stepName}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.right}>
          {!user ? (
            <div className={styles.form}>
              <div className={styles.stepHeader}>
                <div className={styles.stepNum}>Step 0 of {STEPS.length}</div>
                <h2 className={styles.stepTitle}>Authenticate first</h2>
              </div>

              <div className={styles.field}>
                <label>Primary talent sign-in options</label>
                <div className={styles.chipGrid}>
                  <a className={styles.chip} href={authApi.oauthStartUrl('google', '/for-talent/apply')}>Continue with Google</a>
                  <a className={styles.chip} href={authApi.oauthStartUrl('microsoft', '/for-talent/apply')}>Continue with Microsoft</a>
                  <a className={styles.chip} href={authApi.oauthStartUrl('apple', '/for-talent/apply')}>Continue with Apple</a>
                </div>
              </div>

              <div className={styles.sectionTitle} style={{ marginTop: 24 }}>Email fallback</div>
              <p className={styles.sectionHint}>
                Prefer email and password? We&apos;ll send a verification link before you can start the talent application.
              </p>

              <form onSubmit={handleTalentSignup}>
                <div className={styles.fieldRow}>
                  <Field label="Full name" req>
                    <input
                      type="text"
                      required
                      value={signupName}
                      onChange={(event) => setSignupName(event.target.value)}
                      placeholder="Priya Sharma"
                      disabled={signupLoading}
                    />
                  </Field>
                  <Field label="Email address" req>
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(event) => setSignupEmail(event.target.value)}
                      placeholder="priya@example.com"
                      disabled={signupLoading}
                    />
                  </Field>
                </div>

                <Field label="Password" req>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={signupPassword}
                    onChange={(event) => setSignupPassword(event.target.value)}
                    placeholder="At least 8 characters"
                    disabled={signupLoading}
                  />
                </Field>

                <p className={styles.sectionHint}>
                  We use your account details to create and secure your profile. The talent
                  application later uses AI-assisted evaluation, and references may be checked
                  during review.
                </p>

                <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <input
                    type="checkbox"
                    checked={signupPrivacyAccepted}
                    onChange={(event) => setSignupPrivacyAccepted(event.target.checked)}
                    disabled={signupLoading}
                  />
                  <span>
                    I have read the <Link href={PRIVACY_PATH}>Privacy Notice</Link>.
                  </span>
                </label>

                <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <input
                    type="checkbox"
                    checked={signupTermsAccepted}
                    onChange={(event) => setSignupTermsAccepted(event.target.checked)}
                    disabled={signupLoading}
                  />
                  <span>
                    I agree to the <Link href={TERMS_PATH}>Terms of Use</Link>.
                  </span>
                </label>

                {signupError && <div className={styles.errorBox}>! {signupError}</div>}

                <button type="submit" className={styles.submitBtn} disabled={signupLoading}>
                  {signupLoading ? 'Creating account...' : 'Create verified talent account ->'}
                </button>
              </form>

              <p className={styles.submitNote}>
                Already have an account? <Link href="/auth/login">Sign in</Link>
              </p>
            </div>
          ) : (
            <form
              onSubmit={step === STEPS.length - 1 ? handleSubmit : (event) => {
                event.preventDefault();
                next();
              }}
              className={styles.form}
            >
              <div className={styles.stepHeader}>
                <div className={styles.stepNum}>Step {step + 1} of {STEPS.length}</div>
                <h2 className={styles.stepTitle}>{STEPS[step]}</h2>
              </div>

              {step === 0 && (
                <>
                  <p className={styles.sectionHint}>
                    Signed in as <strong>{user.name}</strong> ({user.email}). Complete your professional profile to continue.
                  </p>

                  <Field label="LinkedIn profile URL" req>
                    <input
                      type="url"
                      required
                      value={form.linkedInUrl}
                      onChange={(event) => set('linkedInUrl', event.target.value)}
                      placeholder="https://linkedin.com/in/yourprofile"
                      disabled={loading}
                    />
                  </Field>

                  <Field label="Talent category" req>
                    <div className={styles.radioCards}>
                      {TALENT_CATEGORIES.map((category) => (
                        <label
                          key={category}
                          className={`${styles.radioCard} ${form.talentCategory === category ? styles.radioCardSelected : ''}`}
                        >
                          <input
                            type="radio"
                            name="category"
                            value={category}
                            checked={form.talentCategory === category}
                            onChange={() => set('talentCategory', category)}
                            disabled={loading}
                          />
                          {category}
                        </label>
                      ))}
                    </div>
                  </Field>

                  <div className={styles.fieldRow}>
                    <Field label="Current role title" req>
                      <input
                        type="text"
                        required
                        value={form.currentRole}
                        onChange={(event) => set('currentRole', event.target.value)}
                        placeholder="VP Sales, EMEA"
                        disabled={loading}
                      />
                    </Field>
                    <Field label="Current employer">
                      <input
                        type="text"
                        value={form.currentEmployer}
                        onChange={(event) => set('currentEmployer', event.target.value)}
                        placeholder="Company name (optional)"
                        disabled={loading}
                      />
                    </Field>
                  </div>

                  <div className={styles.fieldRow}>
                    <Field label="Employment status" req>
                      <select
                        required
                        value={form.employmentStatus}
                        onChange={(event) => set('employmentStatus', event.target.value)}
                        disabled={loading}
                      >
                        <option value="">Select...</option>
                        {EMPLOYMENT_STATUSES.map((status) => (
                          <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Based in" req>
                      <input
                        type="text"
                        required
                        value={form.location}
                        onChange={(event) => set('location', event.target.value)}
                        placeholder="London, UK"
                        disabled={loading}
                      />
                    </Field>
                  </div>

                  <div className={styles.fieldRow}>
                    <Field label="Years in B2B sales / BD" req>
                      <input
                        type="number"
                        required
                        min={0}
                        max={50}
                        value={form.yearsExperience}
                        onChange={(event) => set('yearsExperience', event.target.value)}
                        placeholder="12"
                        disabled={loading}
                      />
                    </Field>
                    <Field label="Seniority level" req>
                      <select
                        required
                        value={form.seniorityLevel}
                        onChange={(event) => set('seniorityLevel', event.target.value)}
                        disabled={loading}
                      >
                        <option value="">Select...</option>
                        {SENIORITY_LEVELS.map((level) => (
                          <option key={level.value} value={level.value}>{level.label}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <div className={styles.sectionTitle}>Deal and engagement history</div>
                  <p className={styles.sectionHint}>
                    Share up to 3 deals, projects, or engagements you&apos;ve led. Company names can be anonymised.
                  </p>

                  {form.dealHistory.map((deal, index) => (
                    <div key={index} className={styles.dealRow}>
                      <div className={styles.dealRowNum}>{index + 1}</div>
                      <div className={styles.dealRowFields}>
                        <div className={styles.fieldRow}>
                          <Field label="Company (or type)">
                            <input
                              type="text"
                              value={deal.company}
                              onChange={(event) => setDeal(index, 'company', event.target.value)}
                              placeholder="UK HealthTech"
                              disabled={loading}
                            />
                          </Field>
                          <Field label="Deal size range">
                            <select
                              value={deal.dealSizeRange}
                              onChange={(event) => setDeal(index, 'dealSizeRange', event.target.value)}
                              disabled={loading}
                            >
                              <option value="">Select...</option>
                              {DEAL_SIZE_RANGES.map((range) => (
                                <option key={range} value={range}>{range}</option>
                              ))}
                            </select>
                          </Field>
                        </div>

                        <div className={styles.fieldRow}>
                          <Field label="Geography">
                            <input
                              type="text"
                              value={deal.geography}
                              onChange={(event) => setDeal(index, 'geography', event.target.value)}
                              placeholder="Germany, UK mid-market"
                              disabled={loading}
                            />
                          </Field>
                          <Field label="Your role">
                            <input
                              type="text"
                              value={deal.role}
                              onChange={(event) => setDeal(index, 'role', event.target.value)}
                              placeholder="Fractional VP Sales"
                              disabled={loading}
                            />
                          </Field>
                        </div>

                        <Field label="Outcome">
                          <input
                            type="text"
                            value={deal.outcome}
                            onChange={(event) => setDeal(index, 'outcome', event.target.value)}
                            placeholder="Closed $200k ACV, built a 40-account pipeline"
                            disabled={loading}
                          />
                        </Field>
                      </div>
                    </div>
                  ))}

                  <div className={styles.sectionTitle} style={{ marginTop: 32 }}>Market activation confidence</div>
                  <p className={styles.sectionHint}>
                    For each market, indicate how confident you are in activating real relationships and opportunities.
                  </p>

                  <div className={styles.marketTable}>
                    <div className={styles.marketTableHeader}>
                      <span>Market</span>
                      {CONFIDENCE_LEVELS.map((level) => <span key={level}>{level}</span>)}
                    </div>
                    {form.confidenceMarkets.map(({ market, confidence }) => (
                      <div key={market} className={styles.marketTableRow}>
                        <span className={styles.marketName}>{market}</span>
                        {CONFIDENCE_LEVELS.map((level) => (
                          <button
                            key={level}
                            type="button"
                            disabled={loading}
                            className={`${styles.confBtn} ${confidence === level ? styles.confBtnActive : ''}`}
                            onClick={() => setMarketConf(market, level)}
                          >
                            {confidence === level ? '●' : '○'}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>

                  <div className={styles.sectionTitle} style={{ marginTop: 32 }}>Languages spoken</div>
                  <div className={styles.chipGrid}>
                    {LANGUAGES.map((language) => (
                      <button
                        key={language}
                        type="button"
                        disabled={loading}
                        className={`${styles.chip} ${form.languagesSpoken.includes(language) ? styles.chipSelected : ''}`}
                        onClick={() => toggleLanguage(language)}
                      >
                        {language}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <p className={styles.sectionHint} style={{ marginBottom: 32 }}>
                    Provide at least 2 professional references. These may be contacted if you are shortlisted for an engagement.
                  </p>

                  {form.references.map((reference, index) => (
                    <div key={index} className={styles.refCard}>
                      <div className={styles.refCardNum}>Reference {index + 1}{index < 2 && <span className={styles.req}> *</span>}</div>
                      <div className={styles.fieldRow}>
                        <Field label="Full name">
                          <input
                            type="text"
                            value={reference.name}
                            onChange={(event) => setRef(index, 'name', event.target.value)}
                            placeholder="James Wilson"
                            disabled={loading}
                          />
                        </Field>
                        <Field label="Title / role">
                          <input
                            type="text"
                            value={reference.title}
                            onChange={(event) => setRef(index, 'title', event.target.value)}
                            placeholder="CEO, VP Sales"
                            disabled={loading}
                          />
                        </Field>
                      </div>

                      <div className={styles.fieldRow}>
                        <Field label="Company">
                          <input
                            type="text"
                            value={reference.company}
                            onChange={(event) => setRef(index, 'company', event.target.value)}
                            placeholder="Company name"
                            disabled={loading}
                          />
                        </Field>
                        <Field label="Your relationship">
                          <select
                            value={reference.relationship}
                            onChange={(event) => setRef(index, 'relationship', event.target.value)}
                            disabled={loading}
                          >
                            <option value="">Select relationship...</option>
                            {RELATIONSHIP_TYPES.map((relationship) => (
                              <option key={relationship} value={relationship}>{relationship}</option>
                            ))}
                          </select>
                        </Field>
                      </div>

                      <div className={styles.fieldRow}>
                        <Field label="Email address">
                          <input
                            type="email"
                            value={reference.email}
                            onChange={(event) => setRef(index, 'email', event.target.value)}
                            placeholder="james@company.com"
                            disabled={loading}
                          />
                        </Field>
                        <Field label="LinkedIn URL">
                          <input
                            type="url"
                            value={reference.linkedIn}
                            onChange={(event) => setRef(index, 'linkedIn', event.target.value)}
                            placeholder="https://linkedin.com/in/..."
                            disabled={loading}
                          />
                        </Field>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {step === 3 && (
                <>
                  <div className={styles.sectionTitle}>Domain assessment</div>
                  <div className={styles.caseStudyPrompt}>
                    <div className={styles.caseStudyLabel}>Case study prompt</div>
                    <p>{CASE_STUDY_PROMPT}</p>
                  </div>

                  <Field label={`Your response (${wordCount} words)`}>
                    <textarea
                      rows={14}
                      value={form.caseStudyResponse}
                      onChange={(event) => set('caseStudyResponse', event.target.value)}
                      placeholder="Write your response here..."
                      className={wordCount > 0 && wordCount < 100 ? styles.fieldError : ''}
                      disabled={loading}
                    />
                    {wordCount > 0 && wordCount < 100 && (
                      <span className={styles.fieldErrorMsg}>Minimum 100 words - you have {wordCount}.</span>
                    )}
                  </Field>

                  <div className={styles.sectionTitle} style={{ marginTop: 32 }}>Availability and terms</div>

                  <Field label="Availability" req>
                    <div className={styles.radioCards}>
                      {AVAILABILITY_OPTIONS.map((option) => (
                        <label
                          key={option.value}
                          className={`${styles.radioCard} ${form.availabilityHours === option.value ? styles.radioCardSelected : ''}`}
                        >
                          <input
                            type="radio"
                            name="availability"
                            value={option.value}
                            checked={form.availabilityHours === option.value}
                            onChange={() => set('availabilityHours', option.value)}
                            disabled={loading}
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </Field>

                  <Field label="Earliest start date">
                    <input
                      type="date"
                      value={form.earliestStart}
                      onChange={(event) => set('earliestStart', event.target.value)}
                      disabled={loading}
                    />
                  </Field>

                  <div className={styles.fieldRow}>
                    <Field label="Rate expectation - min (USD/month)" req>
                      <input
                        type="number"
                        min={0}
                        value={form.rateExpectationMin}
                        onChange={(event) => set('rateExpectationMin', event.target.value)}
                        placeholder="2000"
                        disabled={loading}
                      />
                    </Field>
                    <Field label="Rate expectation - max (USD/month)" req>
                      <input
                        type="number"
                        min={0}
                        value={form.rateExpectationMax}
                        onChange={(event) => set('rateExpectationMax', event.target.value)}
                        placeholder="6000"
                        disabled={loading}
                      />
                    </Field>
                  </div>

                  <Field label="Preferred engagement structures">
                    <div className={styles.chipGrid}>
                      {ENGAGEMENT_STRUCTURES.map((structure) => (
                        <button
                          key={structure}
                          type="button"
                          disabled={loading}
                          className={`${styles.chip} ${form.preferredStructures.includes(structure) ? styles.chipSelected : ''}`}
                          onClick={() => toggleStructure(structure)}
                        >
                          {structure}
                        </button>
                      ))}
                    </div>
                  </Field>

                  <p className={styles.sectionHint}>
                    We use your application data to review fit, run AI-assisted evaluation and
                    matching, contact references where appropriate, and operate email, hosting,
                    payment, and AI service providers on our behalf.
                  </p>

                  <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <input
                      type="checkbox"
                      checked={form.privacyAccepted}
                      onChange={(event) => set('privacyAccepted', event.target.checked)}
                      disabled={loading}
                    />
                    <span>
                      I have read the <Link href={PRIVACY_PATH}>Privacy Notice</Link>.
                    </span>
                  </label>

                  <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <input
                      type="checkbox"
                      checked={form.termsAccepted}
                      onChange={(event) => set('termsAccepted', event.target.checked)}
                      disabled={loading}
                    />
                    <span>
                      I agree to the <Link href={TERMS_PATH}>Terms of Use</Link>.
                    </span>
                  </label>
                </>
              )}

              {error && <div className={styles.errorBox}>! {error}</div>}

              <div className={styles.navRow}>
                {step > 0 && (
                  <button type="button" className={styles.prevBtn} onClick={prev} disabled={loading}>
                    Back
                  </button>
                )}
                {step < STEPS.length - 1 ? (
                  <button type="submit" className={styles.nextBtn} disabled={loading}>
                    Continue
                  </button>
                ) : (
                  <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading ? 'Submitting application...' : 'Submit talent application'}
                  </button>
                )}
              </div>

              {step === STEPS.length - 1 && (
                <p className={styles.submitNote}>
                  Submission moves your account from onboarding into pending review. You&apos;ll return to the application status page after submit.
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  req,
  children,
}: {
  label: string;
  req?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.field}>
      <label>
        {label}
        {req && <span className={styles.req}> *</span>}
      </label>
      {children}
    </div>
  );
}
