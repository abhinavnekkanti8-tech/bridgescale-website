'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { matchingApi, MatchShortlist } from '@/lib/api-client';
import styles from './page.module.css';

const STATUS_BADGE: Record<string, string> = { DRAFT: 'badge-amber', PUBLISHED: 'badge-teal', SELECTION_MADE: 'badge-violet', EXPIRED: '' };

function AdminMatchingContent() {
  const [shortlists, setShortlists] = useState<MatchShortlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [publishing, setPublishing] = useState<string | null>(null);

  useEffect(() => {
    matchingApi.findAll()
      .then(setShortlists)
      .catch(() => setError('Could not load shortlists.'))
      .finally(() => setLoading(false));
  }, []);

  async function handlePublish(id: string) {
    setPublishing(id);
    try {
      const updated = await matchingApi.publish(id);
      setShortlists((sl) => sl.map((s) => (s.id === id ? { ...s, status: updated.status, publishedAt: updated.publishedAt } : s)));
    } catch { setError('Publish failed.'); }
    setPublishing(null);
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Matching & Shortlists</h1>
          <p className={styles.subtitle}>{shortlists.length} shortlists</p>
        </div>
      </div>

      {error && <div className={styles.errorBox}><span>⚠</span> {error}</div>}

      {loading ? (
        <div className={styles.loading}>Loading…</div>
      ) : shortlists.length === 0 ? (
        <div className={styles.empty}>No shortlists generated yet.</div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHead}>
            <span>Startup</span>
            <span>Candidates</span>
            <span>Status</span>
            <span>Created</span>
            <span>Actions</span>
          </div>
          {shortlists.map((sl) => (
            <div key={sl.id} className={styles.tableRow} id={`shortlist-row-${sl.id}`}>
              <span className={styles.primary}>{sl.startupProfile?.industry || sl.startupProfileId.slice(0, 8)}</span>
              <span>{sl.candidates.length} candidates</span>
              <span className={`badge ${STATUS_BADGE[sl.status] || ''}`}>{sl.status.replace(/_/g, ' ')}</span>
              <span style={{ fontSize: '0.875rem' }}>{new Date(sl.createdAt).toLocaleDateString()}</span>
              <div className={styles.actions}>
                <Link href={`/startup/matching?id=${sl.id}`} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }} id={`view-sl-${sl.id}`}>
                  View
                </Link>
                {sl.status === 'DRAFT' && (
                  <button className="btn btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}
                    onClick={() => handlePublish(sl.id)} disabled={publishing === sl.id} id={`publish-sl-${sl.id}`}>
                    {publishing === sl.id ? '…' : 'Publish'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminMatchingPage() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <AdminMatchingContent />
      </ProtectedLayout>
    </AuthProvider>
  );
}
