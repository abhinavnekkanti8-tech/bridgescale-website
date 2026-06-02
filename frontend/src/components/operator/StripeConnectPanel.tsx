'use client';

/**
 * StripeConnectPanel
 *
 * Operator-facing UI for Stripe Connect Express onboarding (Phase-3 plumbing,
 * P3.1 in the Implementation Plan). The live partner wire-up lands in Phase 6
 * (P6.2). For now this panel:
 *   - Explains what Stripe Connect Express is and why it's required
 *   - Surfaces the operator's payout-readiness from the tax-profile status
 *   - Stubs out a "Start onboarding" CTA that will flip a status row when ops
 *     enables the live Stripe redirect.
 */

import { useEffect, useState } from 'react';
import { TaxProfileStatus, operatorTaxApi, partnersApi } from '@/lib/api-client';
import styles from './StripeConnectPanel.module.css';

type StripeConnectStatus = 'NOT_STARTED' | 'PENDING' | 'ACTIVE' | 'BLOCKED';

const STATUS_LABEL: Record<StripeConnectStatus, string> = {
  NOT_STARTED: 'Not started',
  PENDING: 'Onboarding in progress',
  ACTIVE: 'Connected',
  BLOCKED: 'Blocked — see notes',
};

const STATUS_PILL: Record<StripeConnectStatus, string> = {
  NOT_STARTED: 'pill_muted',
  PENDING: 'pill_partial',
  ACTIVE: 'pill_done',
  BLOCKED: 'pill_pending',
};

export default function StripeConnectPanel() {
  const [tax, setTax] = useState<TaxProfileStatus | null>(null);
  const [loading, setLoading] = useState(true);
  // Local-only status until P6.2 wires the real Stripe flow. The real status
  // will come from the backend Stripe-account row.
  const [stripeStatus, setStripeStatus] = useState<StripeConnectStatus>('NOT_STARTED');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    operatorTaxApi.getMine()
      .then(setTax)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function onStartOnboarding() {
    setBusy(true);
    try {
      const returnUrl = window.location.origin + '/operator/dashboard?stripe=return';
      const link = await partnersApi.stripeOnboardingLink(returnUrl);
      setStripeStatus('PENDING');
      // Live mode redirects to the Stripe-hosted page; stub mode opens our placeholder URL.
      if (link.liveMode) {
        window.location.href = link.url;
      } else {
        alert(`Stripe Connect Express is in stub mode. Live URL: ${link.url}\n\nSet PARTNER_LIVE_MODE=true on the backend with valid Stripe keys to redirect to the real onboarding page.`);
      }
    } catch {
      alert('Could not start Stripe onboarding. Try again.');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className={styles.panel}><p className={styles.muted}>Loading…</p></div>;

  const taxBlocking = !tax?.basicComplete;

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <div>
          <h2>Payout account (Stripe Connect Express)</h2>
          <p className={styles.sub}>
            BridgeScale pays you through Stripe Connect Express for USD payouts and ACH (US operators). Cross-border payouts go through Wise; INR direct payouts go through Razorpay. You only need to onboard the rails that match your payout preferences.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
          <span className={`${styles.pill} ${styles[STATUS_PILL[stripeStatus]]}`}>
            {STATUS_LABEL[stripeStatus]}
          </span>
          <span style={{ fontSize: '0.65rem', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600, color: '#8a5a1f', padding: '2px 8px', background: '#fff3d6', borderRadius: 999 }}>
            STUB MODE — live wire-up in P6.2
          </span>
        </div>
      </div>

      <div className={styles.steps}>
        <Step
          n="01"
          title="Basic tax info on file"
          done={!!tax?.basicComplete}
          hint="Tax residency + payout country + payout currency saved in your profile."
        />
        <Step
          n="02"
          title="Stripe-hosted KYC"
          done={stripeStatus === 'ACTIVE'}
          hint="Identity verification and bank-account hookup, performed on Stripe's hosted page."
        />
        <Step
          n="03"
          title="First payout enabled"
          done={stripeStatus === 'ACTIVE' && tax?.payoutReady === true}
          hint="Tax forms verified by ops + Stripe account active. Triggers your first ACH payout."
        />
      </div>

      <div className={styles.body}>
        {taxBlocking && (
          <div className={styles.warn}>
            ⚠ Add basic tax info first (residency + payout country + currency). Without it, Stripe Connect onboarding can&apos;t collect the right form.
          </div>
        )}

        {!taxBlocking && stripeStatus === 'NOT_STARTED' && (
          <div className={styles.actions}>
            <button className="btn btn-primary" onClick={onStartOnboarding} disabled={busy}>
              {busy ? 'Starting…' : 'Start Stripe Connect onboarding →'}
            </button>
            <span className={styles.tinyNote}>
              You&apos;ll be redirected to Stripe to verify identity and connect your bank account. Takes ~5 minutes.
            </span>
          </div>
        )}

        {stripeStatus === 'PENDING' && (
          <div className={styles.note}>
            Your onboarding is in progress. Ops will reach out within 1 business day if anything is missing.
          </div>
        )}

        {stripeStatus === 'ACTIVE' && (
          <div className={styles.successNote}>
            ✓ Stripe Connect is active. You&apos;re payout-ready for USD / ACH engagements.
          </div>
        )}

        <div className={styles.alternates}>
          <strong>Other rails</strong>
          <ul>
            <li><b>Wise</b> — for cross-border USD/EUR/GBP/AUD/SGD payouts. Auto-enabled when your payout currency isn&apos;t USD.</li>
            <li><b>Razorpay (INR direct)</b> — for diaspora operators wanting NRE/NRO/Savings payouts to an Indian bank. Enabled when your payout country is IN.</li>
            <li><b>Employer of Record</b> — see the EOR panel below if your corridor needs it.</li>
          </ul>
        </div>

        <div className={styles.footnote}>
          Live Stripe redirect is wired in Phase 6 (P6.2). Today&apos;s &quot;Start onboarding&quot; just records intent so ops can complete onboarding manually.
        </div>
      </div>
    </section>
  );
}

function Step({ n, title, done, hint }: { n: string; title: string; done: boolean; hint: string }) {
  return (
    <div className={`${styles.step} ${done ? styles.stepDone : ''}`}>
      <div className={styles.stepNum}>{done ? '✓' : n}</div>
      <div>
        <div className={styles.stepTitle}>{title}</div>
        <div className={styles.stepHint}>{hint}</div>
      </div>
    </div>
  );
}
