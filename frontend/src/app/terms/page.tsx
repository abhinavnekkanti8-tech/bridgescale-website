import Link from 'next/link';
import { CURRENT_NOTICE_VERSION, PRIVACY_PATH } from '@/lib/legal';

const sectionStyle = {
  marginBottom: '2rem',
  lineHeight: 1.7,
  color: '#d7d2ca',
} as const;

export default function TermsPage() {
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

        <h1 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Terms of Use</h1>
        <p style={{ color: '#b4aea5', marginBottom: '3rem' }}>
          Version {CURRENT_NOTICE_VERSION}. These terms govern access to and use of the BridgeScale
          platform and related services.
        </p>

        <section style={sectionStyle}>
          <h2>Platform scope</h2>
          <p>
            BridgeScale provides application intake, matching, contracting, and engagement support
            for companies and fractional talent. Access may be limited, reviewed, suspended, or
            refused where needed to protect the platform or other users.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2>User commitments</h2>
          <p>
            You agree to provide accurate information, keep your credentials secure, use the platform
            lawfully, and avoid uploading or sharing material you do not have the right to use.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2>Applications and matching</h2>
          <p>
            Submitting an application does not guarantee approval, matching, or engagement. BridgeScale
            may use AI-assisted tooling and human review to evaluate applications, generate summaries,
            and prioritize suitable matches.
          </p>
          <p>
            If you submit reference details, you represent that you have a lawful basis to share them
            for review and verification. You also acknowledge that relevant third-party processors may
            be used to deliver email, payments, hosting, and AI-assisted platform functions.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2>Payments and services</h2>
          <p>
            Fees, payment timing, and engagement terms are set out in the applicable product flow,
            order, or contract. Additional commercial terms may apply once companies and operators
            move into a live engagement.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2>Liability and changes</h2>
          <p>
            The platform is provided on an evolving basis and may change over time. To the maximum
            extent permitted by law, BridgeScale limits liability for indirect or consequential loss
            arising from platform use.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2>Contact</h2>
          <p>
            Questions about these terms should be directed to BridgeScale support through your usual
            onboarding or platform contact channel.
          </p>
        </section>

        <p style={{ color: '#b4aea5' }}>
          Related notice: <Link href={PRIVACY_PATH} style={{ color: '#9e7f5a' }}>Privacy Notice</Link>
        </p>
      </div>
    </main>
  );
}
