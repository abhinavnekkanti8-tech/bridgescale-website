'use client';

/**
 * CancellationPolicyPanel
 *
 * Operator-facing explainer for cancellation, deferral, and no-show rules
 * (Master Plan §2.8). Renders as a collapsible panel on the operator dashboard.
 * Backend already records CancellationEvent rows — this is the human-readable
 * surface so operators understand the rules before they trip on them.
 */

import { useEffect, useState } from 'react';
import { coreFlowApi, StrikeStatus } from '@/lib/api-client';
import styles from './CancellationPolicyPanel.module.css';

interface Row {
  scenario: string;
  startup: string;
  operator: string;
}

const rows: Row[] = [
  {
    scenario: 'Either party cancels with 24+ hours notice',
    startup: 'No fee. Re-schedule freely.',
    operator: 'No fee. First cancellation per quarter is grace; subsequent ones may impact tier.',
  },
  {
    scenario: 'Cancellation under 24 hours notice',
    startup: '50% of session fee for paid Consultations. No fee for free intro calls.',
    operator: '50% session-fee penalty for paid Consultations. Counts toward three-strikes threshold.',
  },
  {
    scenario: 'No-show (party does not join)',
    startup: 'Full session fee charged for paid Consultations. No refund.',
    operator: 'Full session-fee penalty. Three no-shows in a rolling 90-day window pause your matching pool entry.',
  },
  {
    scenario: 'Deferral request before scheduled time',
    startup: 'First deferral per engagement is free. Subsequent deferrals: 24-hour notice required.',
    operator: 'First deferral per engagement is grace. Subsequent deferrals require 24-hour notice.',
  },
  {
    scenario: 'Engagement terminated mid-Sprint',
    startup: 'Pro-rata refund of unspent retainer; sprint fees prorated to milestones delivered.',
    operator: 'Pro-rata payout for hours delivered + accepted milestones; no penalty if termination is for cause.',
  },
];

export default function CancellationPolicyPanel() {
  const [open, setOpen] = useState(false);
  const [strikes, setStrikes] = useState<StrikeStatus | null>(null);

  useEffect(() => {
    coreFlowApi.getMyStrikes().then(setStrikes).catch(() => {});
  }, []);

  return (
    <section className={styles.panel}>
      <button
        type="button"
        className={styles.header}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div>
          <h2>Cancellation, deferral & no-show policy</h2>
          <p className={styles.sub}>The rules that govern late cancels, no-shows, and deferrals on the platform.</p>
        </div>
        <span className={styles.chev} aria-hidden>{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div className={styles.body}>
          {strikes && (
            <div className={`${styles.strikesBox} ${strikes.paused ? styles.strikesPaused : strikes.pausedAtRisk ? styles.strikesAtRisk : ''}`}>
              <div className={styles.strikesHeader}>
                <span className={styles.strikesTitle}>Your strikes (rolling {strikes.windowDays}-day window)</span>
                <span className={styles.strikesCount}>
                  {strikes.total}<span className={styles.strikesThreshold}> / {strikes.threshold}</span>
                </span>
              </div>
              <div className={styles.strikesBreakdown}>
                <span>{strikes.lateCancels} late cancels · {strikes.noShows} no-shows</span>
                {strikes.paused && <span className={styles.strikesPausedTag}>Matching pool paused</span>}
                {!strikes.paused && strikes.pausedAtRisk && <span className={styles.strikesAtRiskTag}>One more strike pauses your pool entry</span>}
                {!strikes.paused && !strikes.pausedAtRisk && strikes.total === 0 && <span className={styles.strikesGoodTag}>Clean record</span>}
              </div>
            </div>
          )}

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Scenario</th>
                  <th>Company impact</th>
                  <th>Operator impact</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.scenario}>
                    <td>{r.scenario}</td>
                    <td>{r.startup}</td>
                    <td>{r.operator}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.callouts}>
            <div className={styles.callout}>
              <div className={styles.calloutTitle}>Three-strikes rule (operators)</div>
              <p>
                Three no-shows or three under-24-hour cancellations in a rolling 90-day window pause your entry in the matching pool until ops review. Your tier may also be re-evaluated.
              </p>
            </div>
            <div className={styles.callout}>
              <div className={styles.calloutTitle}>First-deferral grace</div>
              <p>
                Per engagement, your first deferral is treated as grace — no penalty, no impact on tier. Subsequent deferrals follow the 24-hour-notice rule.
              </p>
            </div>
            <div className={styles.callout}>
              <div className={styles.calloutTitle}>Refunds for paid Consultations</div>
              <p>
                Full refund if the operator cancels with 24+ hours notice. 90% refund if the company cancels with 24+ hours notice. 50% refund inside 24 hours. No refund for company no-show. The first late-cancel by an operator is waived without penalty.
              </p>
            </div>
          </div>

          <div className={styles.footnote}>
            All cancellation events are recorded. If you believe a charge or strike was applied incorrectly, request a review via Support and ops will investigate within 5 business days.
          </div>
        </div>
      )}
    </section>
  );
}
