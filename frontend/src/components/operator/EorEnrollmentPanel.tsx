'use client';

/**
 * EorEnrollmentPanel
 *
 * Operator-facing surface for Employer-of-Record enrolment status across the
 * three day-1 partners (Deel / Remote / Multiplier). Phase-3 plumbing only —
 * partner-API wire-up lands in Phase 6 (P6.5–P6.7). Today, an operator can
 * request enrolment; partner-side status is updated by ops.
 */

import { useEffect, useState } from 'react';
import {
  EorEnrollmentStatus,
  EorPartner,
  OperatorEorEnrollment,
  operatorEorApi,
  partnersApi,
} from '@/lib/api-client';
import styles from './EorEnrollmentPanel.module.css';

const PARTNER_INFO: Record<EorPartner, { name: string; blurb: string; corridors: string }> = {
  DEEL: {
    name: 'Deel',
    blurb: 'Day-1 partner. Broad global coverage; first wired up in Phase 6.',
    corridors: 'US, UK, EU broad, India, APAC',
  },
  REMOTE: {
    name: 'Remote',
    blurb: 'Strong EU coverage with own entities. For long retainers in DE / FR / NL / ES / IE / IT / PT.',
    corridors: 'EU, UK, US',
  },
  MULTIPLIER: {
    name: 'Multiplier',
    blurb: 'India + APAC focus. Use when the operator is India-resident and the corridor needs EOR.',
    corridors: 'India, APAC, Middle East',
  },
};

const STATUS_LABEL: Record<EorEnrollmentStatus, string> = {
  NOT_STARTED: 'Not started',
  PENDING: 'Pending — ops contact within 5 business days',
  ACTIVE: 'Active',
  REJECTED: 'Rejected',
  TERMINATED: 'Terminated',
};

const STATUS_PILL: Record<EorEnrollmentStatus, string> = {
  NOT_STARTED: 'pill_muted',
  PENDING: 'pill_partial',
  ACTIVE: 'pill_done',
  REJECTED: 'pill_pending',
  TERMINATED: 'pill_pending',
};

export default function EorEnrollmentPanel() {
  const [rows, setRows] = useState<OperatorEorEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyPartner, setBusyPartner] = useState<EorPartner | null>(null);
  const [err, setErr] = useState('');

  async function load() {
    try {
      const data = await operatorEorApi.listMine();
      setRows(data);
    } catch {
      setErr('Could not load EOR enrolment status.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function onSync(enrollmentId: string | null) {
    if (!enrollmentId) return;
    setBusyPartner('SYNC' as EorPartner);
    setErr('');
    try {
      await partnersApi.syncEorEnrollment(enrollmentId);
      await load();
    } catch {
      setErr('Could not sync partner status. Try again.');
    } finally {
      setBusyPartner(null);
    }
  }

  async function onRequest(partner: EorPartner) {
    setBusyPartner(partner);
    setErr('');
    try {
      await operatorEorApi.request(partner);
      await load();
    } catch {
      setErr('Could not submit enrolment request. Try again.');
    } finally {
      setBusyPartner(null);
    }
  }

  if (loading) return <div className={styles.panel}><p className={styles.muted}>Loading EOR status…</p></div>;

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <div>
          <h2>Employer of Record <span style={{ fontSize: '0.65rem', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600, color: '#8a5a1f', padding: '2px 8px', background: '#fff3d6', borderRadius: 999, verticalAlign: 'middle', marginLeft: 8 }}>STUB MODE — live in P6.5–6.7</span></h2>
          <p className={styles.sub}>
            For corridors / engagement types where contractor classification isn&apos;t available, BridgeScale routes payment through one of three EOR partners. Pre-enrol where you expect engagements.
          </p>
        </div>
      </div>

      <div className={styles.list}>
        {rows.map((row) => {
          const info = PARTNER_INFO[row.partner];
          const canRequest = row.status === 'NOT_STARTED' || row.status === 'REJECTED' || row.status === 'TERMINATED';
          return (
            <div key={row.partner} className={styles.row}>
              <div className={styles.rowMain}>
                <div className={styles.partnerName}>{info.name}</div>
                <div className={styles.partnerBlurb}>{info.blurb}</div>
                <div className={styles.partnerMeta}>Corridors: {info.corridors}</div>
              </div>
              <div className={styles.rowAction}>
                <span className={`${styles.pill} ${styles[STATUS_PILL[row.status]]}`}>
                  {STATUS_LABEL[row.status]}
                </span>
                {canRequest && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => onRequest(row.partner)}
                    disabled={busyPartner === row.partner}
                    style={{ padding: '0.35rem 0.85rem', fontSize: '0.82rem' }}
                  >
                    {busyPartner === row.partner ? 'Submitting…' : 'Request enrolment'}
                  </button>
                )}
                {!canRequest && row.id && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => onSync(row.id)}
                    disabled={busyPartner !== null}
                    style={{ padding: '0.35rem 0.85rem', fontSize: '0.82rem' }}
                  >
                    Sync status
                  </button>
                )}
                {row.partnerSideId && (
                  <span className={styles.partnerSideId}>Partner ID: {row.partnerSideId}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.footnote}>
        Live partner integrations land in Phase 6. Today, ops manually advances status after partner sign-up.
      </div>

      {err && <div className={styles.err}>{err}</div>}
    </section>
  );
}
