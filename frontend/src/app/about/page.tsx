'use client';

import Link from 'next/link';
import { MarketingNav } from '@/components/MarketingNav';
import styles from './about.module.css';

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <MarketingNav />

      {/* ── HERO ── */}
      <header className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.eyebrow}>About BridgeScale</div>
          <h1 className={styles.heroTitle}>
            The infrastructure layer between Indian ambition and international markets.
          </h1>
          <p className={styles.heroDesc}>
            BridgeScale exists because the talent already exists. What&apos;s missing is the structure to deploy it professionally — on both sides.
          </p>
        </div>
      </header>

      {/* ── ORIGIN ── */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.asymGrid}>
            <div className={styles.asymLeft}>
              <div className={styles.sectionLabel}>Why we exist</div>
              <h2 className={styles.sectionHeading}>
                India&apos;s startups are maturing. Their global ambition is outpacing their commercial infrastructure.
              </h2>
            </div>
            <div className={styles.asymRight}>
              <p className={styles.bodyText}>
                Thousands of Indian professionals have spent decades building pipelines, entering international markets, and leading commercial teams across the US, UK, Europe, and APAC. Many of them genuinely want to contribute to the Indian startup ecosystem — not as investors, not as mentors, but as practitioners.
              </p>
              <p className={styles.bodyText}>
                The problem isn&apos;t interest. It&apos;s infrastructure. There&apos;s no professional, scoped, paid mechanism for that contribution to happen. Advisory roles are informal. Equity arrangements are complicated. Full-time relocations are unrealistic.
              </p>
              <p className={styles.bodyText}>
                BridgeScale is the mechanism. A platform that converts diaspora expertise into structured fractional engagements — compensated, scoped, milestone-tracked, and platform-managed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div className={styles.rule} />

      {/* ── MODEL ── */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionLabel}>How we operate</div>
          <h2 className={styles.sectionHeading}>Not a marketplace. An infrastructure layer.</h2>
          <div className={styles.pillars}>
            {[
              {
                n: '01',
                title: 'Rigorous vetting on the talent side',
                desc: 'Every professional is assessed through verified references, a live expert interview, and a domain-specific pitch reviewed by peers. We accept roughly 1 in 7 applicants. Quality is a constraint, not a goal.',
              },
              {
                n: '02',
                title: 'Structured intake on the company side',
                desc: 'Companies don\'t just post a job and wait. We run a structured commercial diagnostic — identifying the actual gap, not just the stated need — before any matching begins.',
              },
              {
                n: '03',
                title: 'AI-assisted, human-reviewed matching',
                desc: 'Our matching engine generates ranked shortlists with explainable rationale. Every match is reviewed by a platform operator before it reaches the company. Speed without recklessness.',
              },
              {
                n: '04',
                title: 'Platform-managed delivery',
                desc: 'Contracting, cross-border payments, compliance, EOR support, milestone tracking — we handle the mechanics on both sides. The engagement runs through the platform, not around it.',
              },
            ].map((p) => (
              <div key={p.n} className={styles.pillar}>
                <div className={styles.pillarNum}>{p.n}</div>
                <div className={styles.pillarTitle}>{p.title}</div>
                <div className={styles.pillarDesc}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div className={styles.rule} />

      {/* ── VALUES ── */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionLabel}>What we believe</div>
          <h2 className={styles.sectionHeading}>Principles that govern how we build this.</h2>
          <div className={styles.valuesGrid}>
            {[
              { title: 'Compensation is respect', desc: 'Diaspora professionals deserve to be paid for their expertise — not asked to mentor, advise, or angel-invest as a substitute for real engagement. Every BridgeScale engagement is compensated.' },
              { title: 'Scope before speed', desc: 'A bad match, fast, is worse than a good match, slow. We invest in understanding what a company actually needs before we introduce anyone.' },
              { title: 'Accountability on both sides', desc: 'Companies get structured milestones. Talent gets milestone-gated payments. Platform sits in the middle ensuring both sides follow through.' },
              { title: 'Cultural match matters', desc: 'The diaspora connection isn\'t just a sourcing angle — it\'s a substantive advantage. Professionals who understand India\'s domestic context AND the target market are genuinely better positioned to open doors.' },
              { title: 'Fractional is a legitimate model', desc: 'Not a stepping stone to full-time. Not a compromise. Fractional senior talent is often the right structure for the stage of company and the nature of the work.' },
              { title: 'The platform handles the boring parts', desc: 'Cross-border contracts, tax compliance, milestone tracking, payment escrow — this infrastructure exists so both sides can focus on the work itself.' },
            ].map((v) => (
              <div key={v.title} className={styles.valueCard}>
                <div className={styles.valueTitle}>{v.title}</div>
                <div className={styles.valueDesc}>{v.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaInner}>
            <div>
              <h2 className={styles.ctaTitle}>Be part of the first cohort.</h2>
              <p className={styles.ctaDesc}>We&apos;re accepting early applications from both companies and talent. Cohort size is intentionally small.</p>
            </div>
            <div className={styles.ctaActions}>
              <Link href="/for-companies" className="btn btn-primary">Apply as a company</Link>
              <Link href="/for-talent" className="btn btn-secondary">Join as talent</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerInner}>
            <Link href="/" className={styles.footerLogo}>BridgeScale</Link>
            <div className={styles.footerNote}>Fractional diaspora senior talent for India&apos;s startups &amp; MSMEs.</div>
            <div className={styles.footerLinks}>
              <Link href="/" className={styles.footerLink}>Home</Link>
              <Link href="/for-companies" className={styles.footerLink}>For Companies</Link>
              <Link href="/for-talent" className={styles.footerLink}>For Talent</Link>
              <Link href="/blog" className={styles.footerLink}>Blog</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
