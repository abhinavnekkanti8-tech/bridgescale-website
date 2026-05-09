'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MarketingNav } from '@/components/MarketingNav';
import { PRIVACY_PATH, TERMS_PATH } from '@/lib/legal';
import styles from './page.module.css';

/* ── Scroll Reveal ── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add('reveal-init');
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('visible'); io.disconnect(); } },
      { threshold: 0.06, rootMargin: '0px 0px -50px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}
function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useReveal();
  return <div ref={ref} className={className}>{children}</div>;
}

/* ── Data ── */
const marqueeItems = [
  { text: 'Pipeline Generation',                     type: 'outcome' },
  { text: '73% cite GTM talent as #1 barrier',       type: 'number'  },
  { text: 'International Market Entry',              type: 'outcome' },
  { text: '4× faster time-to-market',                type: 'number'  },
  { text: 'Channel & Partner Development',           type: 'outcome' },
  { text: '6-week avg. to first activity',           type: 'number'  },
  { text: 'ICP Validation In-Market',                type: 'outcome' },
  { text: '340% fractional hiring growth since 2020',type: 'number'  },
  { text: 'Outbound Pipeline Build',                 type: 'outcome' },
  { text: '15% acceptance rate',                     type: 'number'  },
  { text: 'Revenue Operating Cadence',               type: 'outcome' },
  { text: 'Structured cross-border contracting',     type: 'number'  },
];

const gapStartups = [
  { num: '01', text: "Don't know exactly what commercial capability gap you have — only what role title you think you need." },
  { num: '02', text: "Can't justify a full-time international senior hire — $200K+ before equity is hard to commit to before the market is proven." },
  { num: '03', text: "No trusted access to senior talent who've already navigated your target markets — job boards return generalists, warm intros produce advisors who attend three calls and disengage." },
  { num: '04', text: "Need scoped execution, not another informal advisory relationship that ends in suggestions instead of work." },
  { num: '05', text: "Want flexibility — cash, retainer, success-based, or hybrid fractional structures depending on the engagement." },
];

const gapTalent = [
  { num: '01', text: '"Pick your brain" calls accumulate, go uncompensated — senior talent disengage within weeks.' },
  { num: '02', text: 'Want structured, scoped, paid fractional engagements — not informal calls that go nowhere.' },
  { num: '03', text: 'Prefer part-time or project-based formats compatible with your existing full-time role or next challenge.' },
  { num: '04', text: 'Want equity upside through documented hybrid or FAST structures — not a vague promise.' },
  { num: '05', text: 'Need cross-border contracting, FX, GST, payments, and EOR handled — friction that today kills engagements before delivery starts.' },
];

const stats = [
  { n: '73%', t: 'of high-growth startups cite lack of senior GTM talent as their primary barrier to international expansion' },
  { n: '4×',  t: 'faster time-to-market when companies engage fractional senior talent vs. hiring full-time for new geographies' },
];

const whyBsCompanies = [
  {
    situation: "You're building international revenue, but a full-time leader is too slow and too expensive to commit to.",
    support: "Start with a 30-day Sprint. If it produces, convert to a Retainer. If it doesn't, you've spent the cost of a Sprint — not the cost of a wrong hire.",
  },
  {
    situation: "You don't know exactly what commercial capability is actually missing.",
    support: "Every intake runs through an AI Diagnosis before you see a single profile. The shortlist is built against the gap, not the role title.",
  },
  {
    situation: "You're worried about who you'll actually get matched with.",
    support: "Selective intake. Every operator is interview-screened, reference-verified, and assessed on a domain-specific brief. You only ever see vetted talent.",
  },
  {
    situation: "You can't run cross-border contracts, payments, or tax compliance in-house.",
    support: "A tri-party MSA covers the legal shape. FX, invoicing, GST, withholding, and EOR handled through best-in-class providers. One invoice, one payout.",
  },
  {
    situation: "Different engagements need different shapes.",
    support: "Pick the structure (Consultation / Sprint / Retainer) and the compensation mode (Cash / Hybrid / Success-fee / Equity-only). The platform supports the combinations; you choose.",
  },
  {
    situation: "You don't want to lose a great fractional operator to a competitor — or to full-time.",
    support: "If the fit is right and you want to convert, we have a structured path — clear terms, clear window, no surprise.",
  },
];

const whyBsTalent = [
  {
    situation: 'The only "opportunities" arriving are unpaid advisory calls.',
    support: 'Every engagement is scoped, paid, and contracted — Consultation, Sprint, or Retainer only. No "pick your brain" calls disguised as work.',
  },
  {
    situation: "You can't take on engagements without scope or SoW.",
    support: "A non-binding Pre-SOW Commercial Summary locks scope before any contract is signed. The engagement either has a defined deliverable or it doesn't happen.",
  },
  {
    situation: "Cross-border invoicing, FX, GST, and tax compliance is enough friction to kill the engagement.",
    support: "Invoicing, FX, GST/withholding, and EOR handled where required. ACH, Wise, or Razorpay payouts depending on your residence. You see one payout.",
  },
  {
    situation: "You want equity upside, but only with documented terms.",
    support: "Cash + Equity (FAST-documented) and Equity-only structures available on retainer engagements. Always written down, never verbal.",
  },
  {
    situation: "You need fractional work that fits alongside a full-time role.",
    support: "15–20 hours/week, async-friendly, milestone-tracked. Set your availability — engage when the brief matches what you do well, decline when it doesn't.",
  },
  {
    situation: "You want to know who you're working with before saying yes.",
    support: "A free 30-minute introductory call before any contract is signed. The Pre-SOW summary documents what you discussed. Decline cleanly if it's not a fit.",
  },
];

const offerings = [
  {
    n: '01',
    name: 'Fractional Sales Leadership',
    outcome: 'Lead the next phase of your commercial motion — fractionally.',
    desc: 'Senior revenue leaders who shape your ICP, build the playbook, and run the operating cadence. Entering a new market, expanding into a new industry, or scaling past founder-led sales.',
    roles: 'VP Sales · CRO · Head of International · GTM Leader',
    engagements: [
      { label: 'Consultation',  highlight: false },
      { label: 'Sprint',        highlight: true  },
      { label: 'Retainer',      highlight: true  },
      { label: 'Equity-linked', highlight: false },
    ],
    href: '/services/sales-leadership',
  },
  {
    n: '02',
    name: 'Fractional Sales Execution',
    outcome: "Build qualified pipeline where you're scaling — new market, new industry, or new segment.",
    desc: 'Hands-on operators who prospect, qualify, and progress deals. Networks and fluency to shortcut cold outreach across target geographies, industries, and buyer profiles.',
    roles: 'Account Executive · SDR · BDR · Outbound Operator',
    engagements: [
      { label: 'Sprint',       highlight: true  },
      { label: 'Retainer',     highlight: true  },
      { label: 'Success-fee',  highlight: false },
    ],
    href: '/services/sales-execution',
  },
  {
    n: '03',
    name: 'Fractional Partnerships & BD',
    outcome: 'Open new markets, industries, or segments through channels and alliances.',
    desc: 'Operators who build reseller, distributor, and strategic partner relationships — opening routes that direct outbound can\'t reach.',
    roles: 'BD Lead · Partnerships Lead · Channel Lead · Market Access Lead',
    engagements: [
      { label: 'Consultation', highlight: false },
      { label: 'Sprint',       highlight: true  },
      { label: 'Retainer',     highlight: true  },
      { label: 'Success-fee',  highlight: false },
    ],
    href: '/services/partnerships-bd',
  },
];

const crossCaps = [
  'GTM strategy & refinement', 'ICP & messaging clarity',
  'Commercial systems & operating cadence', 'Revenue operations',
];

const trustCells = [
  {
    label: 'Vetting',
    title: 'Every professional is rigorously screened.',
    body: 'Verified references from past clients and employers. A live expert interview. A domain-specific assessment — case study pitch for sales roles, turnaround narrative for leadership. Selective intake; the quality of the network is the product.',
  },
  {
    label: 'Intelligence',
    title: 'AI does the heavy lifting. Humans own the outcomes.',
    body: 'AI assists with need diagnosis, talent matching, scope drafting, and engagement health monitoring — every recommendation is reviewable and overridable, every shortlist reviewed by platform staff before it reaches you. The work being delivered — first meetings, partner conversations, deal progression — is where senior humans earn their keep.',
  },
  {
    label: 'Principles',
    title: 'Fractional-first. Curated, not open.',
    body: 'Diagnosis before matching. Execution is the product. Rewarded engagement, not unpaid mentorship. Built for Indian startups and MSMEs — not enterprises.',
  },
];

/* ── Component ── */
export default function HomePage() {
  return (
    <div className={styles.page}>
      <MarketingNav />

      {/* ══════ HERO — asymmetric two-col ══════ */}
      <section className={styles.hero}>
        <div className={styles.wrap}>
          <div className={styles.heroGrid}>

            {/* Left: eyebrow + headline */}
            <div>
              <div className={styles.heroEyebrow}>
                <span className={styles.heroEyebrowLine} />
                For Indian startups going international
              </div>
              <h1 className={styles.heroTitle}>
                The gap between your product and international growth isn&apos;t strategy. It&apos;s{' '}
                <span className={styles.heroTitleAccent}>senior talent</span>{' '}
                with the networks to open it.
              </h1>
            </div>

            {/* Right: tagline + sub + CTAs + pillar rows */}
            <div className={styles.heroRight}>
              <p className={styles.heroTagline}>Fractional diaspora talent. Vetted. Scoped. Managed.</p>
              <p className={styles.heroSub}>
                BridgeScale matches Indian startups and MSMEs with vetted diaspora senior talent across
                sales leadership, sales execution, and partnerships &amp; BD — for fractional, scoped
                engagements that produce real commercial outcomes in international markets.
              </p>
              <div className={styles.heroActions}>
                <Link href="/for-companies/apply" className="btn btn-primary">I&apos;m a company looking for talent →</Link>
                <Link href="/for-talent/apply" className="btn btn-secondary">I&apos;m a sales professional</Link>
              </div>
              <div className={styles.heroPillars}>
                {[
                  { name: 'Vetted',   body: 'Senior diaspora talent. Interview-screened, reference-verified, domain-assessed. Selective intake — the quality of the network is the product.' },
                  { name: 'Scoped',   body: 'Defined deliverables. Defined windows. Engagements end when the work ends — not when the budget runs out.' },
                  { name: 'Managed',  body: 'Cross-border contracts, payments, FX, GST, and compliance handled by the platform. You see one invoice, one payout.' },
                ].map(p => (
                  <div key={p.name} className={styles.heroPillar}>
                    <div className={styles.heroPillarName}>{p.name}</div>
                    <div className={styles.heroPillarBody}>{p.body}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════ MARQUEE ══════ */}
      <div className={styles.marquee} aria-hidden="true">
        <div className={styles.marqueeTrack}>
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className={styles.marqueeItem}>
              <span className={`${styles.marqueeDot} ${item.type === 'number' ? styles.marqueeDotAccent : styles.marqueeDotMuted}`} />
              <span className={item.type === 'number' ? styles.marqueeNumber : styles.marqueeOutcome}>
                {item.text}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* ══════ THE GAP — asymmetric sticky-left ══════ */}
      <GapSection />

      {/* ══════ WHY NOW ══════ */}
      <section className={styles.whyNow}>
        <div className={styles.wrap}>
          <Reveal>
            <div className={styles.whyNowGrid}>
              <div>
                <div className={styles.whyNowLabel}>Why fractional. Why now.</div>
                <h2 className={styles.whyNowHeading}>
                  The model has crossed a threshold. The timing is structural.
                </h2>
                <p className={styles.whyNowDefinition}>
                  Fractional means senior talent on a part-time, scoped basis — typically 15–20 hours/week,
                  with a defined deliverable and a defined window. Not a consultant who hands over a deck.
                  Not an advisor who attends quarterly calls. An operator who owns the work and ships the outcome.
                </p>
                <p className={styles.whyNowSub}>
                  Fractional hiring isn&apos;t a workaround. It&apos;s the operating model for companies
                  that need senior talent without the overhead, and for professionals who want to
                  deploy expertise without a career disruption.
                </p>
              </div>
              <div>
                <div className={styles.statList}>
                  {stats.map((s, i) => (
                    <div key={i} className={styles.statRow}>
                      <div className={styles.statFigure}>{s.n}</div>
                      <p className={styles.statBody}>{s.t}</p>
                    </div>
                  ))}
                </div>
                <div className={styles.logoStrip}>
                  <div className={styles.logoStripLabel}>Fractional commercial talent has built revenue at —</div>
                  <div className={styles.logoStripRow}>
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className={styles.logoPlaceholder}>Logo</div>
                    ))}
                  </div>
                </div>
                <div className={styles.statSource}>
                  Sources: McKinsey Global Institute · Fractional Executive Association · Industry benchmark data
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════ OFFERINGS ══════ */}
      <section className={styles.section} id="services">
        <div className={styles.wrap}>
          <Reveal>
            <div className={styles.offerHeader}>
              <div className={styles.offerHeaderLeft}>
                <div className={styles.sectionLabel}>What we offer</div>
                <h2 className={styles.sectionHeading}>Three services. One job: scaling your commercial motion outward.</h2>
              </div>
              <p className={styles.offerHeaderRight}>
                Every engagement is scoped to a specific outcome — a market opened, a pipeline built,
                a partnership signed. Not retainers in search of a problem.
              </p>
            </div>
          </Reveal>
          <Reveal>
            <div className={styles.offerGrid}>
              {offerings.map((o) => (
                <Link key={o.n} href={o.href} className={styles.offerCard}>
                  <div className={styles.offerNum}>{o.n}</div>
                  <div className={styles.offerName}>{o.name}</div>
                  <div className={styles.offerOutcome}>{o.outcome}</div>
                  <div className={styles.offerDesc}>{o.desc}</div>
                  <div className={styles.offerRoles}>{o.roles}</div>
                  <div className={styles.offerEngagements}>
                    <span className={styles.offerEngagementLabel}>Engagement types</span>
                    {o.engagements.map(e => (
                      <span
                        key={e.label}
                        className={`${styles.offerEngChip} ${e.highlight ? styles.offerEngChipHighlight : ''}`}
                      >
                        {e.label}
                      </span>
                    ))}
                  </div>
                  <span className={styles.offerLink}>See service →</span>
                </Link>
              ))}
            </div>
          </Reveal>
          <Reveal>
            <div className={styles.crossStrip}>
              <div className={styles.crossLabel}>Cross-capability areas</div>
              <div className={styles.crossPills}>
                {crossCaps.map(c => (
                  <span key={c} className={styles.crossPill}>{c}</span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════ WHY BRIDGESCALE ══════ */}
      <WhyBridgeScaleSection />

      {/* ══════ STANDARDS & PRINCIPLES ══════ */}
      <section className={styles.section} id="about">
        <div className={styles.wrap}>
          <Reveal>
            <div className={styles.sectionHead}>
              <div className={styles.sectionLabel}>Standards &amp; principles</div>
              <h2 className={styles.sectionHeading}>How we operate. What we won&apos;t compromise.</h2>
            </div>
          </Reveal>
          <Reveal>
            <div className={styles.trustGrid}>
              {trustCells.map((t, i) => (
                <div key={i} className={styles.trustCell}>
                  <div className={styles.trustCellLabel}>{t.label}</div>
                  <div className={styles.trustCellTitle}>{t.title}</div>
                  <p className={styles.trustCellBody}>{t.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════ CTA BANNER — slim ══════ */}
      <section className={styles.ctaSection} id="signup">
        <div className={styles.wrap}>
          <Reveal>
            <div className={styles.ctaBannerInner}>
              <div>
                <h2 className={styles.ctaHeading}>Ready to apply?</h2>
                <p className={styles.ctaSub}>
                  Indian startup or MSME going international? Diaspora senior talent looking for structured
                  fractional work? Pick your side.
                </p>
              </div>
              <div className={styles.ctaActions}>
                <Link href="/for-companies/apply" className="btn btn-primary">I&apos;m a company →</Link>
                <Link href="/for-talent/apply" className="btn btn-secondary">I&apos;m fractional talent →</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════ FOOTER ══════ */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>◆ BridgeScale</div>
          <div className={styles.footerLinks}>
            <Link href="/for-companies" className={styles.footerLink}>For Companies</Link>
            <Link href="/for-talent"    className={styles.footerLink}>For Talent</Link>
            <Link href="/about"         className={styles.footerLink}>About</Link>
            <Link href="/blog"          className={styles.footerLink}>Blog</Link>
            <Link href={PRIVACY_PATH}   className={styles.footerLink}>Privacy</Link>
            <Link href={TERMS_PATH}     className={styles.footerLink}>Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Why BridgeScale — asymmetric sticky-left + situation/support pairs ── */
function WhyBridgeScaleSection() {
  const [active, setActive] = useState<'companies' | 'talent'>('companies');
  const pairs = active === 'companies' ? whyBsCompanies : whyBsTalent;

  return (
    <section className={styles.section} id="why-bridgescale">
      <div className={styles.wrap}>
        <div className={styles.gapLayout}>

          {/* Left: sticky label + heading + sub + toggle */}
          <div className={styles.gapLeft}>
            <div className={styles.sectionLabel}>Why BridgeScale</div>
            <h2 className={styles.sectionHeading}>An operating layer, not a marketplace.</h2>
            <p className={styles.sectionSub}>
              Most fractional platforms broker introductions. BridgeScale runs an AI-native operating
              layer — diagnosis, matching, engagement health, contract structure — built specifically
              for cross-border work between Indian startups and diaspora senior talent.
            </p>
            <div style={{ marginTop: '32px' }}>
              <div className={styles.gapToggleBar} role="tablist">
                {(['companies', 'talent'] as const).map((side) => (
                  <button
                    key={side}
                    role="tab"
                    aria-selected={active === side}
                    type="button"
                    className={`${styles.gapToggleBtn} ${active === side ? styles.gapToggleBtnActive : ''}`}
                    onClick={() => setActive(side)}
                  >
                    {side === 'companies' ? 'For companies' : 'For talent'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: situation → support pairs */}
          <div>
            <div className={styles.gapCardLabel}>
              {active === 'companies' ? 'Companies scaling commercially' : 'Senior diaspora professionals'}
            </div>
            <div className={styles.gapCardTitle}>
              {active === 'companies'
                ? "What we do that a generic fractional network can't."
                : "What we do that other fractional networks don't."}
            </div>
            <div className={styles.whyBsColHeaders}>
              <div className={styles.whyBsColHeader}>The situation you&apos;re in</div>
              <div className={styles.whyBsColHeader}>What BridgeScale does about it</div>
            </div>
            <div className={styles.whyBsPairsGrid}>
              {pairs.map((p, i) => (
                <React.Fragment key={i}>
                  <div className={styles.whyBsPairSituation}>{p.situation}</div>
                  <div className={styles.whyBsPairSupport}>{p.support}</div>
                </React.Fragment>
              ))}
            </div>
            <div className={styles.whyBsBelow}>
              <div className={styles.whyBsLinks}>
                <Link href="/learn" className={styles.whyBsLink}>Calculate the cost of a wrong full-time hire →</Link>
                <span className={styles.whyBsDot}>·</span>
                <Link href="/learn" className={styles.whyBsLink}>Read our standard MSA &amp; SOW templates →</Link>
              </div>
              <div className={styles.whyBsCorridor}>
                Markets we cover today: US · UK · Canada · UAE · Singapore · Australia · India.<br />
                Extended coverage for EU markets through Employer-of-Record partners.
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ── Gap Section — asymmetric sticky-left layout ── */
function GapSection() {
  const [active, setActive] = useState<'startups' | 'talent'>('startups');

  return (
    <section className={styles.section} id="gap">
      <div className={styles.wrap}>
        <div className={styles.gapLayout}>

          {/* Left: sticky meta + toggle */}
          <div className={styles.gapLeft}>
            <div className={styles.sectionLabel}>The gap we&apos;re closing</div>
            <h2 className={styles.sectionHeading}>
              The talent and the demand both exist. The infrastructure to connect them doesn&apos;t.
            </h2>
            <p className={styles.sectionSub}>
              Indian startups need senior international growth talent. Diaspora professionals want to
              contribute home — on professional terms. Both sides hit the same wall: no managed way to
              scope, contract, pay, and run cross-border fractional work.
            </p>
            <p className={styles.gapTagline}>Not a job board. Not a recruiter. Not an advisory network.</p>
            <div className={styles.gapToggleBar} role="tablist">
              {(['startups', 'talent'] as const).map((side) => (
                <button
                  key={side}
                  role="tab"
                  aria-selected={active === side}
                  type="button"
                  className={`${styles.gapToggleBtn} ${active === side ? styles.gapToggleBtnActive : ''}`}
                  onClick={() => setActive(side)}
                >
                  {side === 'startups' ? 'For startups' : 'For talent'}
                </button>
              ))}
            </div>
          </div>

          {/* Right: numbered panels */}
          <div>
            <div className={active === 'startups' ? styles.gapPanelVisible : styles.gapPanel}>
              <div className={styles.gapCardLabel}>Indian startups &amp; MSMEs going international</div>
              <div className={styles.gapCardTitle}>Serious about going global. Not set up to hire for it full-time.</div>
              <ul className={styles.gapList}>
                {gapStartups.map(item => (
                  <li key={item.num} className={styles.gapItem}>
                    <span className={styles.gapItemNum}>{item.num}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={active === 'talent' ? styles.gapPanelVisible : styles.gapPanel}>
              <div className={styles.gapCardLabel}>Indian diaspora senior talent</div>
              <div className={styles.gapCardTitle}>Ready to contribute back home. Only on professional terms.</div>
              <ul className={styles.gapList}>
                {gapTalent.map(item => (
                  <li key={item.num} className={styles.gapItem}>
                    <span className={styles.gapItemNum}>{item.num}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
