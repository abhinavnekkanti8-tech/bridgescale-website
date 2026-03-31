'use client';

import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { contractsApi, paymentsApi, StatementOfWork } from '@/lib/api-client';
import styles from './page.module.css';

const SOW_STATUS_BADGE: Record<string, string> = { DRAFT: '', REVIEW: 'badge-amber', APPROVED: 'badge-teal', SIGNED: 'badge-violet', LOCKED: '' };
const CONTRACT_STATUS_BADGE: Record<string, string> = { PENDING_SIGNATURES: 'badge-amber', STARTUP_SIGNED: 'badge-teal', OPERATOR_SIGNED: 'badge-teal', FULLY_SIGNED: 'badge-violet', CANCELLED: '' };

function AdminContractsContent() {
  const [sows, setSows] = useState<StatementOfWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unlocking, setUnlocking] = useState<string | null>(null);

  // Payment Plan State
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState('');
  const [planType, setPlanType] = useState('MONTHLY_RETAINER');
  const [planAmount, setPlanAmount] = useState('');
  const [creatingPlan, setCreatingPlan] = useState(false);

  const fetchSows = () => {
    contractsApi.findAllSows()
      .then(setSows)
      .catch(() => setError('Could not load contracts.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSows();
  }, []);

  async function handleUnlockContacts(contractId: string) {
    if (!confirm('Manually unlock contacts for this contract?')) return;
    setUnlocking(contractId);
    try {
      await contractsApi.unlockContacts(contractId);
      fetchSows();
    } catch {
      alert('Failed to unlock contacts.');
    } finally {
      setUnlocking(null);
    }
  }

  async function handleCreatePlan(e: FormEvent) {
    e.preventDefault();
    setCreatingPlan(true);
    try {
      await paymentsApi.createPlan({
        contractId: selectedContractId,
        planType,
        totalAmountUsd: parseInt(planAmount, 10),
      });
      setShowPlanModal(false);
      setSelectedContractId('');
      setPlanAmount('');
      alert('Payment plan created successfully!');
    } catch {
      alert('Failed to create payment plan. It might already exist.');
    } finally {
      setCreatingPlan(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Contract Administration</h1>
          <p className={styles.subtitle}>{sows.length} Statements of Work</p>
        </div>
      </div>

      {error && <div className={styles.errorBox}><span>⚠</span> {error}</div>}

      {showPlanModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Setup Payment Plan</h2>
            <p className={styles.subtext}>Contract ID: {selectedContractId}</p>
            <form onSubmit={handleCreatePlan} className={styles.modalForm}>
              <div className={styles.field}>
                <label>Plan Type</label>
                <select value={planType} onChange={(e) => setPlanType(e.target.value)} required>
                  <option value="MONTHLY_RETAINER">Monthly Retainer</option>
                  <option value="CASH_SPRINT_FEE">Cash Sprint Fee</option>
                  <option value="SUCCESS_FEE_ADDENDUM">Success Fee Addendum</option>
                </select>
              </div>
              <div className={styles.field}>
                <label>Total Value (USD)</label>
                <input type="number" value={planAmount} onChange={(e) => setPlanAmount(e.target.value)} required min={100} />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowPlanModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creatingPlan}>{creatingPlan ? 'Saving...' : 'Create Plan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>Loading…</div>
      ) : sows.length === 0 ? (
        <div className={styles.empty}>No contracts generated yet.</div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHead}>
            <span>Title & Org</span>
            <span>Value</span>
            <span>SoW Status</span>
            <span>Contract Status</span>
            <span>Actions</span>
          </div>
          {sows.map((sow) => (
            <div key={sow.id} className={styles.tableRow}>
              <div>
                <p className={styles.primaryTitle}>{sow.title}</p>
                <p className={styles.subtext}>Org: {sow.startupProfileId.slice(0, 8)}... | Op: {sow.operatorId.slice(0, 8)}...</p>
              </div>
              <span className={styles.valueText}>${sow.totalPriceUsd.toLocaleString()}</span>
              
              <span className={`badge ${SOW_STATUS_BADGE[sow.status] || ''}`}>
                {sow.status} (v{sow.currentVersion})
              </span>
              
              <span className={`badge ${sow.contract ? CONTRACT_STATUS_BADGE[sow.contract.status] : ''}`}>
                {sow.contract ? sow.contract.status.replace(/_/g, ' ') : 'N/A'}
              </span>
              
              <div className={styles.actions}>
                <Link href={`/contracts/sow?id=${sow.id}`} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}>
                  {sow.status === 'DRAFT' ? 'Edit SoW' : 'View SoW'}
                </Link>

                {sow.contract?.status === 'FULLY_SIGNED' && !sow.contract.contactsUnlocked && (
                  <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}
                    onClick={() => handleUnlockContacts(sow.contract!.id)} disabled={unlocking === sow.contract!.id}>
                    {unlocking === sow.contract!.id ? '...' : 'Unlock'}
                  </button>
                )}
                {sow.contract?.status === 'FULLY_SIGNED' && (
                  <button className="btn btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}
                    onClick={() => { setSelectedContractId(sow.contract!.id); setPlanAmount(sow.totalPriceUsd.toString()); setShowPlanModal(true); }}>
                    Setup Billing
                  </button>
                )}
                {sow.contract?.contactsUnlocked && (
                  <span style={{ fontSize: '0.75rem', color: '#14b8a6', fontWeight: 600 }}>Unlocked</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminContractsPage() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <AdminContractsContent />
      </ProtectedLayout>
    </AuthProvider>
  );
}
