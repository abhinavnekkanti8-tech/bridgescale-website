'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import styles from './companies.module.css';

const Check = () => (
  <svg viewBox="0 0 10 10" width="10" height="10" fill="none">
    <path d="M2 5l2.5 2.5L8 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function ForCompaniesPage() {
  return (
    <div className={styles.page}>
      {/* NAV */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.logo}>
            <span className={`${styles.logoMark} gradient-text`}>◆</span>
            <span className={styles.logoText}>Bridge<span className="gradient-text">Sales</span></span>
          </Link>
          <div className={styles.navLinks}>
            <Link href="/" className={styles.navLink}>Home</Link>
            <Link href="/for-companies" className={styles.navLink}>For companies</Link>
            <Link href="/for-talent" className={styles.navLink}>For talent</Link>
            <a href="/#pricing" className={styles.navLink}>Pricing</a>
            <ThemeToggle />
            <a href="/#signup" className={styles.navCta}>Request early access</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.badge}>For Indian Startups &amp; MSMEs</div>
          <h1 className={styles.heroTitle}>
            Find vetted fractional talent for{' '}
            <span className="gradient-text">international growth</span>
          </h1>
          <p className={styles.heroSub}>
            Access experienced Indian diaspora sales leaders, BD operators, and partnership professionals — fractionally. No full-time commitment, no outsized hiring risk. Just structured commercial execution.
          </p>
          <div className={styles.heroActions}>
            <a href="/#signup" className="btn btn-primary">Apply as a company →</a>
            <a href="#how-matching-works" className="btn btn-secondary">See how matching works</a>
          </div>
        </div>
      </div>

      {/* WHAT WE SOLVE */}
      <section className={styles.section}>
        <div className={`${styles.container} fade-in`}>
          <div className={styles.sectionLabel}>The problem we solve</div>
          <h2 className={styles.sectionHeading}>You need international commercial capacity. But a full-time hire is too risky, too slow, or too expensive.</h2>
          <div className={styles.problemGrid}>
            {[
              { title: 'Hiring risk', desc: 'A full-time international sales hire at $150K–$250K with 6+ months to productivity is a bet most startups and MSMEs can\'t afford to lose.' },
              { title: 'Network gap', desc: 'You have a great product and some domestic traction. But you don\'t have the relationships, market fluency, or channel access in target international markets.' },
              { title: 'Engagement friction', desc: 'LinkedIn messages, warm introductions, and informal advisory calls don\'t produce structured, accountable commercial execution.' },
              { title: 'Execution gap', desc: 'You don\'t just need advice — you need someone who can build pipeline, close deals, and activate partnerships in markets where you have no presence.' },
            ].map((item) => (
              <div key={item.title} className={styles.problemCard}>
                <div className={styles.problemTitle}>{item.title}</div>
                <div className={styles.problemDesc}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW MATCHING WORKS */}
      <section id="how-matching-works" className={styles.section}>
        <div className={`${styles.container} fade-in`}>
          <div className={styles.sectionLabel}>How matching works</div>
          <h2 className={styles.sectionHeading}>From your first conversation to your first milestone.</h2>
          <div className={styles.stepsGrid}>
            {[
              { n: '01', title: 'Define what you need', desc: 'Share your growth goals, target markets, and the commercial gap you need to fill. Our structured intake + AI diagnosis surfaces what you actually need — even gaps you didn\'t describe.', tag: 'AI-assisted intake' },
              { n: '02', title: 'Get matched with vetted talent', desc: 'AI generates a ranked shortlist with explainable rationale. Every match is reviewed by platform operators before you see it. Average time to first introduction: under 48 hours.', tag: 'Operator-reviewed' },
              { n: '03', title: 'Book a free consultation', desc: '30-minute intro calls are always free. Meet as many matches as you like. No commitment until you\'re confident it\'s the right fit.', tag: 'Zero risk' },
              { n: '04', title: 'Engage with confidence', desc: 'A customised Scope of Work with clear deliverables, milestones, and pricing. We handle contracting, cross-border payments, and compliance — you focus on growth.', tag: 'Managed delivery' },
            ].map((step) => (
              <div key={step.n} className={styles.stepCard}>
                <div className={styles.stepNum}>{step.n}</div>
                <div className={styles.stepTitle}>{step.title}</div>
                <div className={styles.stepDesc}>{step.desc}</div>
                <span className={styles.stepTag}>{step.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT RESULTS TO EXPECT */}
      <section className={styles.section}>
        <div className={`${styles.container} fade-in`}>
          <div className={styles.sectionLabel}>What results to expect</div>
          <h2 className={styles.sectionHeading}>Real outcomes from fractional commercial engagements.</h2>
          <p className={styles.sectionSub}>Results vary by business stage, sales cycle, and ACV. Here&apos;s what our engagement models can deliver.</p>
          <div className={styles.resultsGrid}>
            <div className={styles.resultCard}>
              <div className={styles.resultStat}>10–15</div>
              <div className={styles.resultLabel}>qualified meetings booked per month</div>
              <div className={styles.resultNote}>From a fractional salesperson working 20 hours/week. Depends on your target buyer and market.</div>
            </div>
            <div className={styles.resultCard}>
              <div className={styles.resultStat}>$250K+</div>
              <div className={styles.resultLabel}>net new revenue generated</div>
              <div className={styles.resultNote}>Selling a $25K ACV product with a 2-month sales cycle. Actual results depend on your product-market fit.</div>
            </div>
            <div className={styles.resultCard}>
              <div className={styles.resultStat}>80%</div>
              <div className={styles.resultLabel}>fractional leaders hired full-time</div>
              <div className={styles.resultNote}>After a 6-month engagement. BridgeSales is fractional-first, but full-time conversion is supported.</div>
            </div>
            <div className={styles.resultCard}>
              <div className={styles.resultStat}>&lt; 48h</div>
              <div className={styles.resultLabel}>average time to first introduction</div>
              <div className={styles.resultNote}>From completed intake to your first vetted talent introduction. Most matches happen within 24 hours.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ENGAGEMENT TYPES */}
      <section className={styles.section}>
        <div className={`${styles.container} fade-in`}>
          <div className={styles.sectionLabel}>Engagement types</div>
          <h2 className={styles.sectionHeading}>Choose the structure that fits your business reality.</h2>
          <div className={styles.engagementGrid}>
            {[
              { name: 'Consultation', price: 'Free first 30 min', desc: 'One-time or short-series sessions. Strategy clarity, diagnosis, or a second opinion before committing to a longer engagement.' },
              { name: 'Sprint', price: 'From $2,500', desc: 'Time-boxed, high-intensity fractional execution. A defined output — pipeline built, market entered, channel mapped — in a defined window (typically 30 days).' },
              { name: 'Retainer', price: '$5,000–$10,000/mo', desc: 'Ongoing fractional engagement. Regular cadence, sustained execution, and strategic continuity. 15–20 hours/week from an embedded commercial operator.' },
              { name: 'Success-fee', price: 'Outcome-based', desc: 'Compensation tied to commercial results — deals closed, partnerships activated, revenue generated. Aligned incentives for both sides.' },
              { name: 'Hybrid', price: 'Cash + equity', desc: 'For talent willing to share risk. A lower cash retainer combined with meaningful equity stake. Documented via FAST templates.' },
              { name: 'Full leadership', price: 'Custom', desc: 'Senior fractional roles (VP Sales, CRO-type) with a longer arc — building teams, owning revenue, and operating as part of your leadership team.' },
            ].map((item) => (
              <div key={item.name} className={styles.engCard}>
                <div className={styles.engName}>{item.name}</div>
                <div className={styles.engPrice}>{item.price}</div>
                <div className={styles.engDesc}>{item.desc}</div>
              </div>
            ))}
          </div>
          <div className={styles.engNote}>
            Platform charges a 10% fee on all cash engagements — covering vetting, onboarding, contracting, payments, and compliance. No hidden fees.
          </div>
        </div>
      </section>

      {/* GUARANTEE */}
      <section className={styles.guaranteeSection}>
        <div className={`${styles.container} fade-in`}>
          <div className={styles.guaranteeBadge}>
            <div className={styles.guaranteeIcon}>🛡️</div>
            <div>
              <div className={styles.guaranteeTitle}>Satisfaction guaranteed. Rematch at no cost.</div>
              <div className={styles.guaranteeDesc}>If a match doesn&apos;t work out, we&apos;ll connect you with a new professional from our network at no additional cost. We vet and stand by every professional on BridgeSales.</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={`${styles.container} fade-in`}>
          <h2 className={styles.ctaTitle}>Ready to find your fractional commercial team?</h2>
          <p className={styles.ctaDesc}>Apply as a company — $200 one-time activation fee covers your full intake, diagnosis, and curated talent matching.</p>
          <a href="/#signup" className="btn btn-primary">Apply as a company →</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerInner}>
            <Link href="/" className={styles.footerLogo}>
              <span className="gradient-text">◆</span> Bridge<span className="gradient-text">Sales</span>
            </Link>
            <div className={styles.footerNote}>
              Fractional-first diaspora talent for India&apos;s startups &amp; MSMEs.
            </div>
            <div className={styles.footerLinks}>
              <Link href="/" className={styles.footerLink}>Home</Link>
              <Link href="/for-talent" className={styles.footerLink}>For talent</Link>
              <a href="/#pricing" className={styles.footerLink}>Pricing</a>
              <a href="/#faq" className={styles.footerLink}>FAQ</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
