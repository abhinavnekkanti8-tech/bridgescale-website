# Phase 1 — Task Breakdown for Haiku/Sonnet

These are independent, low-risk changes that can be implemented in any order. Each task is self-contained with exact file paths, what to change, and expected outcome.

**Repo root:** The working directory for all paths below.
**Frontend:** `frontend/src/`
**Backend:** `backend/src/`

---

## Task 1.1 — Darken Font Colors

**Files to modify:**
- `frontend/src/app/globals.css`

**What to do:**
1. Open `globals.css` and find the `:root` CSS variables section (around line 10–40)
2. Change these three variables:
   ```css
   /* BEFORE */
   --color-text-secondary: #706b65;
   --color-text-muted:     #9e9890;

   /* AFTER */
   --color-text-secondary: #4a4540;
   --color-text-muted:     #7a756f;
   ```
3. Search the entire `frontend/src/` directory for any inline `color:` styles using the old hex values (`#706b65`, `#9e9890`) and update them to the new values.
4. Search for any `font-weight: 300` usage in `.css` and `.module.css` files. If found on body/paragraph text (not decorative text), change to `font-weight: 400`.

**Expected outcome:** All secondary and muted text across the site becomes noticeably darker and more readable on the cream background (`#f5f3ef`).

**Test:** Open any page — paragraph text and subtitles should be visibly darker than before.

---

## Task 1.2 — Remove "Request Early Access" Button and Section

**Files to modify:**
- `frontend/src/components/MarketingNav.tsx`
- `frontend/src/app/page.tsx`

**What to do:**

### MarketingNav.tsx
1. Find the line with `Request Early Access` (currently linking to `/#signup`)
2. Replace it with a "Sign up free" button that links to `/#signup` (we'll update the target section in page.tsx below):
   ```tsx
   <Link href="/for-companies/apply" className={styles.cta}>Sign up free</Link>
   ```
   Note: Keep the "Log in" link that was added previously. The nav should have: Home, For Companies, For Talent, About, Blog, Log in, [Sign up free button].

### page.tsx (home page)
1. Find the "Early access" / `#signup` section (around lines 359–391). It currently has:
   - Section label "Early access"
   - Heading "Request your spot."
   - Subtext about reviewing applications
   - Two CTA cards (company / talent)
2. Replace the ENTIRE section content (keep the `<section>` wrapper with `id="signup"`) with:
   ```tsx
   <section className={styles.ctaSection} id="signup">
     <div className={styles.wrap}>
       <Reveal>
         <div className={styles.ctaGrid}>
           <div>
             <div className={styles.sectionLabel}>Get started</div>
             <h2 className={styles.ctaHeading}>Sign up free. Explore the platform.</h2>
             <p className={styles.ctaSub}>
               Create your account in minutes. Browse the dashboard, complete your profile,
               and unlock matching when you&apos;re ready.
             </p>
           </div>
           <div className={styles.ctaCards}>
             <Link href="/for-companies/apply" className={styles.ctaCard}>
               <div>
                 <div className={styles.ctaCardLabel}>For companies</div>
                 <div className={styles.ctaCardText}>Sign up as a company</div>
               </div>
               <span className={styles.ctaCardArrow}>&rarr;</span>
             </Link>
             <Link href="/for-talent/apply" className={styles.ctaCard}>
               <div>
                 <div className={styles.ctaCardLabel}>For talent</div>
                 <div className={styles.ctaCardText}>Sign up as talent</div>
               </div>
               <span className={styles.ctaCardArrow}>&rarr;</span>
             </Link>
           </div>
         </div>
       </Reveal>
     </div>
   </section>
   ```

**Expected outcome:** No more "Request Early Access" or "early access" language anywhere. Nav has "Sign up free" button. Home page bottom has "Sign up free. Explore the platform." with direct links to signup forms.

---

## Task 1.3 — Fix Login Page Signup Buttons

**Files to modify:**
- `frontend/src/app/auth/login/page.tsx`

**What to do:**
1. Find the `registerLinks` section (around lines 143–150) that contains:
   ```tsx
   <Link href="/startup/apply" className="btn btn-secondary" style={{ flex: 1 }}>
     Apply as Startup
   </Link>
   <Link href="/operator/apply" className="btn btn-secondary" style={{ flex: 1 }}>
     Join as Operator
   </Link>
   ```
2. Change to:
   ```tsx
   <Link href="/for-companies/apply" className="btn btn-secondary" style={{ flex: 1 }}>
     Sign up as a Company
   </Link>
   <Link href="/for-talent/apply" className="btn btn-secondary" style={{ flex: 1 }}>
     Sign up as Talent
   </Link>
   ```

**Expected outcome:** Login page "Don't have an account?" buttons go to the correct signup forms.

**Test:** Go to `/auth/login` → click both buttons → should navigate to `/for-companies/apply` and `/for-talent/apply` respectively.

---

## Task 1.4 — Update Marketing Page Copy (Pricing, USD, Scaling)

**Files to modify:**
- `frontend/src/app/for-companies/page.tsx`
- `frontend/src/app/for-companies/apply/page.tsx`
- `frontend/src/app/for-talent/page.tsx`
- `frontend/src/app/for-talent/apply/page.tsx`

**What to do:**

### for-companies/page.tsx
1. Find the bottom CTA text (around line 185):
   ```
   Apply as a company — $200 one-time activation fee covers your full intake, diagnosis, and curated talent matching.
   ```
   Change to:
   ```
   Sign up free. Unlock curated talent matching for just $100 when you're ready.
   ```
2. Change the CTA button text from `"Apply as a company"` to `"Sign up free"`.

### for-companies/apply/page.tsx
1. **Fee card** (around line 371–375): Change the entire fee card:
   ```tsx
   <div className={styles.feeCard}>
     <div className={styles.feeLabel}>Signup</div>
     <div className={styles.feeAmount}>Free</div>
     <div className={styles.feeNote}>Create your account at no cost. Unlock matching later for $100 one-time.</div>
   </div>
   ```
2. **Steps** (around lines 377–383): Update the 4-step flow:
   ```tsx
   <div className={styles.steps}>
     <div className={styles.step}><span>01</span> Submit this form (free)</div>
     <div className={styles.step}><span>02</span> Browse your dashboard</div>
     <div className={styles.step}><span>03</span> Unlock matching ($100)</div>
     <div className={styles.step}><span>04</span> Get matched with vetted talent</div>
   </div>
   ```
3. **Budget bands** (around line 26–28): Change from INR to USD:
   ```typescript
   const BUDGET_BANDS = [
     '$2,000–$5,000', '$5,000–$10,000', '$10,000–$25,000', '$25,000+',
   ];
   ```
4. **Submit button** (around line 574): Change text from `'Submit application — proceed to payment →'` to `'Create your free account →'`
5. **Submit note** (around line 578–579): Change from:
   ```
   After submitting, you'll be asked to pay the ₹15,000 application fee before your diagnosis is generated.
   ```
   to:
   ```
   Your account is free. You can unlock matching from your dashboard when you're ready.
   ```
6. **"expansion"** → **"scaling"**: Find the label `"Have you attempted international expansion before?"` (around line 553) and change `expansion` to `scaling`.

### for-talent/page.tsx
1. Find the bottom CTA text (around line 196–197):
   ```
   Join BridgeScale — $50 one-time application fee covers your vetting and onboarding into the network.
   ```
   Change to:
   ```
   Sign up free. Complete your assessment, then unlock matching for $50 when you're ready.
   ```
2. Change the CTA button text from `"Join as fractional talent"` to `"Sign up free"`.

### for-talent/apply/page.tsx
1. **Fee card** (around lines 288–292): Change to:
   ```tsx
   <div className={styles.feeCard}>
     <div className={styles.feeLabel}>Signup</div>
     <div className={styles.feeAmount}>Free</div>
     <div className={styles.feeNote}>Create your account at no cost. Complete your assessment at your own pace, then unlock matching for $50.</div>
   </div>
   ```
2. **Submit note** (around lines 594–598): Change from `"pay the $50 application fee"` to:
   ```
   Your account is free. Complete your assessment and references, then unlock matching from your dashboard.
   ```

### Global "expansion" → "scaling"
Search across all files in `frontend/src/` for the word `expansion` and replace with `scaling` where it refers to international growth. Common locations:
- `"international expansion"` → `"international scaling"`
- `"market expansion"` → `"market scaling"`

Do NOT replace if it's in a different context (e.g. CSS animation expansion).

**Expected outcome:** All pricing is in USD, no INR references remain, no "application fee" language, everything says "free signup + unlock matching", and "expansion" is replaced with "scaling".

---

## Task 1.5 — Form Improvements (Other Textbox, RoW Textbox, Tone, Disable Submit)

**Files to modify:**
- `frontend/src/app/for-companies/apply/page.tsx`

**What to do:**

### 1.5a — "Other" in Need Area → Show Text Box
1. Add a new field to the `FormState` type (around line 44):
   ```typescript
   needAreaOther: string;
   ```
2. Add to `INITIAL` (around line 67):
   ```typescript
   needAreaOther: '',
   ```
3. After the radio cards for `needArea` (around line 452), add a conditional textarea:
   ```tsx
   {form.needArea === 'Other' && (
     <div className={styles.field} style={{ marginTop: '12px' }}>
       <label>Describe what you need <span className={styles.req}>*</span></label>
       <textarea rows={3} required value={form.needAreaOther}
         onChange={e => set('needAreaOther', e.target.value)}
         placeholder="Tell us what commercial capability you're looking for..."
         disabled={loading} />
     </div>
   )}
   ```
4. In `handleSubmit`, add `needAreaOther` to the payload (around line 183):
   ```typescript
   needArea: form.needArea === 'Other' && form.needAreaOther
     ? `Other: ${form.needAreaOther}`
     : form.needArea,
   ```
5. In the validation check (around line 163), add:
   ```typescript
   (form.needArea === 'Other' && !form.needAreaOther)
   ```
   to the list of conditions that trigger the error.

### 1.5b — "Rest of World" → Show Text Box
1. Add a new field to `FormState`:
   ```typescript
   targetMarketsRoWDetail: string;
   ```
2. Add to `INITIAL`:
   ```typescript
   targetMarketsRoWDetail: '',
   ```
3. After the chip grid for target markets (around line 463), add:
   ```tsx
   {form.targetMarkets.includes('Rest of World') && (
     <div className={styles.field} style={{ marginTop: '12px' }}>
       <label>Which countries or regions? <span className={styles.req}>*</span></label>
       <input type="text" required value={form.targetMarketsRoWDetail}
         onChange={e => set('targetMarketsRoWDetail', e.target.value)}
         placeholder="e.g. Japan, South Korea, Brazil, South Africa..."
         disabled={loading} />
     </div>
   )}
   ```
4. Include `targetMarketsRoWDetail` in the payload sent to the backend. Append it to `targetMarkets`:
   ```typescript
   targetMarkets: form.targetMarkets.includes('Rest of World') && form.targetMarketsRoWDetail
     ? form.targetMarkets.map(m => m === 'Rest of World' ? `Rest of World (${form.targetMarketsRoWDetail})` : m).join(', ')
     : form.targetMarkets.join(', '),
   ```

### 1.5c — Change "Anything else we should know?" Tone
1. Find the label (around line 492):
   ```
   Anything else we should know?
   ```
   Change to:
   ```
   Additional context
   ```
2. Change the placeholder (same line area):
   ```
   Additional context about your company, market, or situation...
   ```
   Change to:
   ```
   Anything specific about your market, product, or timeline that would help us find the right match...
   ```

### 1.5d — Disable Submit Until Mandatory Fields Complete
1. Add a computed boolean before the return statement:
   ```typescript
   const isFormValid = !!(
     form.name && form.email && form.companyName && form.industry &&
     form.companyStage && form.targetMarkets.length > 0 &&
     form.needArea && form.budgetRange && form.urgency &&
     (form.needArea !== 'Other' || form.needAreaOther) &&
     (!form.targetMarkets.includes('Rest of World') || form.targetMarketsRoWDetail)
   );
   ```
2. On the submit button (around line 574), add `disabled`:
   ```tsx
   <button type="submit" className={styles.submitBtn} disabled={loading || !isFormValid}>
     {loading ? 'Submitting…' : 'Create your free account →'}
   </button>
   ```
3. Add a helper message below the button (when not valid):
   ```tsx
   {!isFormValid && (
     <p className={styles.submitNote} style={{ color: 'var(--color-text-muted)' }}>
       Fill all required fields (*) to continue.
     </p>
   )}
   ```

**Expected outcome:** "Other" and "RoW" selections reveal text inputs. Submit button is greyed out until all required fields are filled. "Anything else" has a cleaner tone.

---

## Task 1.6 — Add FAQ Sections to Companies and Talent Pages

**Files to create:**
- `frontend/src/components/FAQ.tsx`
- `frontend/src/components/FAQ.module.css`

**Files to modify:**
- `frontend/src/app/for-companies/page.tsx`
- `frontend/src/app/for-talent/page.tsx`

**What to do:**

### Create the FAQ Accordion Component

Create `frontend/src/components/FAQ.tsx`:
```tsx
'use client';

import { useState } from 'react';
import styles from './FAQ.module.css';

type FAQItem = { question: string; answer: string };

export function FAQ({ items, label = 'Frequently asked questions' }: { items: FAQItem[]; label?: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className={styles.faq}>
      <div className={styles.label}>{label}</div>
      <div className={styles.list}>
        {items.map((item, i) => (
          <div key={i} className={styles.item}>
            <button
              type="button"
              className={`${styles.question} ${openIndex === i ? styles.questionOpen : ''}`}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              aria-expanded={openIndex === i}
            >
              <span>{item.question}</span>
              <span className={styles.icon}>{openIndex === i ? '−' : '+'}</span>
            </button>
            {openIndex === i && (
              <div className={styles.answer}>
                <p>{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

Create `frontend/src/components/FAQ.module.css`:
```css
.faq {
  max-width: 800px;
  margin: 0 auto;
}

.label {
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  margin-bottom: 2rem;
}

.list {
  border-top: 1px solid var(--color-border);
}

.item {
  border-bottom: 1px solid var(--color-border);
}

.question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 1.25rem 0;
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  text-align: left;
  line-height: 1.5;
  gap: 1rem;
}

.question:hover {
  color: var(--color-accent);
}

.questionOpen {
  color: var(--color-accent);
}

.icon {
  font-size: 1.25rem;
  font-weight: 300;
  flex-shrink: 0;
  width: 1.5rem;
  text-align: center;
  color: var(--color-text-muted);
}

.answer {
  padding: 0 0 1.25rem 0;
}

.answer p {
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--color-text-secondary);
  max-width: 640px;
}
```

### Add FAQ to for-companies/page.tsx

1. Import the component at the top:
   ```tsx
   import { FAQ } from '@/components/FAQ';
   ```

2. Add FAQ data constant (add to the data section at the top of the file, after the `engagements` array):
   ```typescript
   const companyFaqs = [
     {
       question: 'What results can I expect?',
       answer: 'Results depend on your product, market, and sales cycle. Pipeline sprints typically generate 10\u201315 qualified meetings per month from a fractional salesperson working 20 hours/week. Revenue outcomes depend on your ACV \u2014 a $25K ACV product with a 2-month cycle has seen $250K+ in net new revenue from a single engagement. First activity usually begins within 2\u20134 weeks.',
     },
     {
       question: 'What happens if I\u2019m not satisfied with my match?',
       answer: 'We\u2019ll rematch you with a new professional from our network at no additional cost. We vet every talent on the platform and stand behind the quality \u2014 but we also know that skills and experience alone don\u2019t guarantee a good working fit. If it\u2019s not right, we\u2019ll fix it.',
     },
     {
       question: 'How do you vet talent?',
       answer: 'Every professional goes through a multi-stage process: verified references from past employers and clients, a live expert interview assessing commercial depth and communication, and a domain-specific assessment reviewed by peers. Our acceptance rate is under 15%. You only see talent who have already been vetted.',
     },
     {
       question: 'Where is the talent based?',
       answer: 'Every professional on BridgeScale is a member of the Indian diaspora currently based in your target market \u2014 EU, US, UK, Australia, Middle East, or Southeast Asia. They combine deep local market knowledge and relationships with cultural fluency that makes working with Indian companies seamless.',
     },
     {
       question: 'Can I hire them full-time later?',
       answer: 'Yes. Many fractional engagements evolve into full-time roles. A fractional engagement is the best trial period you can get: you assess real commercial execution, not interview performance. BridgeScale supports the conversion process when both parties are ready.',
     },
     {
       question: 'What does it cost?',
       answer: 'Signing up is free. You pay a one-time $100 fee to unlock matching \u2014 this covers your AI-powered needs diagnosis and curated talent shortlist. Engagement pricing varies: sprints from $2,500, retainers $5,000\u2013$10,000/month. The platform charges a 10% service fee on engagements. No hidden costs.',
     },
     {
       question: 'How quickly can I be matched?',
       answer: 'Most companies receive their first curated talent shortlist within 48 hours of unlocking matching. From shortlist to first introduction call is typically same-day or next-day. Your first commercial activity can begin within 2\u20134 weeks of engagement start.',
     },
     {
       question: 'What if I\u2019m not ready to commit yet?',
       answer: 'No pressure. Sign up for free, explore the platform, and complete your profile at your own pace. Your account stays active. When you\u2019re ready to see who\u2019s available, unlock matching with a one-time fee.',
     },
   ];
   ```

3. Insert the FAQ section between the Guarantee section and the CTA section:
   ```tsx
   {/* ── FAQ ── */}
   <section className={styles.section}>
     <Reveal>
       <div className={styles.container}>
         <FAQ items={companyFaqs} />
       </div>
     </Reveal>
   </section>
   ```

### Add FAQ to for-talent/page.tsx

1. Import the component:
   ```tsx
   import { FAQ } from '@/components/FAQ';
   ```

2. Add FAQ data (after the `roles` array):
   ```typescript
   const talentFaqs = [
     {
       question: 'Is it free to join?',
       answer: 'Yes. Creating your profile and completing your assessment is completely free. You only pay a one-time $50 fee when you\u2019re ready to unlock matching and enter the active talent pool.',
     },
     {
       question: 'Do I need to leave my current job?',
       answer: 'No. Most engagements require 15\u201320 hours per week and are designed to work alongside your existing full-time role. You set your availability and preferred engagement structures.',
     },
     {
       question: 'What\u2019s the vetting process?',
       answer: 'After you create your profile, you\u2019ll complete a domain assessment and provide professional references. Once verified, your profile enters the matching pool. The assessment is completed at your own pace \u2014 there\u2019s no time pressure.',
     },
     {
       question: 'What kind of companies will I work with?',
       answer: 'Indian startups and MSMEs that are scaling into international markets. Industries range from SaaS and FinTech to HealthTech, DeepTech, and Manufacturing. These are companies with real products and domestic traction that need experienced international commercial talent.',
     },
     {
       question: 'How do I get paid?',
       answer: 'All payments are processed through the platform \u2014 monthly retainer, sprint fee, success-fee, or hybrid structures. We handle cross-border contracting, invoicing, payments, and compliance so you can focus on delivery.',
     },
     {
       question: 'What markets are in demand?',
       answer: 'Primarily EU, US, UK, AU/NZ, UAE, and Singapore/SEA. Companies are specifically looking for diaspora professionals with existing relationships and market knowledge in these regions.',
     },
     {
       question: 'Can a fractional engagement become full-time?',
       answer: 'Yes \u2014 many do. A fractional engagement is the best audition process that exists: both you and the company get to assess fit through real work, not interviews. When it\u2019s the right match, the platform supports a smooth conversion.',
     },
   ];
   ```

3. Insert the FAQ section between the Roles section and the CTA section:
   ```tsx
   {/* ── FAQ ── */}
   <section className={styles.section}>
     <Reveal>
       <div className={styles.container}>
         <FAQ items={talentFaqs} />
       </div>
     </Reveal>
   </section>
   ```

**Expected outcome:** Both `/for-companies` and `/for-talent` pages have a clean accordion FAQ section before the final CTA.

---

## Task 1.7 — Talent Signup: Make Assessment & References Skippable

**Files to modify:**
- `frontend/src/app/for-talent/apply/page.tsx`

**What to do:**

The talent signup form currently has 4 steps: Profile (0), Track Record (1), References (2), Assessment (3). Steps 2 and 3 must become **skippable** — the user can submit their account with just Steps 0 and 1.

1. **Add a skip mechanism.** After the step navigation buttons (around lines 577–592), for steps 1, 2, and 3 add a "Skip for now" link:
   ```tsx
   {step >= 1 && step < STEPS.length - 1 && (
     <button type="button" className={styles.skipBtn} onClick={() => {
       setError('');
       // Skip straight to final step if on step 1, or to submit if on step 2
       if (step === 1) setStep(2);
       else if (step === 2) setStep(3);
       window.scrollTo(0, 0);
     }} disabled={loading}>
       Skip for now →
     </button>
   )}
   ```
   On the final step (step 3 — Assessment), also add a skip that goes straight to submission:
   ```tsx
   {step === STEPS.length - 1 && (
     <button type="button" className={styles.skipBtn} onClick={() => {
       // Submit without assessment — account still created
       handleSubmitWithoutAssessment();
     }} disabled={loading}>
       Skip and create account →
     </button>
   )}
   ```

2. **Add `handleSubmitWithoutAssessment` function** that submits the form with whatever data is available (no validation on steps 2+3):
   ```typescript
   async function handleSubmitWithoutAssessment() {
     // Only validate step 0 (profile basics)
     if (!form.name || !form.email || !form.linkedInUrl ||
         !form.currentRole || !form.employmentStatus ||
         !form.location || !form.yearsExperience ||
         !form.seniorityLevel || !form.talentCategory) {
       setError('Please complete your profile (Step 1) before creating your account.');
       setStep(0);
       return;
     }
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
         references: filledRefs.length > 0 ? filledRefs : undefined,
         caseStudyResponse: form.caseStudyResponse || undefined,
         availabilityHours: form.availabilityHours || undefined,
         earliestStart: form.earliestStart || undefined,
         rateExpectationMin: form.rateExpectationMin ? parseInt(form.rateExpectationMin, 10) : undefined,
         rateExpectationMax: form.rateExpectationMax ? parseInt(form.rateExpectationMax, 10) : undefined,
         rateCurrency: 'USD',
         preferredStructures: form.preferredStructures,
         assessmentSkipped: true,
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

       setSubmitted(true);
       setTimeout(() => router.push(`/application/status?id=${data.applicationId}`), 1500);
     } catch (err: any) {
       setError(err.message || 'An unexpected error occurred.');
     } finally {
       setLoading(false);
     }
   }
   ```

3. **Update step validation** in `validateStep()`: Remove required validation for steps 2 and 3 when the user clicks "Continue" (keep it for the normal submit path, but allow skipping):
   - Step 1 (Track record): No required fields — already optional
   - Step 2 (References): Keep the validation for the normal path, skip path bypasses it
   - Step 3 (Assessment): Keep the validation for the normal path, skip path bypasses it

4. **Add skip button styling.** Add to the apply page's CSS module (`frontend/src/app/for-talent/apply/apply.module.css`):
   ```css
   .skipBtn {
     background: none;
     border: none;
     color: var(--color-text-muted);
     font-size: 0.875rem;
     cursor: pointer;
     padding: 0.5rem 0;
     text-decoration: underline;
     text-underline-offset: 3px;
   }

   .skipBtn:hover {
     color: var(--color-text-secondary);
   }
   ```

5. **Update the step labels** to indicate which are optional. Change the `STEPS` array:
   ```typescript
   const STEPS = ['Profile', 'Track record', 'References (optional)', 'Assessment (optional)'];
   ```

6. **Update the left panel text** (around lines 282–286):
   ```tsx
   <p className={styles.leftSub}>
     Complete your profile to create your free account. References and assessment
     can be completed later from your dashboard — but they&apos;re required before
     you can unlock matching.
   </p>
   ```

7. **Update the submit note** at the bottom (around lines 594–598): Remove the payment reference entirely. Replace with:
   ```tsx
   {step === STEPS.length - 1 && (
     <p className={styles.submitNote}>
       You can also skip the assessment for now and complete it later from your dashboard.
       References and assessment are required to unlock matching.
     </p>
   )}
   ```

**Expected outcome:** Talent can create their account after completing just the Profile step. "Skip for now" links appear on steps 1–3. Steps 2 and 3 are labelled "(optional)". The left panel explains that references + assessment are needed before matching.

---

## Task 1.8 — Disable Submit on Talent Form Until Step 0 Is Complete

**Files to modify:**
- `frontend/src/app/for-talent/apply/page.tsx`

**What to do:**

1. Add a computed boolean for step 0 validity:
   ```typescript
   const isStep0Valid = !!(
     form.name && form.email && form.linkedInUrl &&
     form.currentRole && form.employmentStatus &&
     form.location && form.yearsExperience &&
     form.seniorityLevel && form.talentCategory
   );
   ```

2. On step 0, the "Continue →" button should be disabled until all required fields are filled:
   ```tsx
   {step < STEPS.length - 1 ? (
     <button type="submit" className={styles.nextBtn} disabled={loading || (step === 0 && !isStep0Valid)}>
       Continue &rarr;
     </button>
   ) : (
     ...
   )}
   ```

3. Show helper text on step 0 when button is disabled:
   ```tsx
   {step === 0 && !isStep0Valid && (
     <p className={styles.submitNote} style={{ color: 'var(--color-text-muted)' }}>
       Fill all required fields (*) to continue.
     </p>
   )}
   ```

**Expected outcome:** "Continue" button on the talent form's first step is greyed out until all required fields are completed. No validation error popup — the button just enables when ready.

---

## Summary — Phase 1 Tasks

| Task | Description | Files Changed | Risk |
|------|-------------|---------------|------|
| 1.1 | Darken fonts | globals.css | None |
| 1.2 | Remove early access, add "Sign up free" | MarketingNav.tsx, page.tsx | Low |
| 1.3 | Fix login signup buttons | auth/login/page.tsx | None |
| 1.4 | Marketing copy (pricing, USD, scaling) | 4 files | Low |
| 1.5 | Form improvements (Other, RoW, tone, submit) | for-companies/apply/page.tsx | Low |
| 1.6 | FAQ sections | 4 files (2 new, 2 modified) | None |
| 1.7 | Talent signup: skip assessment/refs | for-talent/apply/page.tsx | Medium |
| 1.8 | Talent form: disable submit until valid | for-talent/apply/page.tsx | None |

**All tasks are independent** — they can be implemented in any order.
**Tasks 1.7 and 1.8 modify the same file** — implement 1.7 first, then 1.8.
