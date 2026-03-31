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

function StartupContractsContent() {
  const { user } = useAuth();
  const [sows, setSows] = useState<StatementOfWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [signing, setSigning] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (user?.organizationId) {
      contractsApi.findByStartup(user.organizationId)
        .then(setSows)
        .catch(() => setError('Could not load contracts.'))
        .finally(() => setLoading(false));
    }
  }, [user]);

  async function handleSign(contractId: string) {
    setSigning(contractId);
    try {
      // Dummy signature workflow (in real app, redirect to DocuSign/Hellosign)
      const fakeSignatureId = `sig_startup_${Date.now()}`;
      const idempotencyKey = `idemp_${Date.now()}`;
      await contractsApi.signStartup(contractId, fakeSignatureId, idempotencyKey);
      
      // Refresh list
      if (user?.organizationId) {
        const updated = await contractsApi.findByStartup(user.organizationId);
        setSows(updated);
      }
      alert('Contract digitally signed locally (dummy workflow).');
    } catch {
      setError('Signing failed.');
    } finally {
      setSigning(null);
    }
  }

  async function handleDownload(contractId: string) {
    setDownloading(contractId);
    try {
      // Trigger API to log the download
      await fetch(`/api/v1/contracts/${contractId}/log-download`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
      });
      // In real app, trigger a file download from S3
      alert('Document download logged successfully. (File download simulated)');
    } catch {
      setError('Failed to log document download.');
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className={styles.page} id="startup-contracts">
      <div className={styles.header}>
        <h1 className={styles.title}>Contracts & SoWs</h1>
        <p className={styles.subtitle}>Manage statements of work and e-signatures.</p>
      </div>

      {error && <div className={styles.errorBox}><span>⚠</span> {error}</div>}

      {loading ? (
        <p className={styles.loading}>Loading…</p>
      ) : sows.length === 0 ? (
        <div className={styles.emptyCard}>
          <span style={{ fontSize: '3rem' }}>📄</span>
          <h2>No active contracts</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>Approve a match to generate an SoW.</p>
        </div>
      ) : (
        <div className={styles.cardList}>
          {sows.map((sow) => (
            <div key={sow.id} className={styles.contractCard} id={`contract-${sow.contract?.id || sow.id}`}>
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
                  {sow.status === 'DRAFT' || sow.status === 'REVIEW' ? 'Review & Approve SoW' : 'View SoW'}
                </Link>

                {sow.contract && sow.contract.status !== 'FULLY_SIGNED' && !sow.contract.startupSignedAt && (
                  <button className="btn btn-primary" disabled={signing === sow.contract.id}
                    onClick={() => handleSign(sow.contract!.id)} id={`sign-${sow.contract.id}`}>
                    {signing === sow.contract.id ? 'Signing…' : '✍️ Sign Contract'}
                  </button>
                )}

                {sow.contract && sow.contract.startupSignedAt && sow.contract.status !== 'FULLY_SIGNED' && (
                  <span className={styles.waitingText}>Waiting for Operator signature...</span>
                )}

                {sow.contract?.status === 'FULLY_SIGNED' && (
                  <>
                    <button className="btn btn-secondary" disabled={downloading === sow.contract.id}
                      onClick={() => handleDownload(sow.contract!.id)}>
                      📥 Download PDF
                    </button>
                    {sow.contract.contactsUnlocked && <span className={styles.unlockedText}>🔓 Contacts Unlocked</span>}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StartupContractsPage() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <StartupContractsContent />
      </ProtectedLayout>
    </AuthProvider>
  );
}
