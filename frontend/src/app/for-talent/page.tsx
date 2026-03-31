'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import styles from './talent.module.css';

const Check = () => (
  <svg viewBox="0 0 10 10" width="10" height="10" fill="none">
    <path d="M2 5l2.5 2.5L8 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function ForTalentPage() {
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
            <a href="/#signup" className={styles.navCta}>Join as talent</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.badge}>For Indian Diaspora Professionals</div>
          <h1 className={styles.heroTitle}>
            Structured fractional work.{' '}
            <span className="gradient-text">Fair compensation. Real impact.</span>
          </h1>
          <p className={styles.heroSub}>
            You&apos;ve built pipelines, entered markets, and closed enterprise deals across international markets. BridgeSales gives you a structured way to deploy that expertise fractionally — compensated, scoped, and platform-managed.
          </p>
          <div className={styles.heroActions}>
            <a href="/#signup" className="btn btn-primary">Join as fractional talent →</a>
            <a href="#vetting" className="btn btn-secondary">See the vetting process</a>
          </div>
        </div>
      </div>

      {/* WHY BRIDGESALES */}
      <section className={styles.section}>
        <div className={`${styles.container} fade-in`}>
          <div className={styles.sectionLabel}>Why BridgeSales</div>
          <h2 className={styles.sectionHeading}>Not unpaid mentoring. Not angel investing. Structured commercial work.</h2>
          <div className={styles.whyGrid}>
            {[
              { title: 'Compensated, not voluntary', desc: 'Every engagement is scoped, documented, and paid. No more informal advisory calls where your expertise generates value you never see.', icon: '💰' },
              { title: 'Fits your schedule', desc: 'Designed to work alongside your existing full-time role. Most engagements need 15–20 hours/week. You set your availability.', icon: '⏱️' },
              { title: 'Platform handles the admin', desc: 'Contracting, cross-border payments, compliance, EOR support, milestone tracking — we handle the mechanics so you focus on delivery.', icon: '⚙️' },
              { title: 'Build a fractional portfolio', desc: 'Work with multiple companies. Build a track record on the platform. Your reputation and engagement history compound over time.', icon: '📈' },
              { title: 'Indian startups that need you', desc: 'The demand side is specifically Indian startups and MSMEs going international — companies that need your market fluency and networks.', icon: '🇮🇳' },
              { title: 'Path to more', desc: 'Start fractional. If a company and you both want full-time, the platform supports that transition. 80% of our leadership engagements convert.', icon: '🚀' },
            ].map((item) => (
              <div key={item.title} className={styles.whyCard}>
                <div className={styles.whyIcon}>{item.icon}</div>
                <div className={styles.whyTitle}>{item.title}</div>
                <div className={styles.whyDesc}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VETTING PROCESS */}
      <section id="vetting" className={styles.section}>
        <div className={`${styles.container} fade-in`}>
          <div className={styles.sectionLabel}>The vetting process</div>
          <h2 className={styles.sectionHeading}>Three stages. Only the qualified make it through.</h2>
          <p className={styles.sectionSub}>We receive hundreds of applications. Our multi-stage process ensures every professional on BridgeSales has proven their ability to deliver.</p>
          <div className={styles.vettingSteps}>
            <div className={styles.vStep}>
              <div className={styles.vNum}>01</div>
              <div className={styles.vTitle}>Verified references</div>
              <div className={styles.vDesc}>Provide 5 references from past employers and clients — including the CEO or founder, other executives, and at least 2 direct reports. All references are contacted and verified by our team.</div>
              <div className={styles.vNote}>💡 We verify every reference personally. No automated checks.</div>
            </div>
            <div className={styles.vStep}>
              <div className={styles.vNum}>02</div>
              <div className={styles.vTitle}>Expert interview</div>
              <div className={styles.vDesc}>A live video interview with a subject matter expert on our team. We assess your communication skills, depth of commercial experience, domain expertise, and professionalism. For leadership candidates: you must clearly demonstrate a turnaround — your role, metrics, and how you worked cross-functionally.</div>
              <div className={styles.vNote}>💡 We screen for experience AND fit, not just credentials.</div>
            </div>
            <div className={styles.vStep}>
              <div className={styles.vNum}>03</div>
              <div className={styles.vTitle}>Domain-specific pitch</div>
              <div className={styles.vDesc}>For sales execution roles: review a proprietary case study and submit a 60–90 second pitch video. Every pitch is reviewed by peers in the network — not by an algorithm. For leadership roles: present a structured turnaround narrative with cross-functional metrics and stakeholder navigation.</div>
              <div className={styles.vNote}>💡 Peer review ensures quality — our network holds itself accountable.</div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW ENGAGEMENT WORKS */}
      <section className={styles.section}>
        <div className={`${styles.container} fade-in`}>
          <div className={styles.sectionLabel}>How engagement works</div>
          <h2 className={styles.sectionHeading}>From acceptance to active delivery.</h2>
          <div className={styles.flowSteps}>
            {[
              { n: '01', title: 'Get accepted into the network', desc: 'Pass all three vetting stages. Your profile goes live and is visible to the matching engine.', tag: 'One-time' },
              { n: '02', title: 'Get matched to relevant companies', desc: 'AI matches you based on your expertise, market knowledge, ACV range, and engagement preferences. No cold outreach needed — companies come to you.', tag: 'AI-powered' },
              { n: '03', title: 'Engage on your terms', desc: 'Choose your structure: consultation, sprint, retainer, success-fee, or hybrid. Set your availability and pricing. All documented in a Scope of Work.', tag: 'You choose' },
              { n: '04', title: 'Deliver with platform support', desc: 'Milestone-tracked engagements. Platform handles invoicing, payments, compliance. You focus on delivering commercial results.', tag: 'Managed' },
            ].map((step) => (
              <div key={step.n} className={styles.flowStep}>
                <div className={styles.flowNum}>{step.n}</div>
                <div className={styles.flowTitle}>{step.title}</div>
                <div className={styles.flowDesc}>{step.desc}</div>
                <span className={styles.flowTag}>{step.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPENSATION */}
      <section className={styles.section}>
        <div className={`${styles.container} fade-in`}>
          <div className={styles.sectionLabel}>Compensation structures</div>
          <h2 className={styles.sectionHeading}>Multiple ways to get paid. All documented. All platform-managed.</h2>
          <div className={styles.compGrid}>
            {[
              { name: 'Monthly retainer', range: '$5,000–$10,000/mo', desc: 'Ongoing fractional engagement with a fixed monthly fee. Regular cadence, sustained delivery. Ideal for 15–20 hours/week.' },
              { name: 'Sprint fee', range: 'From $2,500', desc: 'Fixed fee for a time-boxed project. Deliver a defined outcome in a defined window. Clear scope, clear compensation.' },
              { name: 'Success fee', range: 'Outcome-based', desc: 'Compensation tied to commercial results — deals closed, partnerships activated, revenue generated. Aligned incentives.' },
              { name: 'Hybrid cash + equity', range: 'Negotiated', desc: 'Lower cash retainer combined with meaningful equity. For operators willing to share risk for higher upside. Documented via FAST templates.' },
            ].map((item) => (
              <div key={item.name} className={styles.compCard}>
                <div className={styles.compName}>{item.name}</div>
                <div className={styles.compRange}>{item.range}</div>
                <div className={styles.compDesc}>{item.desc}</div>
              </div>
            ))}
          </div>
          <div className={styles.compNote}>
            Platform takes a 10% fee on cash engagements to cover vetting, onboarding, contracting, payments, and compliance. You see transparent pricing for every engagement.
          </div>
        </div>
      </section>

      {/* WHAT YOU CAN DO */}
      <section className={styles.section}>
        <div className={`${styles.container} fade-in`}>
          <div className={styles.sectionLabel}>Fractional roles available</div>
          <h2 className={styles.sectionHeading}>Deploy your expertise where it matters most.</h2>
          <div className={styles.rolesGrid}>
            {[
              'Fractional VP Sales / CRO',
              'Sales execution (SDR, BDR, AE)',
              'Channel & reseller development',
              'Alliance & partnership ops',
              'International market entry',
              'GTM strategy & refinement',
              'Outbound pipeline generation',
              'Revenue operations & cadence',
              'Founder-led sales transition',
              'Customer success & retention',
            ].map((role) => (
              <div key={role} className={styles.roleChip}>
                <div className={styles.roleCheck}><Check /></div>
                {role}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={`${styles.container} fade-in`}>
          <h2 className={styles.ctaTitle}>Ready to put your expertise to work?</h2>
          <p className={styles.ctaDesc}>Join BridgeSales — $50 one-time application fee covers your vetting and onboarding into the network.</p>
          <a href="/#signup" className="btn btn-primary">Join as fractional talent →</a>
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
              <Link href="/for-companies" className={styles.footerLink}>For companies</Link>
              <a href="/#pricing" className={styles.footerLink}>Pricing</a>
              <a href="/#faq" className={styles.footerLink}>FAQ</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
