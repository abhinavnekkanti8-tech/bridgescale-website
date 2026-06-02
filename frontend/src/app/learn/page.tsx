'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MarketingNav } from '@/components/MarketingNav';
import FaqSection from '@/components/FaqSection';
import type { FaqGroup } from '@/content/faq';
import { sampleDocs } from '@/content/faq';
import styles from './learn.module.css';

/* ── Scroll-reveal hook (mirrors /for-companies and /for-talent) ── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('visible'); obs.disconnect(); } },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}
function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useReveal();
  return <div ref={ref} className={`reveal-init ${className}`}>{children}</div>;
}

/* ── Section 2 cards ── */
const whenGood = [
  {
    title: "We need senior expertise but can’t justify a full-time hire.",
    desc: "A full-time VP of Sales for international expansion costs ₹40–80 lakhs all-in in year one (salary + recruitment + ramp + tools). For most early-stage Indian startups, that’s a one-shot bet. A Fractional Leadership Retainer costs a fraction, and lets you prove the motion before you commit to permanent headcount.",
  },
  {
    title: "We need to enter a market where we have no team or relationships.",
    desc: "Your product works in India. The US, UK, EU, or APAC are different markets — different ICPs, different buying patterns, different relationships. Fractional diaspora talent who already operate in those markets give you commercial access and cultural fluency without you having to relocate or recruit local.",
  },
  {
    title: "We have 30–60 days of work that needs senior judgement, not a full-time role.",
    desc: "ICP refinement, channel mapping, founder-led sales transition, GTM strategy reset — these are scoped projects with defined outputs, not ongoing functions. A fractional Sprint scopes the work, runs it, hands it off, and ends.",
  },
];
const whenBad = [
  {
    title: "We need full-time headcount today and have budget approved.",
    desc: "Don’t use fractional to buy time. Use a recruiter. Fractional and full-time hiring solve different problems; if you’ve decided on full-time, decide cleanly.",
  },
  {
    title: "The role is purely domestic, in our home market.",
    desc: "BridgeScale’s operator pool is the Indian diaspora abroad. If you need a sales rep based in Bengaluru selling to Indian customers, that’s a domestic hire. We’d point you to a domestic-focused recruiter.",
  },
  {
    title: "We need someone in our office, 40 hours a week, under direct day-to-day management.",
    desc: "That’s full-time employment, not fractional. Trying to manage a fractional engagement at 40 hours/week, with full operational control, creates the worst of both worlds: contractor-classification risk and employee-style overhead.",
  },
];

/* ── Section 4 engagement cards ── */
const engagementTypes = [
  {
    name: 'Consultation',
    oneLine: 'A single paid 60–90 minute session with a vetted operator on a specific question.',
    who: 'Founders or commercial leaders who need senior judgement on one decision, not a full engagement.',
    duration: '60–90 minutes',
    hours: 'Single session',
    price: 'USD 500–1,500',
    comp: 'Cash Only (most common). Equity Only (advisory).',
    best: '“Validate our US ICP before we hire” / “Should we expand to the UAE or to Singapore first?” / “Pressure-test our channel strategy.”',
  },
  {
    name: 'Sprint',
    oneLine: 'Time-boxed, fixed-fee project. Defined deliverable, defined window.',
    who: 'Companies with a specific commercial outcome to produce in a defined window — pipeline built, market entered, channel mapped, CRM cleaned up.',
    duration: '30–60 days',
    hours: '15–20 hrs/week',
    price: 'USD 2,500–8,000 fixed',
    comp: 'Cash Only / Cash + Success Fee',
    best: '“Build first 30 qualified meetings in the EU in 6 weeks” / “Map the partner landscape in North America” / “Refine our ICP and rebuild outbound sequences.”',
  },
  {
    name: 'Leadership Retainer',
    oneLine: 'Senior leader embedded in your leadership rhythm.',
    who: 'Companies that need a Fractional VP of Sales / CRO / Head of Sales to own commercial direction — strategy, board updates, team coaching, hiring, operating cadence.',
    duration: '60-day minimum; typical 6–12 months',
    hours: '20+ hrs/week',
    price: 'USD 8,000–15,000/month',
    comp: 'Cash Only / Cash + Equity / Cash + Equity + Success Fee',
    best: '“Fractional CRO to set up our US sales motion from zero to first ARR” / “Fractional VP Sales while we hire permanently.”',
  },
  {
    name: 'Operator Retainer',
    oneLine: 'Senior operator embedded in your operating rhythm.',
    who: 'Companies that need ongoing commercial execution — pipeline calls, daily outbound, weekly reporting, partner work — at a senior level, fractionally.',
    duration: '60-day minimum; typical 3–6 months',
    hours: '15–20 hrs/week',
    price: 'USD 5,000–10,000/month',
    comp: 'Cash Only / Cash + Success Fee. Cash + Equity occasionally.',
    best: '“Embedded fractional BD lead for the GCC, 6 months” / “Fractional AE on our enterprise pipeline” / “Fractional RevOps installing our forecast cadence.”',
  },
];

/* ── Section 5 role buckets ── */
const buckets = [
  { name: 'Sales Leadership', desc: 'VP Sales, VP Revenue, CRO, Head of Sales — senior leaders owning revenue.' },
  { name: 'Sales Advisors', desc: 'GTM Leaders, Founder-Led Sales Coaches, Revenue Advisors — strategic input.' },
  { name: 'Partnerships & BD', desc: 'BD Leads, Partnerships, Channel, Alliances, Market Access — partner pipeline.' },
  { name: 'Sales Execution', desc: 'AEs, SDRs, BDRs, Outbound Operators — pipeline and deals at senior IC level.' },
  { name: 'Sales Operations', desc: 'RevOps, Sales Ops, Sales Enablement & Solutions Consultants — process & systems.' },
  { name: 'Customer Success', desc: 'Customer Success Operators, Expansion Operators, Account Managers — retain & grow.' },
];

type Cell = { price: string; comp: string } | null;
const matrix: { bucket: string; cells: [Cell, Cell, Cell, Cell] }[] = [
  { bucket: 'Sales Leadership',  cells: [{ price: '$1,000–$1,500 / session', comp: 'Cash' }, { price: '$5,000–$8,000 fixed', comp: 'Cash' }, { price: '$8,000–$15,000/mo', comp: 'Cash + Equity' }, null] },
  { bucket: 'Sales Advisors',    cells: [{ price: '$500–$1,500 / session', comp: 'Cash or Equity Only' }, null, { price: '$4,000–$8,000/mo', comp: 'Cash + Equity' }, null] },
  { bucket: 'Partnerships & BD', cells: [{ price: '$750–$1,500 / session', comp: 'Cash' }, { price: '$5,000–$10,000 fixed', comp: 'Cash + Success Fee' }, { price: '$7,000–$10,000/mo', comp: 'Cash' }, { price: '$5,000–$10,000/mo', comp: 'Cash + Success Fee' }] },
  { bucket: 'Sales Execution',   cells: [null, { price: '$2,500–$6,000 fixed', comp: 'Cash + Success Fee' }, null, { price: '$3,000–$6,000/mo', comp: 'Cash + Success Fee' }] },
  { bucket: 'Sales Operations',  cells: [null, { price: '$2,500–$5,000 fixed', comp: 'Cash' }, null, { price: '$3,500–$6,000/mo', comp: 'Cash' }] },
  { bucket: 'Customer Success',  cells: [null, { price: '$3,500–$6,000 fixed', comp: 'Cash' }, null, { price: '$4,000–$7,000/mo', comp: 'Cash + Success Fee' }] },
];

/* ── Section 6 FAQ groups (cross-cutting) ── */
const learnFaqGroups: FaqGroup[] = [
  {
    heading: 'How matching works',
    items: [
      { q: "How is BridgeScale’s matching different from a job board?", a: "BridgeScale runs an AI-powered needs diagnosis on every Company intake before generating a shortlist. The diagnosis surfaces the commercial gap you actually have — not just the role title you typed in. Matches are then ranked against a pool of vetted operators, and the top candidates are reviewed by platform staff before you see them. You see four to seven blurred matches; pay the ₹8,500 unlock fee per shortlist; meet who you want, free, in 30-minute calls." },
      { q: "Why a 30-minute introductory call?", a: "It’s the qualifying gate. The call is free to both parties (you’ve paid the unlock; the operator’s friction is their time). It’s also the input to the Pre-SOW Commercial Summary that locks the engagement shape before any contract is signed." },
      { q: "What is the AI diagnosis? Can I see it?", a: "Yes. After your intake, BridgeScale generates a written diagnosis covering your commercial situation, the gap we believe you have, and the recommended outcome shape (Sprint vs. Retainer vs. Leadership). You see the diagnosis before the matches; it’s the input to the matching algorithm." },
    ],
  },
  {
    heading: 'Contracts',
    items: [
      { q: "What documents does BridgeScale use?", a: "A Master Service Agreement signed once between BridgeScale, your company, and the operator — covers structural terms (payments, IP, conversion, non-circumvention, confidentiality). A Scope of Work signed per engagement — covers the work itself. A non-binding Pre-SOW Commercial Summary issued before the MSA, to confirm the commercial shape.", docs: [sampleDocs.msa, sampleDocs.sow, sampleDocs.preSow, sampleDocs.faq] },
      { q: "Why three documents instead of one?", a: "Because the structural terms (payment mechanics, conversion fee, non-circ) should be settled once and reused. Renegotiating those terms every engagement is expensive and creates ambiguity. The MSA fixes them; the SOW only captures what changes per engagement." },
      { q: "Do I sign a new MSA for every engagement?", a: "No. The MSA persists per Company–Operator pair. If you do a second engagement with the same operator, the existing MSA is reused; only a new SOW is signed." },
    ],
  },
  {
    heading: 'Payments',
    items: [
      { q: "What does BridgeScale charge?", a: "A 10% platform fee on cash engagements, paid by the Company on top of the operator’s stated rate. A one-time ₹8,500 unlock fee per match shortlist. A one-time USD 50 operator activation fee, paid by the operator. Where Employer-of-Record applies, the EOR partner’s monthly fee is charged through to the Company at cost." },
      { q: "How do operators get paid?", a: "Through BridgeScale. ACH for US-resident operators; Wise for cross-border; INR direct via Wise or Razorpay for diaspora operators wanting payout to an Indian bank account; through an Employer-of-Record partner where required. Standard payout timing is 3–5 business days after invoice payment." },
      { q: "When does Employer-of-Record apply?", a: "When the operator’s residence country and the engagement’s duration / hours / nature create employment-classification risk. Long Retainer engagements in Germany / France / Netherlands / Spain / Ireland / Portugal / Italy typically trigger EOR; most US, UK, Canada, India, UAE, Singapore, and Australia engagements do not. The decision is made by BridgeScale at MSA generation. Day-1 partners: Deel, Remote, Multiplier." },
      { q: "What about Indian operators based abroad who want INR payouts?", a: "Supported. BridgeScale’s US Stripe entity pays USD; Wise converts to INR and deposits to your Indian bank account (typically NRE for non-resident Indians). For Indian-resident operators working remotely for international clients, Razorpay handles INR-direct payouts (with GST + TDS handled per Indian Income Tax rules)." },
    ],
  },
  {
    heading: 'Conversion to full-time',
    items: [
      { q: "Can a fractional engagement become full-time?", a: "Yes — many do. A fractional engagement is the best audition process that exists. If you decide to hire the operator full-time within 12 months of the SOW ending, the Company pays BridgeScale a 25% conversion fee on the operator’s first-year cash compensation. It’s invoiced within 90 days of the operator’s start date and due within 30 days of invoice.", docs: [sampleDocs.conversion] },
      { q: "Does the conversion fee come out of the operator’s salary?", a: "No. It’s a Company → BridgeScale fee. It does not come out of the operator’s salary or any future operator payouts." },
      { q: "What if I want to hire the operator outside BridgeScale during or just after the engagement?", a: "That’s not allowed under the MSA’s non-circumvention clause for 12 months after the engagement ends. Run all engagements with the operator through the platform; convert to full-time through the platform." },
    ],
  },
  {
    heading: 'Cancellation, IP, and edge cases',
    items: [
      { q: "What if the match doesn’t work out?", a: "BridgeScale offers a satisfaction guarantee — we’ll re-match you with a new operator at no additional unlock fee. The guarantee applies within the first 4 weeks of an engagement (locked window per the cancellation policy)." },
      { q: "What’s the cancellation policy for a 30-minute introductory call?", a: "For paid Consultations: full refund if the operator cancels with 24+ hours’ notice; 90% refund if the company cancels with 24+ hours’ notice; 50% refund if the company cancels within 24 hours; no refund for company no-show. The first late-cancel by an operator is waived without penalty." },
      { q: "Who owns the work the operator produces?", a: "Your company — once the operator has been paid in full for the engagement. Pre-existing tools and frameworks the operator brings to the engagement remain theirs; the Company gets a non-exclusive licence to use them as part of the Work Product." },
      { q: "What if my engagement doesn’t fit any of these standard combinations?", a: "It routes to BridgeScale’s deal-desk for legal review. We aim for a 5-business-day turnaround. If we can’t support the engagement at standard structure, we’ll tell you and either propose an alternative shape or decline cleanly." },
      { q: "What if BridgeScale’s standard combinations don’t yet cover my operator’s country?", a: "BridgeScale is launching with Tier 1 corridors (US, UK, Canada, India, UAE, Singapore, Australia) supported automatically. Tier 2 corridors (Germany, France, Netherlands, Spain, Ireland, Italy, Portugal, New Zealand) are supported with platform-ops review and EOR partner involvement. Other countries route to deal-desk for a corridor-specific review before MSA generation." },
    ],
  },
];

/* ── Calculator ── */
const inrFmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.round(n));

function WrongHireCalculator() {
  const [salary, setSalary] = useState(3500000);          // ₹35,00,000
  const [recruitPct, setRecruitPct] = useState(20);
  const [rampMonths, setRampMonths] = useState(6);
  const [oppCostMonthly, setOppCostMonthly] = useState(500000);
  const [wrongPct, setWrongPct] = useState(30);

  const calc = useMemo(() => {
    const salaryDuringRamp = salary * (rampMonths / 12);
    const recruitFee = salary * (recruitPct / 100);
    const opportunityCost = oppCostMonthly * rampMonths;
    const wrongIfFailed = salaryDuringRamp + recruitFee + opportunityCost;
    const expected = wrongIfFailed * (wrongPct / 100);
    return { salaryDuringRamp, recruitFee, opportunityCost, wrongIfFailed, expected };
  }, [salary, recruitPct, rampMonths, oppCostMonthly, wrongPct]);

  return (
    <>
      <div className={styles.calc}>
        <div className={styles.calcInputs}>
          <CalcSlider label="Senior cash salary (year 1)"
            value={salary} setValue={setSalary} min={1500000} max={10000000} step={100000}
            display={inrFmt(salary)} note="Typical international-sales senior hire base." />
          <CalcSlider label="Recruitment fee"
            value={recruitPct} setValue={setRecruitPct} min={0} max={35} step={1}
            display={`${recruitPct}%`} note="Industry-standard contingent-search range." />
          <CalcSlider label="Ramp time"
            value={rampMonths} setValue={setRampMonths} min={1} max={12} step={1}
            display={`${rampMonths} ${rampMonths === 1 ? 'month' : 'months'}`} note="Typical international-market ramp." />
          <CalcSlider label="Monthly pipeline opportunity cost"
            value={oppCostMonthly} setValue={setOppCostMonthly} min={0} max={2000000} step={50000}
            display={inrFmt(oppCostMonthly)} note="Pipeline that would have been built during ramp time." />
          <CalcSlider label="Probability the hire is the wrong fit"
            value={wrongPct} setValue={setWrongPct} min={10} max={60} step={5}
            display={`${wrongPct}%`} note="Industry data on first-year sales-leader-hire failure rates: ~25–40%." />
        </div>

        <div className={styles.calcOutput}>
          <div className={styles.calcOutHeadline}>{inrFmt(calc.wrongIfFailed)}</div>
          <div className={styles.calcOutCaption}>if the hire doesn’t work out</div>

          <div className={styles.calcOutSub}>{inrFmt(calc.expected)} expected loss</div>
          <div className={styles.calcOutSubCaption}>adjusted for the probability the hire is wrong</div>

          <div className={styles.calcBreakdown}>
            <div className={styles.calcBreakdownRow}>
              <span>Salary paid during ramp</span><span>{inrFmt(calc.salaryDuringRamp)}</span>
            </div>
            <div className={styles.calcBreakdownRow}>
              <span>Recruitment fee</span><span>{inrFmt(calc.recruitFee)}</span>
            </div>
            <div className={styles.calcBreakdownRow}>
              <span>Pipeline opportunity cost</span><span>{inrFmt(calc.opportunityCost)}</span>
            </div>
            <div className={styles.calcBreakdownTotal}>
              <span>Total wrong-hire exposure</span><span>{inrFmt(calc.wrongIfFailed)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.calcCta}>
        <div className={styles.calcCtaText}>
          A Fractional Leadership Retainer at USD 8,000–15,000/month tests the same motion at one-third the risk and lets you decide on a full-time hire after you’ve seen real commercial output.
        </div>
        <a href="#engagement-types" className="btn btn-primary">See engagement types →</a>
      </div>
    </>
  );
}

function CalcSlider({
  label, value, setValue, min, max, step, display, note,
}: {
  label: string; value: number; setValue: (n: number) => void;
  min: number; max: number; step: number; display: string; note: string;
}) {
  return (
    <div className={styles.calcRow}>
      <div className={styles.calcRowHeader}>
        <span className={styles.calcLabel}>{label}</span>
        <span className={styles.calcValue}>{display}</span>
      </div>
      <input
        type="range"
        className={styles.calcSlider}
        min={min} max={max} step={step} value={value}
        onChange={(e) => setValue(Number(e.target.value))}
      />
      <span className={styles.calcNote}>{note}</span>
    </div>
  );
}

/* ── Page ── */
export default function LearnPage() {
  return (
    <div className={styles.page}>
      <MarketingNav />

      {/* ── HERO ── */}
      <header className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroLabel}>The fractional hiring playbook</div>
          <h1 className={styles.heroTitle}>
            Most founders hiring fractional commercial talent are doing it for the first time. This page is the playbook.
          </h1>
          <p className={styles.heroDesc}>
            Fractional sales leaders, BD operators, and RevOps specialists work differently from full-time hires. The engagement structures are different. The compensation models are different. The risks are different. Below: when fractional makes sense, when it doesn’t, what it costs, and how to pick the right shape for your business.
          </p>
          <div className={styles.heroActions}>
            <Link href="/for-companies/apply" className="btn btn-primary">I’m a company looking for talent →</Link>
            <Link href="/for-talent/apply" className="btn btn-secondary">I’m a sales professional</Link>
          </div>
        </div>
      </header>

      {/* ── SECTION 2 — When fractional makes sense ── */}
      <section className={styles.section}>
        <Reveal>
          <div className={styles.container}>
            <div className={styles.sectionLabel}>Is fractional right for you?</div>
            <h2 className={styles.sectionHeading}>Three scenarios where fractional is the right call. Three where it isn’t.</h2>

            <div className={styles.whenGrid}>
              <div className={styles.whenColumn}>
                <div className={`${styles.whenColumnLabel} ${styles.whenColumnLabelGood}`}>When fractional makes sense</div>
                {whenGood.map((c) => (
                  <div key={c.title} className={`${styles.whenCard} ${styles.whenCardGood}`}>
                    <div className={styles.whenCardTitle}>{c.title}</div>
                    <div className={styles.whenCardDesc}>{c.desc}</div>
                  </div>
                ))}
              </div>
              <div className={styles.whenColumn}>
                <div className={`${styles.whenColumnLabel} ${styles.whenColumnLabelBad}`}>When fractional is not the right call</div>
                {whenBad.map((c) => (
                  <div key={c.title} className={`${styles.whenCard} ${styles.whenCardBad}`}>
                    <div className={styles.whenCardTitle}>{c.title}</div>
                    <div className={styles.whenCardDesc}>{c.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.ruleOfThumb}>
              If the role is “we need someone to do X for the next Y weeks/months and own the outcome,” fractional fits. If the role is “we need a permanent member of our team,” it doesn’t.
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── SECTION 3 — Wrong-hire-cost calculator ── */}
      <section className={styles.section}>
        <Reveal>
          <div className={styles.container}>
            <div className={styles.sectionLabel}>Why fractional de-risks</div>
            <h2 className={styles.sectionHeading}>A wrong full-time hire is a ₹40–80 lakh mistake. Here’s the math.</h2>
            <p className={styles.sectionSub}>
              A senior international sales hire at ₹35 lakh base salary doesn’t cost ₹35 lakh. It costs much more, and most of that cost is paid before you know whether the hire was right. Try the calculator. If the answer is uncomfortable, fractional is the de-risked alternative.
            </p>
            <WrongHireCalculator />
          </div>
        </Reveal>
      </section>

      {/* ── SECTION 4 — Engagement-type cards ── */}
      <section id="engagement-types" className={styles.section}>
        <Reveal>
          <div className={styles.container}>
            <div className={styles.sectionLabel}>Engagement types</div>
            <h2 className={styles.sectionHeading}>Three structural types. Retainer comes in two flavours — pick the one that fits the work.</h2>
            <p className={styles.sectionSub}>
              BridgeScale offers three engagement structures. Two of them — Consultation and Sprint — are time-boxed; one is ongoing. The Retainer engagement type comes in two flavours depending on whether you need a senior leader embedded in your leadership rhythm, or a senior operator embedded in your operating rhythm.
            </p>

            <div className={styles.engGrid}>
              {engagementTypes.map((e) => (
                <div key={e.name} className={styles.engCard}>
                  <div className={styles.engCardName}>{e.name}</div>
                  <div className={styles.engCardOneLine}>{e.oneLine}</div>
                  <div className={styles.engCardMeta}>
                    <span className={styles.engCardMetaLabel}>Who</span>
                    <span className={styles.engCardMetaValue}>{e.who}</span>
                    <span className={styles.engCardMetaLabel}>Duration</span>
                    <span className={styles.engCardMetaValue}>{e.duration}</span>
                    <span className={styles.engCardMetaLabel}>Hours</span>
                    <span className={styles.engCardMetaValue}>{e.hours}</span>
                    <span className={styles.engCardMetaLabel}>Price</span>
                    <span className={styles.engCardMetaValue}>{e.price}</span>
                    <span className={styles.engCardMetaLabel}>Comp</span>
                    <span className={styles.engCardMetaValue}>{e.comp}</span>
                  </div>
                  <div className={styles.engCardBest}>Best for: {e.best}</div>
                </div>
              ))}
            </div>

            <div className={styles.engNote}>
              <strong>Compensation modes apply across engagement types.</strong> The most common is Cash Only. Cash + Success Fee adds outcome-tied bonuses for Sprint or Retainer engagements (whitelisted triggers: qualified meeting accepted, signed partner agreement, closed-won deal). Cash + Equity replaces a portion of cash with documented equity via the FAST framework. Equity Only is reserved for true advisory engagements, typically Consultations or low-touch Retainers. <a href="#matrix">See the full role × engagement matrix below ↓</a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── SECTION 5 — Role × engagement matrix ── */}
      <section id="matrix" className={styles.section}>
        <Reveal>
          <div className={styles.container}>
            <div className={styles.sectionLabel}>The matrix</div>
            <h2 className={styles.sectionHeading}>Six role buckets. Three engagement types. What pairs with what.</h2>
            <p className={styles.sectionSub}>
              BridgeScale’s operator pool is grouped into six public role buckets. Each bucket maps to one or more engagement types and a typical compensation range. Use this matrix to figure out what shape you need before you start an engagement intake.
            </p>

            <div className={styles.bucketStrip}>
              {buckets.map((b) => (
                <div key={b.name} className={styles.bucketCell}>
                  <div className={styles.bucketCellName}>{b.name}</div>
                  <div className={styles.bucketCellDesc}>{b.desc}</div>
                </div>
              ))}
            </div>

            <div className={styles.matrixCaption}>
              Cells show the indicative price band and the most common compensation mode. Greyed cells indicate the combination is not typically offered. All numbers are indicative — final pricing in your Pre-SOW Commercial Summary.
            </div>

            <div className={styles.matrixWrap}>
              <table className={styles.matrix}>
                <thead>
                  <tr>
                    <th>Role bucket ↓ / Engagement →</th>
                    <th>Consultation</th>
                    <th>Sprint</th>
                    <th>Leadership Retainer</th>
                    <th>Operator Retainer</th>
                  </tr>
                </thead>
                <tbody>
                  {matrix.map((row) => (
                    <tr key={row.bucket}>
                      <th scope="row">{row.bucket}</th>
                      {row.cells.map((cell, i) => (
                        cell ? (
                          <td key={i}>
                            <div className={styles.matrixCellPrice}>{cell.price}</div>
                            <div className={styles.matrixCellComp}>{cell.comp}</div>
                          </td>
                        ) : (
                          <td key={i} className={styles.matrixCellEmpty}>—</td>
                        )
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.matrixFooter}>
              All USD bands are placeholders pending founder + finance lock. The ₹8,500 unlock fee and 10% platform fee apply across all paid engagements.
            </div>

            <div className={styles.dealDeskNote}>
              <div className={styles.dealDeskNoteText}>
                <strong>Don’t see your case?</strong> Engagements that don’t match a standard combination route to BridgeScale’s deal-desk for a 5-business-day legal review. We tell you up-front whether we can support your engagement and at what shape.
              </div>
              <Link href="/for-companies/apply" className="btn btn-primary">Apply as a company →</Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── SECTION 6 — Cross-cutting FAQ ── */}
      <FaqSection
        label="Everything else"
        heading="The detailed FAQ."
        groups={learnFaqGroups}
      />

      {/* ── FOOTER CTA ── */}
      <section className={styles.footerCta}>
        <Reveal>
          <div className={styles.container}>
            <div className={styles.footerCtaTitle}>Want to start an engagement?</div>
            <div className={styles.footerCtaActions}>
              <Link href="/for-companies/apply" className="btn btn-primary">I’m a company looking for talent →</Link>
              <Link href="/for-talent/apply" className="btn btn-secondary">I’m a sales professional →</Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
