'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { MarketingNav } from '@/components/MarketingNav';
import FaqSection from '@/components/FaqSection';
import { companiesFaqGroups } from '@/content/faq';
import styles from './companies.module.css';

/* ── Scroll-reveal hook ── */
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

/* ── Data ── */
const problems = [
  { title: 'Hiring risk', desc: 'A full-time international sales hire at $150K\u2013$250K with 6+ months to productivity is a bet most startups and MSMEs can\u2019t afford to lose.' },
  { title: 'Network gap', desc: 'You have a great product and some domestic traction. But you don\u2019t have the relationships, market fluency, or channel access in target international markets.' },
  { title: 'Engagement friction', desc: 'LinkedIn messages, warm introductions, and informal advisory calls don\u2019t produce structured, accountable commercial execution.' },
  { title: 'Execution gap', desc: 'You don\u2019t just need advice \u2014 you need someone who can build pipeline, close deals, and activate partnerships in markets where you have no presence.' },
];

const steps = [
  { n: '01', title: 'AI Diagnosis', desc: 'Share your growth goals, target markets, and the commercial gap you need to fill. Our AI Diagnosis engine analyses your intake and surfaces what you actually need \u2014 even gaps you didn\u2019t describe \u2014 producing a structured needs brief before you see a single profile.', tag: 'AI-powered' },
  { n: '02', title: 'Get matched with vetted talent', desc: 'AI generates a ranked shortlist with explainable rationale. Every match is reviewed by platform operators before you see it. Average time to first introduction: under 48 hours.', tag: 'Operator-reviewed' },
  { n: '03', title: 'Book a free consultation', desc: '30-minute intro calls are always free. Meet as many matches as you like. No commitment until you\u2019re confident it\u2019s the right fit.', tag: 'Zero risk' },
  { n: '04', title: 'Engage with confidence', desc: 'A customised Scope of Work with clear deliverables, milestones, and pricing. We handle contracting, cross-border payments, and compliance \u2014 you focus on growth.', tag: 'Managed delivery' },
];

const results = [
  { stat: '10\u201315', label: 'qualified meetings booked per month', note: 'From a fractional salesperson working 20 hours/week. Depends on your target buyer and market.' },
  { stat: '$250K+', label: 'net new revenue generated', note: 'Selling a $25K ACV product with a 2-month sales cycle. Actual results depend on your product-market fit.' },
  { stat: '80%', label: 'fractional leaders hired full-time', note: 'After a 6-month engagement. BridgeScale is fractional-first, but full-time conversion is supported.' },
  { stat: '< 48h', label: 'average time to first introduction', note: 'From completed intake to your first vetted talent introduction. Most matches happen within 24 hours.' },
];

const engagements = [
  {
    name: 'Consultation',
    price: 'Free first 30 min',
    desc: 'One-time or short-series sessions. Strategy clarity, diagnosis, or a second opinion before committing to a longer engagement.',
    flavours: [],
  },
  {
    name: 'Sprint',
    price: 'From $2,500',
    desc: 'Time-boxed, high-intensity fractional execution. A defined output \u2014 pipeline built, market entered, channel mapped \u2014 in a defined window (typically 30 days).',
    flavours: [],
  },
  {
    name: 'Retainer',
    price: '$5,000\u2013$10,000/mo',
    desc: 'Ongoing fractional engagement. Regular cadence, sustained execution, and strategic continuity. 15\u201320 hours/week from an embedded commercial talent.',
    flavours: [
      { label: 'Standard cash retainer', desc: 'Fixed monthly fee. Predictable cost, predictable cadence.' },
      { label: 'Hybrid cash + equity', desc: 'Lower cash retainer combined with a meaningful equity stake. Documented via FAST templates. For talent willing to share risk.' },
    ],
  },
];

const addOns = [
  { name: 'Success-fee component', desc: 'Add an outcome-based bonus on top of any sprint or retainer \u2014 tied to deals closed, partnerships activated, or revenue generated.' },
  { name: 'Equity-only structure', desc: 'For early-stage companies and senior advisors. Pure equity compensation, documented via FAST. Available on retainer engagements.' },
  { name: 'Conversion to full-time', desc: 'When the fit is right, convert a fractional engagement to a full-time hire. Conversion fee applies (one-time, time-bounded).' },
];

export default function ForCompaniesPage() {
  return (
    <div className={styles.page}>
      {/* ── NAV ── */}
      <MarketingNav />

      {/* ── HERO ── */}
      <header className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroLabel}>For Indian Startups &amp; MSMEs</div>
          <h1 className={styles.heroTitle}>
            Find vetted fractional talent for international growth
          </h1>
          <p className={styles.heroDesc}>
            Access experienced Indian diaspora sales leaders, BD operators, and partnership professionals — fractionally. No full-time commitment, no outsized hiring risk. Just structured commercial execution.
          </p>
          <div className={styles.heroActions}>
            <Link href="/for-companies/apply" className="btn btn-primary">Apply as a company &rarr;</Link>
            <a href="#how-matching-works" className="btn btn-secondary">See how matching works</a>
          </div>
        </div>
      </header>

      {/* ── THE PROBLEM ── */}
      <section className={styles.section}>
        <Reveal>
          <div className={styles.container}>
            <div className={styles.sectionLabel}>The problem we solve</div>
            <h2 className={styles.sectionHeading}>
              You need international commercial capacity. But a full-time hire is too risky, too slow, or too expensive.
            </h2>
            <div className={styles.problemGrid}>
              {problems.map((p) => (
                <div key={p.title} className={styles.problemCard}>
                  <div className={styles.problemTitle}>{p.title}</div>
                  <div className={styles.problemDesc}>{p.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── HOW MATCHING WORKS ── */}
      <section id="how-matching-works" className={styles.section}>
        <Reveal>
          <div className={styles.container}>
            <div className={styles.sectionLabel}>How matching works</div>
            <h2 className={styles.sectionHeading}>From your first conversation to your first milestone.</h2>
            <div className={styles.stepsGrid}>
              {steps.map((s) => (
                <div key={s.n} className={styles.stepCard}>
                  <div className={styles.stepNum}>{s.n}</div>
                  <div className={styles.stepTitle}>{s.title}</div>
                  <div className={styles.stepDesc}>{s.desc}</div>
                  <span className={styles.stepTag}>{s.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── RESULTS ── */}
      <section className={styles.section}>
        <Reveal>
          <div className={styles.container}>
            <div className={styles.sectionLabel}>What results to expect</div>
            <h2 className={styles.sectionHeading}>Real outcomes from fractional commercial engagements.</h2>
            <p className={styles.sectionSub}>Results vary by business stage, sales cycle, and ACV. Here&apos;s what our engagement models can deliver.</p>
            <div className={styles.resultsGrid}>
              {results.map((r) => (
                <div key={r.stat} className={styles.resultCard}>
                  <div className={styles.resultStat}>{r.stat}</div>
                  <div className={styles.resultLabel}>{r.label}</div>
                  <div className={styles.resultNote}>{r.note}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── ENGAGEMENT TYPES ── */}
      <section className={styles.section}>
        <Reveal>
          <div className={styles.container}>
            <div className={styles.sectionLabel}>Engagement types</div>
            <h2 className={styles.sectionHeading}>Three core structures. Pick the one that fits.</h2>
            <p className={styles.sectionSub}>Every engagement falls into one of three structures. Retainers come in two flavours. Add-ons (success-fee, equity, conversion) layer on top of any of them.</p>
            {/* 2x2 Engagement Matrix
                 Top-left: Consultation  |  Top-right: Sprint
                 Bottom (full width):    Retainer description (left) + 2 flavours (right) */}
            <div className={styles.engMatrix}>
              <div className={styles.engMatrixCell}>
                <div className={styles.engName}>{engagements[0].name}</div>
                <div className={styles.engPrice}>{engagements[0].price}</div>
                <div className={styles.engDesc}>{engagements[0].desc}</div>
              </div>
              <div className={styles.engMatrixCell}>
                <div className={styles.engName}>{engagements[1].name}</div>
                <div className={styles.engPrice}>{engagements[1].price}</div>
                <div className={styles.engDesc}>{engagements[1].desc}</div>
              </div>
              <div className={styles.engMatrixRetainer}>
                <div className={styles.engRetainerLeft}>
                  <div className={styles.engName}>{engagements[2].name}</div>
                  <div className={styles.engPrice}>{engagements[2].price}</div>
                  <div className={styles.engDesc}>{engagements[2].desc}</div>
                </div>
                <div className={styles.engRetainerRight}>
                  <div className={styles.engFlavoursLabel}>Two flavours</div>
                  {engagements[2].flavours.map((f) => (
                    <div key={f.label} className={styles.engFlavour}>
                      <div className={styles.engFlavourLabel}>{f.label}</div>
                      <div className={styles.engFlavourDesc}>{f.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.addOnsBlock}>
              <div className={styles.addOnsLabel}>Optional add-ons (layer on top of any structure)</div>
              <div className={styles.addOnsStack}>
                {addOns.map((a) => (
                  <div key={a.name} className={styles.addOnRow}>
                    <div className={styles.addOnName}>{a.name}</div>
                    <div className={styles.addOnDesc}>{a.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.engNote}>
              Platform charges a 10% fee on all cash engagements — covering vetting, onboarding, contracting, payments, and compliance. No hidden fees.
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── FAQ ── */}
      <FaqSection groups={companiesFaqGroups} />

      {/* ── GUARANTEE ── */}
      <section className={styles.guaranteeSection}>
        <Reveal>
          <div className={styles.container}>
            <div className={styles.guaranteeBadge}>
              <div className={styles.guaranteeIcon}>&#x1F6E1;&#xFE0F;</div>
              <div>
                <div className={styles.guaranteeTitle}>Satisfaction guaranteed. Rematch at no cost.</div>
                <div className={styles.guaranteeDesc}>If a match doesn&apos;t work out, we&apos;ll connect you with a new professional from our network at no additional cost. We vet and stand by every professional on BridgeScale.</div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <Reveal>
          <div className={styles.container}>
            <h2 className={styles.ctaTitle}>Ready to find your fractional commercial team?</h2>
            <p className={styles.ctaDesc}>Create your free account and get a curated talent shortlist. Pay only when you&apos;re ready to unlock matches.</p>
            <Link href="/for-companies/apply" className="btn btn-primary">Apply as a company &rarr;</Link>
          </div>
        </Reveal>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerInner}>
            <Link href="/" className={styles.footerLogo}>BridgeScale</Link>
            <div className={styles.footerNote}>
              Fractional diaspora senior talent for India&apos;s startups &amp; MSMEs.
            </div>
            <div className={styles.footerLinks}>
              <Link href="/" className={styles.footerLink}>Home</Link>
              <Link href="/for-talent" className={styles.footerLink}>For Talent</Link>
              <Link href="/about" className={styles.footerLink}>About</Link>
              <Link href="/blog" className={styles.footerLink}>Blog</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
