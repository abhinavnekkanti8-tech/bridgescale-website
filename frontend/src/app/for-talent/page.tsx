'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { MarketingNav } from '@/components/MarketingNav';
import FaqSection from '@/components/FaqSection';
import { talentFaqGroups } from '@/content/faq';
import styles from './talent.module.css';

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
const whyCards = [
  { title: 'Compensated, not voluntary', desc: 'Every engagement is scoped, documented, and paid. No more informal advisory calls where your expertise generates value you never see.' },
  { title: 'Fits your schedule', desc: 'Designed to work alongside your existing full-time role. Most engagements need 15\u201320 hours/week. You set your availability.' },
  { title: 'Platform handles the admin', desc: 'Contracting, cross-border payments, compliance, EOR support, milestone tracking \u2014 we handle the mechanics so you focus on delivery.' },
  { title: 'Build a fractional portfolio', desc: 'Work with multiple companies. Build a track record on the platform. Your reputation and engagement history compound over time.' },
  { title: 'Indian startups that need you', desc: 'The demand side is specifically Indian startups and MSMEs going international \u2014 companies that need your market fluency and networks.' },
  { title: 'Path to more', desc: 'Start fractional. If a company and you both want full-time, the platform supports that transition. 80% of our leadership engagements convert.' },
];

const vettingSteps = [
  { n: '01', title: 'Verified references', desc: 'Provide 5 references from past employers and clients \u2014 including the CEO or founder, other executives, and at least 2 direct reports. All references are contacted and verified by our team.', note: 'We verify every reference personally. No automated checks.' },
  { n: '02', title: 'Expert interview', desc: 'A live video interview with a subject matter expert on our team. We assess your communication skills, depth of commercial experience, domain expertise, and professionalism. For leadership candidates: you must clearly demonstrate a turnaround \u2014 your role, metrics, and how you worked cross-functionally.', note: 'We screen for experience AND fit, not just credentials.' },
  { n: '03', title: 'Domain-specific pitch', desc: 'For sales execution roles: review a proprietary case study and submit a 60\u201390 second pitch video. Every pitch is reviewed by peers in the network \u2014 not by an algorithm. For leadership roles: present a structured turnaround narrative with cross-functional metrics and stakeholder navigation.', note: 'Peer review ensures quality \u2014 our network holds itself accountable.' },
];

const flowSteps = [
  { n: '01', title: 'Get accepted into the network', desc: 'Pass all three vetting stages. Your profile goes live and is visible to the matching engine.', tag: 'One-time' },
  { n: '02', title: 'Get matched to relevant companies', desc: 'AI matches you based on your expertise, market knowledge, ACV range, and engagement preferences. No cold outreach needed \u2014 companies come to you.', tag: 'AI-powered' },
  { n: '03', title: 'Engage on your terms', desc: 'Choose your structure: consultation, sprint, retainer, success-fee, or hybrid. Set your availability and pricing. All documented in a Scope of Work.', tag: 'You choose' },
  { n: '04', title: 'Deliver with platform support', desc: 'Milestone-tracked engagements. Platform handles invoicing, payments, compliance. You focus on delivering commercial results.', tag: 'Managed' },
];

const compensation = [
  { name: 'Monthly retainer', range: '$5,000\u2013$10,000/mo', desc: 'Ongoing fractional engagement with a fixed monthly fee. Regular cadence, sustained delivery. Ideal for 15\u201320 hours/week.' },
  { name: 'Sprint fee', range: 'From $2,500', desc: 'Fixed fee for a time-boxed project. Deliver a defined outcome in a defined window. Clear scope, clear compensation.' },
  { name: 'Success fee', range: 'Outcome-based', desc: 'Compensation tied to commercial results \u2014 deals closed, partnerships activated, revenue generated. Aligned incentives.' },
  { name: 'Hybrid cash + equity', range: 'Negotiated', desc: 'Lower cash retainer combined with meaningful equity. For talent willing to share risk for higher upside. Documented via FAST templates.' },
];

const roles = [
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
];

export default function ForTalentPage() {
  return (
    <div className={styles.page}>
      {/* ── NAV ── */}
      <MarketingNav />

      {/* ── HERO ── */}
      <header className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroLabel}>For Indian Diaspora Professionals</div>
          <h1 className={styles.heroTitle}>
            Structured fractional work. Fair compensation. Real impact.
          </h1>
          <p className={styles.heroDesc}>
            You&apos;ve built pipelines, entered markets, and closed enterprise deals across international markets. BridgeScale gives you a structured way to deploy that expertise fractionally — compensated, scoped, and platform-managed.
          </p>
          <div className={styles.heroActions}>
            <Link href="/for-talent/apply" className="btn btn-primary">Join as fractional talent &rarr;</Link>
            <a href="#vetting" className="btn btn-secondary">See the vetting process</a>
          </div>
        </div>
      </header>

      {/* ── WHY BRIDGESCALE ── */}
      <section className={styles.section}>
        <Reveal>
          <div className={styles.container}>
            <div className={styles.sectionLabel}>Why BridgeScale</div>
            <h2 className={styles.sectionHeading}>Not unpaid mentoring. Not angel investing. Structured commercial work.</h2>
            <div className={styles.whyGrid}>
              {whyCards.map((item) => (
                <div key={item.title} className={styles.whyCard}>
                  <div className={styles.whyTitle}>{item.title}</div>
                  <div className={styles.whyDesc}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── VETTING PROCESS ── */}
      <section id="vetting" className={styles.section}>
        <Reveal>
          <div className={styles.container}>
            <div className={styles.sectionLabel}>The vetting process</div>
            <h2 className={styles.sectionHeading}>Three stages. Only the qualified make it through.</h2>
            <p className={styles.sectionSub}>We receive hundreds of applications. Our multi-stage process ensures every professional on BridgeScale has proven their ability to deliver.</p>
            <div className={styles.vettingSteps}>
              {vettingSteps.map((s) => (
                <div key={s.n} className={styles.vStep}>
                  <div className={styles.vNum}>{s.n}</div>
                  <div className={styles.vTitle}>{s.title}</div>
                  <div className={styles.vDesc}>{s.desc}</div>
                  <div className={styles.vNote}>{s.note}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── HOW ENGAGEMENT WORKS ── */}
      <section className={styles.section}>
        <Reveal>
          <div className={styles.container}>
            <div className={styles.sectionLabel}>How engagement works</div>
            <h2 className={styles.sectionHeading}>From acceptance to active delivery.</h2>
            <div className={styles.flowSteps}>
              {flowSteps.map((step) => (
                <div key={step.n} className={styles.flowStep}>
                  <div className={styles.flowNum}>{step.n}</div>
                  <div className={styles.flowTitle}>{step.title}</div>
                  <div className={styles.flowDesc}>{step.desc}</div>
                  <span className={styles.flowTag}>{step.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── COMPENSATION ── */}
      <section className={styles.section}>
        <Reveal>
          <div className={styles.container}>
            <div className={styles.sectionLabel}>Compensation structures</div>
            <h2 className={styles.sectionHeading}>Multiple ways to get paid. All documented. All platform-managed.</h2>
            <div className={styles.compGrid}>
              {compensation.map((item) => (
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
        </Reveal>
      </section>

      {/* ── ROLES ── */}
      <section className={styles.section}>
        <Reveal>
          <div className={styles.container}>
            <div className={styles.sectionLabel}>Fractional roles available</div>
            <h2 className={styles.sectionHeading}>Deploy your expertise where it matters most.</h2>
            <div className={styles.rolesGrid}>
              {roles.map((role) => (
                <div key={role} className={styles.roleChip}>{role}</div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── FAQ ── */}
      <FaqSection groups={talentFaqGroups} />

      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <Reveal>
          <div className={styles.container}>
            <h2 className={styles.ctaTitle}>Ready to put your expertise to work?</h2>
            <p className={styles.ctaDesc}>Join BridgeScale for free — create your account and get vetted. Pay $50 only when you're ready to unlock company matches.</p>
            <Link href="/for-talent/apply" className="btn btn-primary">Join as fractional talent &rarr;</Link>
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
              <Link href="/for-companies" className={styles.footerLink}>For Companies</Link>
              <Link href="/about" className={styles.footerLink}>About</Link>
              <Link href="/blog" className={styles.footerLink}>Blog</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
