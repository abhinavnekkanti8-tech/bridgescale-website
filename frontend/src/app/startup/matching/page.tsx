'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import Link from 'next/link';
import { matchingApi, MatchShortlist, MatchCandidate, coreFlowApi } from '@/lib/api-client';
import styles from './page.module.css';

const STATUS_BADGE: Record<string, string> = { SHORTLISTED: '', INTERESTED: 'badge-teal', DECLINED: '', SELECTED: 'badge-violet', PASSED: '' };
const INTEREST_BADGE: Record<string, string> = { PENDING: 'badge-amber', ACCEPTED: 'badge-teal', DECLINED: '' };
const PKG_LABEL: Record<string, string> = { PIPELINE_SPRINT: '🚀 Pipeline Sprint', BD_SPRINT: '🤝 BD Sprint', FRACTIONAL_RETAINER: '👔 Retainer' };

const SCORE_COMPONENTS = [
  { key: 'laneAlignment', label: 'Lane Alignment', max: 20 },
  { key: 'regionOverlap', label: 'Region Overlap', max: 15 },
  { key: 'budgetFit', label: 'Budget Fit', max: 15 },
  { key: 'experienceRelevance', label: 'Experience', max: 15 },
  { key: 'availabilityMatch', label: 'Availability', max: 10 },
  { key: 'tierBonus', label: 'Tier Bonus', max: 15 },
  { key: 'motionFit', label: 'Motion Fit', max: 10 },
];

function ShortlistContent() {
  const searchParams = useSearchParams();
  const shortlistId = searchParams.get('id');
  const [shortlist, setShortlist] = useState<MatchShortlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selecting, setSelecting] = useState<string | null>(null);
  const [requesting, setRequesting] = useState<string | null>(null);
  const [callMessage, setCallMessage] = useState('');

  const fetchShortlist = useCallback(async () => {
    try {
      if (shortlistId) {
        // Direct lookup by ID (e.g. from admin link)
        const sl = await matchingApi.findOne(shortlistId);
        setShortlist(sl);
      } else {
        // No ID in URL — auto-load the user's own shortlist via their application
        const appRes = await fetch('/api/v1/applications/my-application', { credentials: 'include' });
        if (!appRes.ok) { setError('Could not load your application.'); setLoading(false); return; }
        const app = await appRes.json();
        const startupProfileId = app?.startupProfile?.id;
        if (!startupProfileId) { setError('No startup profile found. Complete your application first.'); setLoading(false); return; }

        const shortlists = await matchingApi.findByStartup(startupProfileId);
        if (!shortlists || shortlists.length === 0) {
          setError('No shortlist available yet. Check back after your application is reviewed.');
          setLoading(false);
          return;
        }
        // Prefer published; fall back to most recent
        const published = shortlists.find(s => s.status === 'PUBLISHED');
        setShortlist(published ?? shortlists[shortlists.length - 1]);
      }
    } catch { setError('Could not load shortlist.'); }
    setLoading(false);
  }, [shortlistId]);

  useEffect(() => { fetchShortlist(); }, [fetchShortlist]);

  async function handleRequestCall(candidate: MatchCandidate) {
    if (!shortlist) return;
    setRequesting(candidate.id);
    setCallMessage('');
    try {
      await coreFlowApi.requestCall({
        startupProfileId: shortlist.startupProfileId,
        operatorId: candidate.operatorId,
        shortlistId: shortlist.id,
        candidateId: candidate.id,
        proposedAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
      setCallMessage('Call request sent. Track it in your Discovery calls page.');
    } catch {
      setCallMessage('Could not send call request. Try again.');
    } finally {
      setRequesting(null);
    }
  }

  async function handleSelect(candidateId: string) {
    if (!shortlist) return;
    setSelecting(candidateId);
    try {
      const updated = await matchingApi.selectOperator(shortlist.id, candidateId);
      setShortlist(updated);
    } catch { setError('Selection failed.'); }
    setSelecting(null);
  }

  if (loading) return <div className={styles.page}><p className={styles.loading}>Loading shortlist…</p></div>;
  if (error) return <div className={styles.page}><div className={styles.errorBox}><span>⚠</span> {error}</div></div>;
  if (!shortlist) return null;

  return (
    <div className={styles.page} id="shortlist-view">
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Operator Shortlist</h1>
          <p className={styles.subtitle}>
            {shortlist.candidates.length} candidates · <span className={`badge ${shortlist.status === 'PUBLISHED' ? 'badge-teal' : 'badge-amber'}`}>{shortlist.status.replace(/_/g, ' ')}</span>
            {shortlist.selectionDeadline && <span style={{ marginLeft: 'var(--space-4)', fontSize: '0.8125rem' }}>Deadline: {new Date(shortlist.selectionDeadline).toLocaleDateString()}</span>}
          </p>
        </div>
        <Link href="/startup/calls" className="btn btn-secondary">View Discovery Calls →</Link>
      </div>

      {callMessage && (
        <div style={{ padding: '10px 14px', background: '#dcf2e1', color: '#2f6d4a', borderRadius: 4, marginBottom: 14, fontSize: '0.85rem' }}>
          {callMessage}
        </div>
      )}

      <div className={styles.cardGrid}>
        {shortlist.candidates.map((c: MatchCandidate, idx: number) => (
          <div key={c.id} className={`${styles.candidateCard} ${c.status === 'SELECTED' ? styles.selectedCard : ''}`} id={`candidate-${c.id}`}>
            <div className={styles.cardHeader}>
              <span className={styles.rank}>#{idx + 1}</span>
              <div className={styles.scoreCircle} style={{ borderColor: c.matchScore >= 80 ? '#14b8a6' : c.matchScore >= 65 ? '#f59e0b' : '#ef4444' }}>
                <span className={styles.scoreNum}>{c.matchScore}</span>
              </div>
              <div className={styles.badges}>
                <span className={`badge ${STATUS_BADGE[c.status] || ''}`}>{c.status}</span>
                <span className={`badge ${INTEREST_BADGE[c.interest] || ''}`}>{c.interest}</span>
              </div>
            </div>

            <p className={styles.explanation}>{c.explanation}</p>

            {c.mainRisk && (
              <div className={styles.riskBox}><span>⚠</span> {c.mainRisk}</div>
            )}

            <div className={styles.metaRow}>
              {c.packageTier && <span>{PKG_LABEL[c.packageTier] || c.packageTier}</span>}
              {c.weeklyFitHours && <span>{c.weeklyFitHours} hrs/wk</span>}
            </div>

            {/* Score breakdown */}
            <details className={styles.details}>
              <summary>Score Breakdown</summary>
              <div className={styles.breakdown}>
                {SCORE_COMPONENTS.map((comp) => {
                  const val = (c.scoreBreakdown as unknown as Record<string, number>)[comp.key] ?? 0;
                  const pct = (val / comp.max) * 100;
                  return (
                    <div key={comp.key} className={styles.breakdownRow}>
                      <span className={styles.compLabel}>{comp.label}</span>
                      <div className={styles.barTrack}><div className={styles.barFill} style={{ width: `${pct}%`, background: pct >= 75 ? '#14b8a6' : pct >= 50 ? '#f59e0b' : '#ef4444' }} /></div>
                      <span className={styles.compScore}>{val}/{comp.max}</span>
                    </div>
                  );
                })}
              </div>
            </details>

            {/* Selection action */}
            {shortlist.status === 'PUBLISHED' && c.interest === 'ACCEPTED' && c.status !== 'SELECTED' && c.status !== 'PASSED' && (
              <button className="btn btn-primary" style={{ marginTop: 'var(--space-3)' }}
                onClick={() => handleSelect(c.id)} disabled={selecting === c.id} id={`select-${c.id}`}>
                {selecting === c.id ? 'Selecting…' : 'Select This Operator'}
              </button>
            )}
            {/* Self-serve call request — works once interest is ACCEPTED, regardless of selection state */}
            {c.interest === 'ACCEPTED' && (
              <button
                className="btn btn-secondary"
                style={{ marginTop: 'var(--space-2)' }}
                onClick={() => handleRequestCall(c)}
                disabled={requesting === c.id}
                id={`request-call-${c.id}`}
              >
                {requesting === c.id ? 'Requesting…' : '📞 Request 30-min discovery call'}
              </button>
            )}
            {c.status === 'SELECTED' && (
              <div className={styles.selectedBadge}>✅ Selected Operator</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StartupMatchingPage() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading…</div>}>
          <ShortlistContent />
        </Suspense>
      </ProtectedLayout>
    </AuthProvider>
  );
}
