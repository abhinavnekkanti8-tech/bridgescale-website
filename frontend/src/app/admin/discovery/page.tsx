'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { discoveryApi, DiscoveryCall } from '@/lib/api-client';
import styles from './page.module.css';

const STATUS_BADGE: Record<string, string> = { SCHEDULED: 'badge-violet', COMPLETED: 'badge-teal', CANCELLED: '', NO_SHOW: '' };

function AdminDiscoveryContent() {
  const [calls, setCalls] = useState<DiscoveryCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    discoveryApi.findAll()
      .then(setCalls)
      .catch(() => setError('Could not load discovery calls.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Discovery Calls</h1>
          <p className={styles.subtitle}>{calls.length} total calls</p>
        </div>
        <button className="btn btn-secondary" id="seed-packages-btn"
          onClick={() => discoveryApi.seedPackages().catch(() => {})}>
          Seed Packages
        </button>
      </div>

      {error && <div className={styles.errorBox}><span>⚠</span> {error}</div>}

      {loading ? (
        <div className={styles.loading}>Loading…</div>
      ) : calls.length === 0 ? (
        <div className={styles.empty}>No discovery calls found.</div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHead}>
            <span>Startup</span>
            <span>Date</span>
            <span>Status</span>
            <span>Summary</span>
            <span>Packages</span>
            <span>Actions</span>
          </div>
          {calls.map((c) => (
            <div key={c.id} className={styles.tableRow} id={`call-row-${c.id}`}>
              <span style={{ fontWeight: 600 }}>{c.startupProfile?.industry || c.startupProfileId.slice(0, 8)}</span>
              <span style={{ fontSize: '0.875rem' }}>{new Date(c.scheduledAt).toLocaleDateString()}</span>
              <span className={`badge ${STATUS_BADGE[c.status] || ''}`}>{c.status}</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{c.aiSummary ? '✅ Generated' : '—'}</span>
              <span style={{ fontSize: '0.8125rem' }}>{c.recommendedPkgs?.map((p: string) => p.replace(/_/g, ' ')).join(', ') || '—'}</span>
              <Link href={`/startup/discovery/summary?callId=${c.id}`} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }} id={`view-call-${c.id}`}>
                View
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDiscoveryPage() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <AdminDiscoveryContent />
      </ProtectedLayout>
    </AuthProvider>
  );
}
