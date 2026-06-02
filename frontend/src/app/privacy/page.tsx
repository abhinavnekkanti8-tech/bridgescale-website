import Link from 'next/link';
import { CURRENT_NOTICE_VERSION, TERMS_PATH } from '@/lib/legal';

const sectionStyle = {
  marginBottom: '2rem',
  lineHeight: 1.7,
  color: '#d7d2ca',
} as const;

export default function PrivacyPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#11110f',
        color: '#f5f3ef',
        padding: '4rem 1.5rem',
        fontFamily: 'var(--font-body, sans-serif)',
      }}
    >
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <Link href="/" style={{ color: '#9e7f5a', textDecoration: 'none' }}>
          Back to home
        </Link>

        <h1 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Privacy Notice</h1>
        <p style={{ color: '#b4aea5', marginBottom: '3rem' }}>
          Version {CURRENT_NOTICE_VERSION}. This notice explains how BridgeScale collects, uses,
          stores, and shares personal data when you use the platform.
        </p>

        <section style={sectionStyle}>
          <h2>What we collect</h2>
          <p>
            We collect account details, contact information, company or professional profile
            details, application answers, uploaded documents, payment records, reference details,
            and platform activity needed to evaluate applications and run engagements.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2>How we use it</h2>
          <p>
            We use personal data to create and secure accounts, review applications, run AI-assisted
            diagnosis and matching workflows, contact applicants, verify references, manage payments,
            administer contracts, and support compliance and fraud prevention.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2>AI and reference checks</h2>
          <p>
            Application materials may be processed by AI systems to support evaluation, matching,
            summaries, and operational recommendations. Talent references and LinkedIn details may be
            checked as part of verification and suitability review.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2>Third-party processors</h2>
          <p>
            We use service providers for hosting and storage, transactional email, payments, and AI
            processing. Those providers act on our instructions to help us operate the service.
          </p>
          <ul>
            <li>Resend for transactional email delivery</li>
            <li>Razorpay and Stripe for payment processing</li>
            <li>OpenAI for AI-assisted evaluation, summaries, and matching support</li>
            <li>Hosting, database, cache, and protected document storage providers for platform operations</li>
          </ul>
        </section>

        <section style={sectionStyle}>
          <h2>Reference notices</h2>
          <p>
            When talent applicants submit professional references, they confirm they are authorized
            to share those details for vetting and engagement review. BridgeScale uses those details
            only for verification, suitability review, and related audit follow-up.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2>Retention and rights</h2>
          <p>
            We keep data for as long as needed to operate the service, comply with legal obligations,
            resolve disputes, and maintain audit records. You can contact us to request access,
            correction, or deletion where applicable.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2>Contact</h2>
          <p>
            For privacy questions or data requests, contact BridgeScale support using the details
            provided in your onboarding communications.
          </p>
        </section>

        <p style={{ color: '#b4aea5' }}>
          Related terms: <Link href={TERMS_PATH} style={{ color: '#9e7f5a' }}>Terms of Use</Link>
        </p>
      </div>
    </main>
  );
}
