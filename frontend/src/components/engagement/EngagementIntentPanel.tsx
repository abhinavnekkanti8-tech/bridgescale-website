'use client';

/**
 * EngagementIntentPanel
 *
 * Post-call surface used on /startup/calls and /operator/calls. After a call is
 * accepted or completed, both parties indicate engagement intent (Interested /
 * Not interested). When both sides record INTERESTED, BridgeScale generates the
 * Pre-SOW Commercial Summary.
 */

import { useState } from 'react';
import { EngagementCall, EngagementIntent, coreFlowApi } from '@/lib/api-client';
import styles from './EngagementIntentPanel.module.css';

type Viewer = 'STARTUP' | 'OPERATOR';

interface Props {
  call: EngagementCall;
  viewer: Viewer;
  onChange?: () => void;
}

function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

function findIntent(intents: EngagementIntent[] | undefined, party: Viewer) {
  return intents?.find((i) => i.party === party);
}

export default function EngagementIntentPanel({ call, viewer, onChange }: Props) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [showDefer, setShowDefer] = useState(false);
  const [newProposed, setNewProposed] = useState('');
  const [deferReason, setDeferReason] = useState('');

  const myIntent = findIntent(call.intents, viewer);
  const otherIntent = findIntent(call.intents, viewer === 'STARTUP' ? 'OPERATOR' : 'STARTUP');
  const mutualInterested =
    findIntent(call.intents, 'STARTUP')?.status === 'INTERESTED' &&
    findIntent(call.intents, 'OPERATOR')?.status === 'INTERESTED';

  const callOpen = call.status === 'ACCEPTED' || call.status === 'COMPLETED';

  async function record(status: 'INTERESTED' | 'NOT_INTERESTED') {
    setBusy(true);
    setErr('');
    try {
      const res = await fetch('/api/v1/engagement-intents', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId: call.id, party: viewer, status }),
      });
      if (!res.ok) throw new Error('Could not record intent');
      onChange?.();
    } catch {
      setErr('Could not record intent. Try again.');
    } finally {
      setBusy(false);
    }
  }


  async function respond(status: 'ACCEPTED' | 'DECLINED') {
    setBusy(true);
    setErr('');
    try {
      await coreFlowApi.respondToCall(call.id, status);
      onChange?.();
    } catch {
      setErr('Could not respond to call. Try again.');
    } finally {
      setBusy(false);
    }
  }

  async function defer() {
    if (!newProposed) return;
    setBusy(true);
    setErr('');
    try {
      await coreFlowApi.deferCall(call.id, newProposed, deferReason || undefined);
      setShowDefer(false);
      setNewProposed('');
      setDeferReason('');
      onChange?.();
    } catch {
      setErr('Could not request deferral. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.callCard}>
      <div className={styles.callHeader}>
        <div>
          <div className={styles.callTitle}>
            {viewer === 'STARTUP'
              ? `Call with operator ${call.operator?.id ? `#${call.operator.id.slice(0, 6)}` : ''}`
              : `Call with company ${call.startup?.industry ?? ''}`}
          </div>
          <div className={styles.callMeta}>
            {call.scheduledAt ? `Scheduled ${formatDate(call.scheduledAt)}` : 'Not scheduled'}
            {' · '}Status: <strong>{call.status}</strong>
          </div>
        </div>
        {call.meetingLink && (
          <a className={styles.meetingLink} href={call.meetingLink} target="_blank" rel="noreferrer">
            🎥 Meeting link
          </a>
        )}
      </div>

      {call.outcomeNotes && (
        <div className={styles.note}>
          <strong>Call outcome.</strong> {call.outcomeNotes}
        </div>
      )}

      {call.status === 'REQUESTED' && (
        <div className={styles.intentBlock}>
          <div className={styles.muted}>
            {viewer === 'OPERATOR'
              ? 'A company has requested this call. Accept to schedule it, or decline.'
              : 'Awaiting the operator to accept your call request.'}
          </div>
          {viewer === 'OPERATOR' && (
            <div className={styles.actions}>
              <button className="btn btn-primary" disabled={busy} onClick={() => respond('ACCEPTED')}>
                Accept call
              </button>
              <button className="btn btn-secondary" disabled={busy} onClick={() => respond('DECLINED')}>
                Decline
              </button>
            </div>
          )}
          {err && <div className={styles.err}>{err}</div>}
        </div>
      )}
      {(call.status === 'DECLINED' || call.status === 'CANCELLED') && (
        <div className={styles.muted}>
          This call was {call.status.toLowerCase()}. Engagement intent cannot be recorded.
        </div>
      )}

      {callOpen && (
        <div className={styles.intentBlock}>
          <div className={styles.intentRow}>
            <span className={styles.intentLabel}>Your intent</span>
            {myIntent ? (
              <span className={`${styles.pill} ${myIntent.status === 'INTERESTED' ? styles.pillGood : styles.pillBad}`}>
                {myIntent.status === 'INTERESTED' ? 'Interested' : 'Not interested'}
              </span>
            ) : (
              <span className={`${styles.pill} ${styles.pillMuted}`}>Pending</span>
            )}
          </div>
          <div className={styles.intentRow}>
            <span className={styles.intentLabel}>Other party</span>
            {otherIntent ? (
              <span className={`${styles.pill} ${otherIntent.status === 'INTERESTED' ? styles.pillGood : styles.pillBad}`}>
                {otherIntent.status === 'INTERESTED' ? 'Interested' : 'Not interested'}
              </span>
            ) : (
              <span className={`${styles.pill} ${styles.pillMuted}`}>Pending</span>
            )}
          </div>

          {mutualInterested && (
            <div className={styles.mutualBanner}>
              ✓ Mutual interest recorded. BridgeScale will issue your Pre-SOW Commercial Summary shortly.
            </div>
          )}

          <div className={styles.actions}>
            <button
              className="btn btn-primary"
              disabled={busy || myIntent?.status === 'INTERESTED'}
              onClick={() => record('INTERESTED')}
            >
              {myIntent?.status === 'INTERESTED' ? '✓ Interested' : 'Mark interested'}
            </button>
            <button
              className="btn btn-secondary"
              disabled={busy || myIntent?.status === 'NOT_INTERESTED'}
              onClick={() => record('NOT_INTERESTED')}
            >
              {myIntent?.status === 'NOT_INTERESTED' ? '✓ Not interested' : 'Not interested'}
            </button>

            <button
              className="btn btn-secondary"
              disabled={busy}
              onClick={() => setShowDefer((v) => !v)}
              style={{ marginLeft: 'auto' }}
            >
              {showDefer ? 'Cancel deferral' : 'Request deferral'}
            </button>
          </div>

          {showDefer && (
            <div className={styles.deferBox}>
              <label>
                <span>New proposed time</span>
                <input
                  type="datetime-local"
                  value={newProposed}
                  onChange={(e) => setNewProposed(e.target.value)}
                />
              </label>
              <label>
                <span>Reason (optional)</span>
                <input
                  type="text"
                  placeholder="e.g. travel conflict"
                  value={deferReason}
                  onChange={(e) => setDeferReason(e.target.value)}
                />
              </label>
              <button className="btn btn-primary" onClick={defer} disabled={busy || !newProposed}>
                {busy ? 'Submitting…' : 'Submit deferral'}
              </button>
            </div>
          )}

          {err && <div className={styles.err}>{err}</div>}
        </div>
      )}
    </div>
  );
}
