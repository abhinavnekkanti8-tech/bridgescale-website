'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { engagementsApi, Engagement } from '@/lib/api-client';
import { NudgeBanner } from '@/components/NudgeBanner';
import styles from './page.module.css';

function OperatorEngagementsContent() {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    engagementsApi.getForOperator()
      .then(setEngagements)
      .catch(() => setError('Could not load engagements.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Client Engagements</h1>
        <p className={styles.subtitle}>Manage your active sprints and retainers.</p>
      </div>

      <NudgeBanner />

      {error && <div className={styles.errorBox}><span>⚠</span> {error}</div>}

      {loading ? (
        <p className={styles.loading}>Loading…</p>
      ) : engagements.length === 0 ? (
        <div className={styles.emptyCard}>
          <span style={{ fontSize: '3rem' }}>🚀</span>
          <h2>No active clients yet</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>Engagements will appear here once contracts are finalized.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {engagements.map((eng) => (
            <div key={eng.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>{eng.contract?.sow?.title || 'Engagement'}</h3>
                  <p className={styles.cardSubtext}>Client: {eng.startup?.companyName || 'Startup'}</p>
                </div>
                <div className={styles.healthScore}>
                  <span className={eng.healthScore >= 80 ? styles.scoreGreen : eng.healthScore >= 50 ? styles.scoreAmber : styles.scoreRed}>
                    {eng.healthScore}</span>
                  <span className={styles.healthLabel}>Health</span>
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
                <Link href={`/operator/engagements/${eng.id}`} className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                  Manage Workspace
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OperatorEngagementsPage() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <OperatorEngagementsContent />
      </ProtectedLayout>
    </AuthProvider>
  );
}
