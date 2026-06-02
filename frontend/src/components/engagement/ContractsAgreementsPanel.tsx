'use client';

/**
 * ContractsAgreementsPanel
 *
 * Renders the legal-document state for an engagement:
 *   1. Pre-SOW Commercial Summary  — confirm action per party
 *   2. Master Service Agreement     — sign action per party (3-party signing)
 *   3. Statement of Work + Contract — sign action per party
 *
 * Used inside both /startup/engagements/[id] and /operator/engagements/[id].
 */

import { useState } from 'react';
import {
  Engagement,
  MasterServiceAgreement,
  PreSowCommercialSummary,
  contractsApi,
  coreFlowApi,
  msaApi,
} from '@/lib/api-client';
import styles from './ContractsAgreementsPanel.module.css';

type Viewer = 'STARTUP' | 'OPERATOR';

interface Props {
  engagement: Engagement;
  viewer: Viewer;
  onChange?: () => void; // parent refetch
}

function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function pillClass(state: 'pending' | 'partial' | 'done' | 'muted'): string {
  return `${styles.pill} ${styles['pill_' + state]}`;
}

/* ── Pre-SOW row ───────────────────────────────────────────────────────────*/

function PreSowRow({ summary, viewer, onChange }: { summary: PreSowCommercialSummary | null | undefined; viewer: Viewer; onChange?: () => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  if (!summary) {
    return (
      <div className={styles.row}>
        <div className={styles.rowHeader}>
          <div>
            <div className={styles.rowTitle}>Pre-SOW Commercial Summary</div>
            <div className={styles.rowSub}>Locks the commercial shape before legal review.</div>
          </div>
          <span className={pillClass('muted')}>Not issued</span>
        </div>
        <div className={styles.rowBody}>
          <div className={styles.muted}>
            BridgeScale issues this one-pager after the introductory call and mutual engagement intent. No signing yet — awaiting issuance.
          </div>
        </div>
      </div>
    );
  }

  const startupConfirmed = !!summary.startupConfirmedAt;
  const operatorConfirmed = !!summary.operatorConfirmedAt;
  const fullyConfirmed = startupConfirmed && operatorConfirmed;

  const myConfirmed = viewer === 'STARTUP' ? startupConfirmed : operatorConfirmed;
  const partyConfirmedAt = viewer === 'STARTUP' ? summary.startupConfirmedAt : summary.operatorConfirmedAt;

  async function onConfirm() {
    if (!summary) return;
    setBusy(true);
    setErr('');
    try {
      await coreFlowApi.confirmPreSowSummary(summary.id, viewer);
      onChange?.();
    } catch {
      setErr('Could not confirm Pre-SOW Summary. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.row}>
      <div className={styles.rowHeader}>
        <div>
          <div className={styles.rowTitle}>Pre-SOW Commercial Summary</div>
          <div className={styles.rowSub}>Non-binding alignment check.</div>
        </div>
        <span className={pillClass(fullyConfirmed ? 'done' : startupConfirmed || operatorConfirmed ? 'partial' : 'pending')}>
          {fullyConfirmed ? 'Confirmed' : startupConfirmed || operatorConfirmed ? 'Partially confirmed' : 'Awaiting confirmation'}
        </span>
      </div>

      <div className={styles.rowBody}>
        <div className={styles.metaGrid}>
          <span className={styles.metaLabel}>Engagement</span>
          <span>{summary.engagementType}{summary.retainerFlavour ? ` · ${summary.retainerFlavour}` : ''}</span>

          <span className={styles.metaLabel}>Service template</span>
          <span>{summary.serviceTemplate}</span>

          <span className={styles.metaLabel}>Compensation</span>
          <span>{summary.compensationMode}</span>

          {summary.indicativePrice ? (
            <>
              <span className={styles.metaLabel}>Indicative price</span>
              <span>{summary.currency} {summary.indicativePrice.toLocaleString()}</span>
            </>
          ) : null}

          {summary.weeklyHours ? (
            <>
              <span className={styles.metaLabel}>Weekly hours</span>
              <span>{summary.weeklyHours} hrs/wk</span>
            </>
          ) : null}

          {summary.durationDays ? (
            <>
              <span className={styles.metaLabel}>Duration</span>
              <span>{summary.durationDays} days</span>
            </>
          ) : null}
        </div>

        {summary.specialTerms && (
          <div className={styles.note}>
            <strong>Special terms.</strong> {summary.specialTerms}
          </div>
        )}
        {summary.cancellationNote && (
          <div className={styles.note}>
            <strong>Cancellation.</strong> {summary.cancellationNote}
          </div>
        )}

        <div className={styles.signRow}>
          <div className={styles.signEntries}>
            <span>Startup: {startupConfirmed ? `confirmed ${formatDate(summary.startupConfirmedAt)}` : 'pending'}</span>
            <span>Operator: {operatorConfirmed ? `confirmed ${formatDate(summary.operatorConfirmedAt)}` : 'pending'}</span>
          </div>
          {!myConfirmed ? (
            <button className="btn btn-primary" onClick={onConfirm} disabled={busy}>
              {busy ? 'Confirming…' : `Confirm as ${viewer === 'STARTUP' ? 'Startup' : 'Operator'}`}
            </button>
          ) : (
            <span className={styles.confirmedHint}>You confirmed {formatDate(partyConfirmedAt)}</span>
          )}
        </div>
        {err && <div className={styles.errorBox}>{err}</div>}
      </div>
    </div>
  );
}

/* ── MSA row ───────────────────────────────────────────────────────────────*/

function MsaRow({ msa, viewer, onChange }: { msa: MasterServiceAgreement | null | undefined; viewer: Viewer; onChange?: () => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  if (!msa) {
    return (
      <div className={styles.row}>
        <div className={styles.rowHeader}>
          <div>
            <div className={styles.rowTitle}>Master Service Agreement</div>
            <div className={styles.rowSub}>Tri-party agreement signed once per (Company, Operator) pair.</div>
          </div>
          <span className={pillClass('muted')}>Not generated</span>
        </div>
        <div className={styles.rowBody}>
          <div className={styles.muted}>
BridgeScale generates the MSA after Pre-SOW confirmation. The operator&apos;s tax forms (W-9 / W-8BEN / GST/PAN / VAT — whatever applies for the payout corridor) must be on file before generation; if they aren&apos;t, ops will reach out to the operator. Once issued, BridgeScale pre-signs and both parties counter-sign.
          </div>
        </div>
      </div>
    );
  }

  const myParty = viewer; // STARTUP or OPERATOR
  const mySignedAt = viewer === 'STARTUP' ? msa.startupSignedAt : msa.operatorSignedAt;

  async function onSign() {
    setBusy(true);
    setErr('');
    try {
      await msaApi.sign(msa!.id, myParty);
      onChange?.();
    } catch {
      setErr('Could not record signature. Try again.');
    } finally {
      setBusy(false);
    }
  }

  const signed: { label: string; at: string | null | undefined }[] = [
    { label: 'BridgeScale (platform)', at: msa.platformSignedAt },
    { label: 'Startup', at: msa.startupSignedAt },
    { label: 'Operator', at: msa.operatorSignedAt },
  ];
  const allSigned = signed.every((s) => !!s.at);

  return (
    <div className={styles.row}>
      <div className={styles.rowHeader}>
        <div>
          <div className={styles.rowTitle}>Master Service Agreement</div>
          <div className={styles.rowSub}>Persists per (Company, Operator) pair — reused for any future engagements.</div>
        </div>
        <span className={pillClass(allSigned ? 'done' : signed.some((s) => s.at) ? 'partial' : 'pending')}>
          {msa.status.replace(/_/g, ' ')}
        </span>
      </div>
      <div className={styles.rowBody}>
        <div className={styles.metaGrid}>
          <span className={styles.metaLabel}>Platform fee</span>
          <span>{msa.platformFeePercent}%</span>
          <span className={styles.metaLabel}>Conversion fee</span>
          <span>{msa.conversionFeePercent}%</span>
          <span className={styles.metaLabel}>Non-circumvention</span>
          <span>{msa.nonCircMonths} months</span>
          <span className={styles.metaLabel}>Termination notice</span>
          <span>{msa.termNoticeDays} days</span>
          <span className={styles.metaLabel}>Governing law</span>
          <span>{msa.governingLaw}</span>
        </div>

        {msa.documentUrl && (
          <a className={styles.docLink} href={msa.documentUrl} target="_blank" rel="noreferrer">
            📄 View MSA document {msa.watermarked ? '(watermarked)' : ''}
          </a>
        )}

        <div className={styles.signRow}>
          <div className={styles.signEntries}>
            {signed.map((s) => (
              <span key={s.label}>{s.label}: {s.at ? `signed ${formatDate(s.at)}` : 'pending'}</span>
            ))}
          </div>
          {!mySignedAt ? (
            <button className="btn btn-primary" onClick={onSign} disabled={busy}>
              {busy ? 'Signing…' : `Sign as ${viewer === 'STARTUP' ? 'Startup' : 'Operator'}`}
            </button>
          ) : (
            <span className={styles.confirmedHint}>You signed {formatDate(mySignedAt)}</span>
          )}
        </div>
        {err && <div className={styles.errorBox}>{err}</div>}
      </div>
    </div>
  );
}

/* ── Contract / SOW row ─────────────────────────────────────────────────────*/

function ContractRow({ engagement, viewer, onChange }: { engagement: Engagement; viewer: Viewer; onChange?: () => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const contract = engagement.contract;
  const sow = contract?.sow;

  if (!contract || !sow) {
    return (
      <div className={styles.row}>
        <div className={styles.rowHeader}>
          <div>
            <div className={styles.rowTitle}>Statement of Work + Contract</div>
            <div className={styles.rowSub}>Per-engagement scope, deliverables, and pricing.</div>
          </div>
          <span className={pillClass('muted')}>Not generated</span>
        </div>
      </div>
    );
  }

  const mySignedAt = viewer === 'STARTUP' ? contract.startupSignedAt : contract.operatorSignedAt;
  const fullySigned = contract.status === 'FULLY_SIGNED';

  async function onSign() {
    if (!contract?.id) return;
    setBusy(true);
    setErr('');
    try {
      const sigId = `MANUAL-${viewer}-${Date.now()}`;
      if (viewer === 'STARTUP') await contractsApi.signStartup(contract.id, sigId);
      else await contractsApi.signOperator(contract.id, sigId);
      onChange?.();
    } catch {
      setErr('Could not record signature. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.row}>
      <div className={styles.rowHeader}>
        <div>
          <div className={styles.rowTitle}>Statement of Work + Contract</div>
          <div className={styles.rowSub}>{sow.title}</div>
        </div>
        <span className={pillClass(fullySigned ? 'done' : contract.status === 'PENDING_SIGNATURES' ? 'pending' : 'partial')}>
          {(contract.status ?? 'PENDING_SIGNATURES').replace(/_/g, ' ')}
        </span>
      </div>
      <div className={styles.rowBody}>
        <div className={styles.metaGrid}>
          <span className={styles.metaLabel}>SOW status</span>
          <span>{sow.status ?? 'DRAFT'}</span>
        </div>

        <details className={styles.detail}>
          <summary>View scope & deliverables</summary>
          <div className={styles.detailBody}>
            <div><strong>Scope.</strong> {sow.scope}</div>
            <div><strong>Deliverables.</strong> {sow.deliverables}</div>
          </div>
        </details>

        <div className={styles.signRow}>
          <div className={styles.signEntries}>
            <span>Startup: {contract.startupSignedAt ? `signed ${formatDate(contract.startupSignedAt)}` : 'pending'}</span>
            <span>Operator: {contract.operatorSignedAt ? `signed ${formatDate(contract.operatorSignedAt)}` : 'pending'}</span>
          </div>
          {!mySignedAt ? (
            <button className="btn btn-primary" onClick={onSign} disabled={busy}>
              {busy ? 'Signing…' : `Sign as ${viewer === 'STARTUP' ? 'Startup' : 'Operator'}`}
            </button>
          ) : (
            <span className={styles.confirmedHint}>You signed {formatDate(mySignedAt)}</span>
          )}
        </div>
        {err && <div className={styles.errorBox}>{err}</div>}
      </div>
    </div>
  );
}

/* ── Panel ──────────────────────────────────────────────────────────────────*/

export default function ContractsAgreementsPanel({ engagement, viewer, onChange }: Props) {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2>Contracts & Agreements</h2>
        <p className={styles.panelSub}>
          The signing flow for this engagement: Pre-SOW Summary → MSA → SOW.
        </p>
      </div>
      <div className={styles.list}>
        <PreSowRow summary={engagement.preSowSummary} viewer={viewer} onChange={onChange} />
        <MsaRow msa={engagement.contract?.sow.msa} viewer={viewer} onChange={onChange} />
        <ContractRow engagement={engagement} viewer={viewer} onChange={onChange} />
      </div>
    </section>
  );
}
