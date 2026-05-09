'use client';

import Link from 'next/link';
import { MarketingNav } from '@/components/MarketingNav';
import styles from './ServicePage.module.css';

export type ServiceRole = {
  name: string;
  desc: string;
};

export type ServiceEngagement = {
  name: string;
  desc: string;
};

export type ServiceOutcome = {
  text: string;
};

export type ServiceData = {
  slug: string;
  eyebrow: string;
  title: string;
  intro: string;
  about: string;
  roles: ServiceRole[];
  engagements: ServiceEngagement[];
  outcomes: ServiceOutcome[];
  price: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export default function ServicePage({ data }: { data: ServiceData }) {
  const ctaHref = data.ctaHref ?? '/for-companies/apply';
  const ctaLabel = data.ctaLabel ?? 'Apply as a company →';

  return (
    <div className={styles.page}>
      <MarketingNav />

      <header className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.eyebrow}>{data.eyebrow}</div>
          <h1 className={styles.title}>{data.title}</h1>
          <p className={styles.intro}>{data.intro}</p>
          <div className={styles.heroActions}>
            <Link href={ctaHref} className="btn btn-primary">{ctaLabel}</Link>
            <Link href="/for-companies" className="btn btn-secondary">All services</Link>
          </div>
        </div>
      </header>

      {/* 1. What this service is */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionLabel}>What this service is</div>
          <p className={styles.aboutCopy}>{data.about}</p>
        </div>
      </section>

      {/* 2. Roles you'll work with */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.container}>
          <div className={styles.sectionLabel}>Roles you&apos;ll work with</div>
          <h2 className={styles.sectionHeading}>Senior commercial talent, mapped to outcomes.</h2>
          <div className={styles.roleGrid}>
            {data.roles.map((r) => (
              <div key={r.name} className={styles.roleCard}>
                <div className={styles.roleName}>{r.name}</div>
                <div className={styles.roleDesc}>{r.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. How it's typically engaged */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionLabel}>How it&apos;s typically engaged</div>
          <h2 className={styles.sectionHeading}>Pick the structure that matches the work.</h2>
          <div className={styles.engagementGrid}>
            {data.engagements.map((e) => (
              <div key={e.name} className={styles.engagementCard}>
                <div className={styles.engagementName}>{e.name}</div>
                <div className={styles.engagementDesc}>{e.desc}</div>
              </div>
            ))}
          </div>
          <div className={styles.engagementNote}>
            Add-ons (success-fee, equity) layer on top of any structure where the trigger is well-defined. Full-time conversion is handled separately as a lifecycle event.
          </div>
        </div>
      </section>

      {/* 4. Typical outcomes */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.container}>
          <div className={styles.sectionLabel}>Typical outcomes</div>
          <h2 className={styles.sectionHeading}>What success looks like.</h2>
          <ul className={styles.outcomeList}>
            {data.outcomes.map((o, i) => (
              <li key={i} className={styles.outcomeItem}>
                <span className={styles.outcomeMarker} aria-hidden>&rarr;</span>
                <span>{o.text}</span>
              </li>
            ))}
          </ul>
          <div className={styles.outcomeNote}>
            Outcomes depend on product readiness, target market, and sales cycle. Every engagement is milestone-tracked through the platform.
          </div>
        </div>
      </section>

      {/* 5. Indicative price */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionLabel}>Indicative price</div>
          <p className={styles.priceCopy}>{data.price}</p>
          <p className={styles.priceFootnote}>
            BridgeScale charges a 10% platform fee on cash engagements, paid by the company on top of the operator&apos;s stated rate. EOR and partner fees, where applicable, are passed through at cost as a separate line item.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <h2 className={styles.ctaTitle}>Ready to scope a {data.eyebrow.toLowerCase()} engagement?</h2>
          <p className={styles.ctaDesc}>
            Sign up free. Share your goals. Get a curated shortlist within 48 hours. Pay only when you&apos;re ready to unlock matches.
          </p>
          <div className={styles.ctaActions}>
            <Link href={ctaHref} className="btn btn-primary">{ctaLabel}</Link>
            <Link href="/learn" className="btn btn-secondary">Learn more</Link>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerInner}>
            <Link href="/" className={styles.footerLogo}>BridgeScale</Link>
            <div className={styles.footerNote}>
              Fractional diaspora senior talent for India&apos;s startups &amp; MSMEs.
            </div>
            <div className={styles.footerLinks}>
              <Link href="/for-companies" className={styles.footerLink}>For Companies</Link>
              <Link href="/for-talent" className={styles.footerLink}>For Talent</Link>
              <Link href="/learn" className={styles.footerLink}>Learn</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
