'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { engagementsApi, Engagement } from '@/lib/api-client';
import { NudgeBanner } from '@/components/NudgeBanner';
import styles from './page.module.css';

function StartupEngagementsContent() {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    engagementsApi.getForStartup()
      .then(setEngagements)
      .catch(() => setError('Could not load engagements.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Engagements</h1>
        <p className={styles.subtitle}>Track active fractional operators and sprints.</p>
      </div>

      <NudgeBanner />

      {error && <div className={styles.errorBox}><span>⚠</span> {error}</div>}

      {loading ? (
        <p className={styles.loading}>Loading…</p>
      ) : engagements.length === 0 ? (
        <div className={styles.emptyCard}>
          <span style={{ fontSize: '3rem' }}>🤝</span>
          <h2>No active engagements</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>Fully signed statements of work will appear here.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {engagements.map((eng) => (
            <div key={eng.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>{eng.contract?.sow?.title || 'Engagement'}</h3>
                  <p className={styles.cardSubtext}>Operator: {eng.operator?.user?.firstName} {eng.operator?.user?.lastName}</p>
                </div>
                <div className={styles.healthScore}>
                  <svg width="40" height="40" viewBox="0 0 36 36" className={styles.circularChart}>
                    <path className={styles.circleBg} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className={eng.healthScore >= 80 ? styles.circleGreen : eng.healthScore >= 50 ? styles.circleAmber : styles.circleRed}
                      strokeDasharray={`${eng.healthScore}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <text x="18" y="22.5" className={styles.percentage}>{eng.healthScore}</text>
                  </svg>
                  <span>Health</span>
                </div>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.detail}>
                  <span>Status</span>
                  <span className="badge">{eng.status}</span>
                </div>
                <div className={styles.detail}>
                  <span>Started</span>
                  <span>{eng.startDate ? new Date(eng.startDate).toLocaleDateString() : 'Pending'}</span>
                </div>
              </div>
              <div className={styles.cardFooter}>
                <Link href={`/startup/engagements/${eng.id}`} className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                  Open Workspace
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StartupEngagementsPage() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <StartupEngagementsContent />
      </ProtectedLayout>
    </AuthProvider>
  );
}
