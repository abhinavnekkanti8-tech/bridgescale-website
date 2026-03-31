'use client';

import { useEffect, useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { operatorsApi, OperatorProfile } from '@/lib/api-client';
import styles from './page.module.css';

const TIER_BADGE: Record<string, string> = { TIER_A: 'badge-teal', TIER_B: 'badge-amber', TIER_C: '', UNVERIFIED: '' };
const VERIF_BADGE: Record<string, string> = { VERIFIED: 'badge-teal', PENDING: 'badge-amber', REJECTED: '' };

function AdminOperatorsContent() {
  const [operators, setOperators] = useState<OperatorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    operatorsApi.getAll()
      .then(setOperators)
      .catch(() => setError('Could not load operators.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleVerify(profileId: string, action: 'VERIFIED' | 'REJECTED') {
    setActioningId(profileId);
    try {
      const updated = await operatorsApi.verify(profileId, action);
      setOperators((ops) => ops.map((o) => (o.id === profileId ? { ...o, verification: updated.verification } : o)));
    } catch { setError('Action failed.'); }
    setActioningId(null);
  }

  async function handleScore(profileId: string) {
    setActioningId(profileId);
    try {
      await operatorsApi.requestScore(profileId);
      setError('');
    } catch { setError('Scoring failed.'); }
    setActioningId(null);
  }

  const filtered = operators.filter((o) =>
    o.lanes.some((l: string) => l.toLowerCase().includes(search.toLowerCase())) ||
    o.regions.some((r: string) => r.toLowerCase().includes(search.toLowerCase())) ||
    o.tier.toLowerCase().includes(search.toLowerCase()) ||
    o.verification.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Operators</h1>
          <p className={styles.subtitle}>{operators.length} total operators</p>
        </div>
      </div>

      <input
        id="search-operators"
        type="search"
        className={styles.search}
        placeholder="Search by lane, region, tier, or status…"
        value={search}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
      />

      {error && <div className={styles.errorBox}><span>⚠</span> {error}</div>}

      {loading ? (
        <div className={styles.loading}>Loading operators…</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>No operators found.</div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHead}>
            <span>Operator</span>
            <span>Lanes</span>
            <span>Tier</span>
            <span>Verification</span>
            <span>Score</span>
            <span>Actions</span>
          </div>
          {filtered.map((op) => {
            const latestScore = op.scores?.[0];
            return (
              <div key={op.id} className={styles.tableRow} id={`operator-row-${op.id}`}>
                <div>
                  <span className={styles.orgName}>{op.operator?.name ?? 'Unknown'}</span>
                  <span className={styles.orgCountry}>{op.regions.join(', ')}</span>
                </div>
                <span style={{ fontSize: '0.8125rem' }}>{op.lanes.map((l: string) => l.replace(/_/g, ' ')).join(', ')}</span>
                <span className={`badge ${TIER_BADGE[op.tier] || ''}`}>{op.tier.replace(/_/g, ' ')}</span>
                <span className={`badge ${VERIF_BADGE[op.verification] || ''}`}>{op.verification}</span>
                <span className={styles.score}>
                  {latestScore ? (
                    <span style={{ fontWeight: 700 }}>{latestScore.scoreTotal}<span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>/100</span></span>
                  ) : '—'}
                </span>
                <div className={styles.actions}>
                  {op.verification === 'PENDING' && (
                    <>
                      <button className="btn btn-primary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }} disabled={actioningId === op.id}
                        onClick={() => handleVerify(op.id, 'VERIFIED')} id={`verify-${op.id}`}>✓ Verify</button>
                      <button className="btn btn-secondary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }} disabled={actioningId === op.id}
                        onClick={() => handleVerify(op.id, 'REJECTED')} id={`reject-${op.id}`}>✗ Reject</button>
                    </>
                  )}
                  {!latestScore && (
                    <button className="btn btn-secondary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }} disabled={actioningId === op.id}
                      onClick={() => handleScore(op.id)} id={`score-${op.id}`}>Score</button>
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

export default function AdminOperatorsPage() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <AdminOperatorsContent />
      </ProtectedLayout>
    </AuthProvider>
  );
}
