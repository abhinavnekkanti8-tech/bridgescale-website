'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { MarketingNav } from '@/components/MarketingNav';
import styles from './page.module.css';

/* ── Scroll Reveal Hook ── */
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
  { text: 'Pipeline Generation', type: 'outcome' },
  { text: '73% cite GTM talent as #1 barrier', type: 'number' },
  { text: 'International Market Entry', type: 'outcome' },
  { text: '4× faster time-to-market', type: 'number' },
  { text: 'Channel & Partner Development', type: 'outcome' },
  { text: '6-week avg. to first activity', type: 'number' },
  { text: 'ICP Validation In-Market', type: 'outcome' },
  { text: '340% fractional hiring growth since 2020', type: 'number' },
  { text: 'Outbound Pipeline Build', type: 'outcome' },
  { text: '15% acceptance rate', type: 'number' },
  { text: 'Revenue Operating Cadence', type: 'outcome' },
  { text: '$0 full-time salary required', type: 'number' },
];

const gapCards = [
  {
    label: 'Indian startups & MSMEs',
    title: 'Serious about going global. Not set up to hire for it full-time.',
    points: [
      "Don\u0027t know exactly what commercial capability gap they have",
      "Can\u0027t afford — or justify — a full-time senior international hire",
      "No trusted access to senior talent who\u0027ve already navigated their target markets",
      "Need scoped execution, not another informal advisory relationship",
      "Want flexibility — cash, retainer, success-based, or hybrid fractional structures",
    ],
  },
  {
    label: 'Indian diaspora senior talent',
    title: 'Ready to contribute back home. Only on professional terms.',
    points: [
      "Advisory on diaspora networks goes uncompensated — senior talent disengage fast",
      "Want structured, scoped, paid fractional engagements — not informal calls that go nowhere",
      "Prefer part-time or project-based formats compatible with their existing full-time role",
      "Want equity upside through documented hybrid or FAST structures — not a vague promise",
      "Need cross-border contracting, payments, and EOR handled so they can focus on delivery",
    ],
  },
];

const stats = [
  { n: '73%', t: 'of high-growth startups cite lack of senior GTM talent as their primary barrier to international expansion' },
  { n: '4×', t: 'faster time-to-market when companies engage fractional senior talent vs. hiring full-time for new geographies' },
  { n: '$0', t: 'full-time salary required — structured fractional retainers start at a fraction of a senior hire\u0027s total cost' },
];

const offerings = [
  {
    n: '01', name: 'Fractional sales leadership',
    desc: 'Senior revenue talent who define and lead your international sales motion fractionally — strategy through execution.',
    pills: ['Fractional VP Sales', 'Fractional CRO', 'Head of Sales', 'Revenue leaders'],
  },
  {
    n: '02', name: 'Fractional sales execution',
    desc: 'Hands-on pipeline generators who prospect, qualify, and advance deals in your target international markets.',
    pills: ['Fractional SDR / BDR', 'Account Executive', 'Outbound operators', 'Pipeline generation'],
  },
  {
    n: '03', name: 'Fractional partnerships & BD',
    desc: 'Talent who build channels, develop reseller networks, and open markets through partnerships — on a fractional basis.',
    pills: ['Channel development', 'Reseller / distributor', 'Alliances', 'Market entry'],
  },
];

const crossCaps = [
  'GTM strategy & refinement', 'ICP & messaging clarity', 'Commercial systems improvement',
  'Revenue operating cadence', 'Founder-led sales transition', 'AI in sales workflow', 'International market entry',
];

const advantages = [
  { t: 'De-risk your international growth hire', p: '→ Prove value in a sprint before committing to a retainer' },
  { t: 'Unlock markets through existing relationships', p: '→ First qualified meetings in weeks, not 6–9 months' },
  { t: 'Eliminate cultural misalignment', p: '→ Cultural fluency no job board can replicate' },
  { t: 'Speed to market — not months of ramping', p: '→ First commercial activity in weeks, not a quarter' },
  { t: 'Start small. Scale what works.', p: '→ Modular structures with clear expansion or exit at every stage' },
  { t: 'Senior talent you couldn\u0027t otherwise access', p: '→ Access the top 5% of diaspora senior talent, available no other way' },
];

const trustCells = [
  {
    label: 'Vetting',
    title: 'Every professional is rigorously screened.',
    body: 'Verified references from past clients and employers. A live expert interview. A domain-specific assessment — case study pitch for sales roles, turnaround narrative for leadership. Acceptance rate under 15%.',
  },
  {
    label: 'Intelligence',
    title: 'AI does the heavy lifting. Humans make the calls.',
    body: 'AI assists with need diagnosis, talent matching, scope drafting, and engagement health monitoring. Every recommendation is reviewable and overridable. Shortlists are reviewed by platform staff before companies see them.',
  },
  {
    label: 'Principles',
    title: 'Fractional-first. Curated, not open.',
    body: 'Diagnosis before matching. Execution is the product. Rewarded engagement, not unpaid mentorship. Built for Indian startups and MSMEs — not enterprises. The quality of the network is the product.',
  },
];

/* ── Component ── */
export default function HomePage() {
  return (
    <div className={styles.page}>

      {/* ══════ NAV ══════ */}
      <MarketingNav />

      {/* ══════ HERO ══════ */}
      <section className={styles.hero}>
        <div className={styles.wrap}>
          <div className={styles.heroEyebrow}>
            <span className={styles.heroEyebrowLine} />
            Now accepting early applications
          </div>

          <h1 className={styles.heroTitle}>
            The gap between your product and international growth isn&apos;t strategy. It&apos;s{' '}
            <span className={styles.heroTitleAccent}>senior talent</span>{' '}
            with the networks to open it.
          </h1>

          <p className={styles.heroTagline}>
            Fractional diaspora talent. Vetted &amp; Scoped. Platform-managed.
          </p>

          <p className={styles.heroSub}>
            BridgeScale matches Indian startups and MSMEs with vetted diaspora sales leaders,
            pipeline builders, and BD operators — for fractional, scoped engagements that
            produce real commercial outcomes in international markets.
          </p>

          <div className={styles.heroActions}>
            <a href="#signup" className="btn btn-primary">I&apos;m a company looking for talent →</a>
            <a href="#signup" className="btn btn-secondary">I&apos;m a sales professional</a>
          </div>

          <div className={styles.heroStats}>
            {[
              { n: 'Fractional', l: 'Senior talent access without full-time commitment or risk' },
              { n: '3', l: 'Talent categories: Sales Leadership, Execution, Partnerships & BD' },
              { n: '7', l: 'Engagement structures — consultation to equity-linked leadership' },
            ].map((s, i) => (
              <div key={i} className={`${styles.heroStat} ${i > 0 ? styles.heroStatBorder : ''}`}>
                <div className={styles.heroStatNum}>{s.n}</div>
                <div className={styles.heroStatLabel}>{s.l}</div>
              </div>
            ))}
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

      {/* ══════ THE GAP ══════ */}
      <section className={styles.section}>
        <div className={styles.wrap}>
          <Reveal>
            <div className={styles.sectionHead}>
              <div className={styles.sectionLabel}>The gap we&apos;re closing</div>
              <h2 className={styles.sectionHeading}>Two groups who need each other. No good way to connect.</h2>
              <p className={styles.sectionSub}>
                Indian startups want to break into international markets. Diaspora senior talent
                have the networks and market fluency. The friction is structural — not personal.
              </p>
            </div>
          </Reveal>
          <Reveal>
            <div className={styles.gapMosaic}>
              {gapCards.map((card, ci) => (
                <div key={ci} className={styles.gapCard}>
                  <div className={styles.gapCardLabel}>{card.label}</div>
                  <div className={styles.gapCardTitle}>{card.title}</div>
                  <ul className={styles.gapList}>
                    {card.points.map((p, pi) => (
                      <li key={pi} className={styles.gapItem}>
                        <span className={styles.gapDash}>—</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

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
                <p className={styles.whyNowSub}>
                  Fractional hiring isn&apos;t a workaround. It&apos;s the operating model for companies
                  that need senior talent without the overhead, and for professionals who want
                  to deploy expertise without a career disruption.
                </p>
              </div>
              <div className={styles.statList}>
                {stats.map((s, i) => (
                  <div key={i} className={styles.statRow}>
                    <div className={styles.statFigure}>{s.n}</div>
                    <p className={styles.statBody}>{s.t}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <div className={styles.statSource}>
            Sources: McKinsey Global Institute · Fractional Executive Association · Industry benchmark data
          </div>
        </div>
      </section>

      {/* ══════ OFFERINGS ══════ */}
      <section className={styles.section}>
        <div className={styles.wrap}>
          <Reveal>
            <div className={styles.offerHeader}>
              <div className={styles.offerHeaderLeft}>
                <div className={styles.sectionLabel}>What we offer</div>
                <h2 className={styles.sectionHeading}>
                  Three categories. One focus: international commercial growth.
                </h2>
              </div>
              <p className={styles.offerHeaderRight}>
                Every fractional talent category maps directly to a scoped international
                growth outcome for Indian startups and MSMEs.
              </p>
            </div>
          </Reveal>
          <Reveal>
            <div className={styles.offerGrid}>
              {offerings.map((o, i) => (
                <div key={i} className={styles.offerCard}>
                  <div className={styles.offerNum}>{o.n}</div>
                  <div className={styles.offerName}>{o.name}</div>
                  <div className={styles.offerDesc}>{o.desc}</div>
                  <div className={styles.offerPills}>
                    {o.pills.map(p => (
                      <span key={p} className={styles.offerPill}>{p}</span>
                    ))}
                  </div>
                </div>
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
      <section className={styles.section}>
        <div className={styles.wrap}>
          <Reveal>
            <div className={styles.whyBsGrid}>
              <div className={styles.whyBsLeft}>
                <div className={styles.sectionLabel}>Why BridgeScale</div>
                <h2 className={styles.sectionHeading}>
                  The advantages aren&apos;t just about cost. They&apos;re structural.
                </h2>
                <p className={styles.sectionSub}>
                  Fractional hiring through a managed platform removes risks that a job board,
                  a LinkedIn search, or a warm introduction simply can&apos;t address.
                </p>
              </div>
              <div className={styles.whyBsRight}>
                {advantages.map((a, i) => (
                  <div key={i} className={styles.whyBsCell}>
                    <div className={styles.whyBsCellNum}>
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className={styles.whyBsCellTitle}>{a.t}</div>
                    <div className={styles.whyBsCellProof}>{a.p}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

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

      {/* ══════ EARLY ACCESS CTA ══════ */}
      <section className={styles.ctaSection} id="signup">
        <div className={styles.wrap}>
          <Reveal>
            <div className={styles.ctaGrid}>
              <div>
                <div className={styles.sectionLabel}>Early access</div>
                <h2 className={styles.ctaHeading}>Request your spot.</h2>
                <p className={styles.ctaSub}>
                  We&apos;re reviewing early applications from both sides. Tell us who you are —
                  we&apos;ll follow up within 3–5 business days.
                </p>
              </div>
              <div className={styles.ctaCards}>
                <Link href="/for-companies" className={styles.ctaCard}>
                  <div>
                    <div className={styles.ctaCardLabel}>For companies</div>
                    <div className={styles.ctaCardText}>Apply as a company</div>
                  </div>
                  <span className={styles.ctaCardArrow}>→</span>
                </Link>
                <Link href="/for-talent" className={styles.ctaCard}>
                  <div>
                    <div className={styles.ctaCardLabel}>For talent</div>
                    <div className={styles.ctaCardText}>Join as fractional talent</div>
                  </div>
                  <span className={styles.ctaCardArrow}>→</span>
                </Link>
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
            <Link href="/for-talent" className={styles.footerLink}>For Talent</Link>
            <Link href="/about" className={styles.footerLink}>About</Link>
            <Link href="/blog" className={styles.footerLink}>Blog</Link>
            <a href="#" className={styles.footerLink}>Privacy</a>
            <a href="#" className={styles.footerLink}>Terms</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
