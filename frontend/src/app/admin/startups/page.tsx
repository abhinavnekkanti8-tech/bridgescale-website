'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { startupsApi, StartupProfile } from '@/lib/api-client';
import styles from './page.module.css';

const ELIGIBILITY_BADGE: Record<string, string> = {
  SPRINT_AND_RETAINER: 'badge-teal',
  SPRINT_ONLY: 'badge-amber',
  INELIGIBLE: '',
};

const STATUS_BADGE: Record<string, string> = {
  SUBMITTED: 'badge-violet',
  UNDER_REVIEW: 'badge-amber',
  APPROVED: 'badge-teal',
  REJECTED: '',
  DRAFT: '',
};

function AdminStartupsContent() {
  const [startups, setStartups] = useState<StartupProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    startupsApi.getAll()
      .then(setStartups)
      .catch(() => setError('Could not load startup profiles.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = startups.filter((s) =>
    s.industry.toLowerCase().includes(search.toLowerCase()) ||
    s.stage.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Startup Profiles</h1>
          <p className={styles.subtitle}>{startups.length} total profiles</p>
        </div>
      </div>

      <input
        id="search-startups"
        type="search"
        className={styles.search}
        placeholder="Search by industry or stage…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {error && <div className={styles.errorBox}><span>⚠</span> {error}</div>}

      {loading ? (
        <div className={styles.loading}>Loading profiles…</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>No startup profiles found.</div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHead}>
            <span>Startup</span>
            <span>Stage</span>
            <span>Status</span>
            <span>Score</span>
            <span>Eligibility</span>
            <span>Actions</span>
          </div>
          {filtered.map((s) => {
            const latestScore = s.scores?.[0];
            const eligibility = latestScore?.eligibility;
            return (
              <div key={s.id} className={styles.tableRow} id={`startup-row-${s.id}`}>
                <div>
                  <span className={styles.orgName}>{s.industry}</span>
                  <span className={styles.orgCountry}>{s.stage.replace(/_/g, ' ')}</span>
                </div>
                <span className={`badge ${STATUS_BADGE[s.status] || ''}`}>{s.status}</span>
                <span className={`badge ${STATUS_BADGE[s.status] || ''}`}>{s.status.replace(/_/g, ' ')}</span>
                <span className={styles.score}>
                  {latestScore ? (
                    <span style={{ fontWeight: 700 }}>{latestScore.scoreTotal}<span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>/100</span></span>
                  ) : '—'}
                </span>
                <span>
                  {eligibility ? (
                    <span className={`badge ${ELIGIBILITY_BADGE[eligibility] || ''}`}>
                      {eligibility.replace(/_/g, ' ')}
                    </span>
                  ) : '—'}
                </span>
                <div className={styles.actions}>
                  <Link href={`/startup/readiness?profileId=${s.id}`} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }} id={`view-score-${s.id}`}>
                    View Score
                  </Link>
                  {!latestScore && (
                    <button
                      id={`trigger-score-${s.id}`}
                      className="btn btn-primary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}
                      onClick={() => startupsApi.requestScore(s.id)}
                    >
                      Score Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminStartupsPage() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <AdminStartupsContent />
      </ProtectedLayout>
    </AuthProvider>
  );
}
