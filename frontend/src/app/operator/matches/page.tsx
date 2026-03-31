'use client';

import { useEffect, useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { matchingApi, MatchCandidate, MatchShortlist } from '@/lib/api-client';
import styles from './page.module.css';

function OperatorMatchesContent() {
  const [shortlists, setShortlists] = useState<MatchShortlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [responding, setResponding] = useState<string | null>(null);

  useEffect(() => {
    // In production, this would filter to the current operator's candidates
    matchingApi.findAll()
      .then(setShortlists)
      .catch(() => setError('Could not load matches.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleRespond(candidateId: string, interest: 'ACCEPTED' | 'DECLINED') {
    setResponding(candidateId);
    try {
      await matchingApi.operatorRespond(candidateId, interest);
      // Refresh
      const updated = await matchingApi.findAll();
      setShortlists(updated);
    } catch { setError('Response failed.'); }
    setResponding(null);
  }

  // Flatten to get all candidates relevant to this operator
  const allCandidates: (MatchCandidate & { shortlistStatus: string })[] = shortlists.flatMap((sl) =>
    sl.candidates.map((c) => ({ ...c, shortlistStatus: sl.status }))
  );

  return (
    <div className={styles.page} id="operator-matches">
      <div className={styles.header}>
        <h1 className={styles.title}>Match Opportunities</h1>
        <p className={styles.subtitle}>Review and respond to startup matching invitations.</p>
      </div>

      {error && <div className={styles.errorBox}><span>⚠</span> {error}</div>}

      {loading ? (
        <p className={styles.loading}>Loading…</p>
      ) : allCandidates.length === 0 ? (
        <div className={styles.emptyCard}>
          <span style={{ fontSize: '3rem' }}>🔍</span>
          <h2>No match opportunities yet</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>Complete your profile and get verified to receive matching invitations from startups.</p>
        </div>
      ) : (
        <div className={styles.cardList}>
          {allCandidates.map((c) => (
            <div key={c.id} className={styles.matchCard} id={`match-${c.id}`}>
              <div className={styles.cardTop}>
                <span className={styles.scoreBadge} style={{ borderColor: c.matchScore >= 80 ? '#14b8a6' : c.matchScore >= 65 ? '#f59e0b' : '#ef4444' }}>
                  {c.matchScore}/100
                </span>
                <div>
                  <span className={`badge ${c.interest === 'ACCEPTED' ? 'badge-teal' : c.interest === 'DECLINED' ? '' : 'badge-amber'}`}>
                    {c.interest}
                  </span>
                  {c.packageTier && <span style={{ marginLeft: 'var(--space-2)', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{c.packageTier.replace(/_/g, ' ')}</span>}
                </div>
              </div>
              <p className={styles.explanation}>{c.explanation}</p>
              {c.mainRisk && <p className={styles.risk}><span>⚠</span> {c.mainRisk}</p>}
              {c.weeklyFitHours && <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Estimated fit: {c.weeklyFitHours} hrs/week</p>}

              {c.interest === 'PENDING' && c.shortlistStatus === 'PUBLISHED' && (
                <div className={styles.actionRow}>
                  <button className="btn btn-primary" disabled={responding === c.id}
                    onClick={() => handleRespond(c.id, 'ACCEPTED')} id={`accept-${c.id}`}>
                    {responding === c.id ? '…' : '✓ Accept'}
                  </button>
                  <button className="btn btn-secondary" disabled={responding === c.id}
                    onClick={() => handleRespond(c.id, 'DECLINED')} id={`decline-${c.id}`}>
                    ✗ Decline
                  </button>
                </div>
              )}
              {c.status === 'SELECTED' && <div className={styles.selectedTag}>🎉 You've been selected!</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OperatorMatchesPage() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <OperatorMatchesContent />
      </ProtectedLayout>
    </AuthProvider>
  );
}
