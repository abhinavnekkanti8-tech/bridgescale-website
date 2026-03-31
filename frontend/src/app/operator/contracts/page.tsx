'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { contractsApi, StatementOfWork } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import styles from './page.module.css';

const SOW_STATUS_BADGE: Record<string, string> = { DRAFT: '', REVIEW: 'badge-amber', APPROVED: 'badge-teal', SIGNED: 'badge-violet', LOCKED: '' };
const CONTRACT_STATUS_BADGE: Record<string, string> = { PENDING_SIGNATURES: 'badge-amber', STARTUP_SIGNED: 'badge-teal', OPERATOR_SIGNED: 'badge-teal', FULLY_SIGNED: 'badge-violet', CANCELLED: '' };

function OperatorContractsContent() {
  const { user } = useAuth();
  const [sows, setSows] = useState<StatementOfWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [signing, setSigning] = useState<string | null>(null);

  useEffect(() => {
    // Note: Operator users have user.id mapping directly to OperatorProfile.id in our schema (from token)
    if (user?.id) {
      contractsApi.findByOperator(user.id)
        .then(setSows)
        .catch(() => setError('Could not load contracts.'))
        .finally(() => setLoading(false));
    }
  }, [user]);

  async function handleSign(contractId: string) {
    setSigning(contractId);
    try {
      const fakeSignatureId = `sig_operator_${Date.now()}`;
      const idempotencyKey = `idemp_op_${Date.now()}`;
      await contractsApi.signOperator(contractId, fakeSignatureId, idempotencyKey);
      
      if (user?.id) {
        const updated = await contractsApi.findByOperator(user.id);
        setSows(updated);
      }
      alert('Contract digitally signed locally (dummy workflow).');
    } catch {
      setError('Signing failed.');
    } finally {
      setSigning(null);
    }
  }

  return (
    <div className={styles.page} id="operator-contracts">
      <div className={styles.header}>
        <h1 className={styles.title}>My Contracts</h1>
        <p className={styles.subtitle}>Review Statements of Work and sign agreements.</p>
      </div>

      {error && <div className={styles.errorBox}><span>⚠</span> {error}</div>}

      {loading ? (
        <p className={styles.loading}>Loading…</p>
      ) : sows.length === 0 ? (
        <div className={styles.emptyCard}>
          <span style={{ fontSize: '3rem' }}>🤝</span>
          <h2>No active contracts</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>You have no pending statements of work.</p>
        </div>
      ) : (
        <div className={styles.cardList}>
          {sows.map((sow) => (
            <div key={sow.id} className={styles.contractCard}>
              <div className={styles.cardTop}>
                <div>
                  <h3 className={styles.cardTitle}>{sow.title}</h3>
                  <div className={styles.metaRow}>
                    <span>${sow.totalPriceUsd.toLocaleString()} / engagement</span>
                    <span>•</span>
                    <span>{sow.weeklyHours} hrs/wk</span>
                    <span>•</span>
                    <span>v{sow.currentVersion}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <span className={`badge ${SOW_STATUS_BADGE[sow.status] || ''}`}>SoW: {sow.status}</span>
                  {sow.contract && <span className={`badge ${CONTRACT_STATUS_BADGE[sow.contract.status] || ''}`}>Sign: {sow.contract.status.replace(/_/g, ' ')}</span>}
                </div>
              </div>

              <div className={styles.actionRow}>
                <Link href={`/contracts/sow?id=${sow.id}`} className="btn btn-secondary">
                  {sow.status === 'DRAFT' ? 'Edit SoW' : 'View SoW'}
                </Link>

                {sow.contract && sow.contract.status !== 'FULLY_SIGNED' && !sow.contract.operatorSignedAt && (
                  <button className="btn btn-primary" disabled={signing === sow.contract.id}
                    onClick={() => handleSign(sow.contract!.id)} id={`sign-op-${sow.contract.id}`}>
                    {signing === sow.contract.id ? 'Signing…' : '✍️ Sign Contract'}
                  </button>
                )}

                {sow.contract && sow.contract.operatorSignedAt && sow.contract.status !== 'FULLY_SIGNED' && (
                  <span className={styles.waitingText}>Waiting for Startup signature...</span>
                )}

                {sow.contract?.status === 'FULLY_SIGNED' && (
                  <span className={styles.unlockedText}>✅ Engagement Active — Contacts Unlocked</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OperatorContractsPage() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <OperatorContractsContent />
      </ProtectedLayout>
    </AuthProvider>
  );
}
