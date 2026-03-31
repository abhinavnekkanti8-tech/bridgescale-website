'use client';

import { useEffect, useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { healthApi, EscalationCase } from '@/lib/api-client';
import styles from './page.module.css';

function AdminEscalationsContent() {
  const [escalations, setEscalations] = useState<EscalationCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCases = () => {
    setLoading(true);
    healthApi.getOpenEscalations()
      .then(setEscalations)
      .catch(() => setError('Failed to load escalation cases.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCases();
  }, []);

  async function handleUpdateStatus(id: string, newStatus: string) {
    try {
      if (newStatus === 'RESOLVED' || newStatus === 'CLOSED') {
        const notes = prompt('Please enter resolution notes:');
        if (notes === null) return; // cancelled
        await healthApi.updateEscalationStatus(id, { status: newStatus, resolutionNotes: notes });
      } else {
        await healthApi.updateEscalationStatus(id, { status: newStatus });
      }
      fetchCases();
    } catch {
      alert('Failed to update status.');
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Operation Escalations</h1>
        <p className={styles.subtitle}>Review engagement health risks and intervention requests.</p>
      </div>

      {error && <div className={styles.errorBox}><span>⚠</span> {error}</div>}

      {loading ? (
        <p className={styles.loading}>Loading cases…</p>
      ) : escalations.length === 0 ? (
        <div className={styles.emptyCard}>
          <span style={{ fontSize: '3rem' }}>✅</span>
          <h2>All clear!</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>No open escalations or health risks currently.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {escalations.map((esc) => (
            <div key={esc.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>Case: {esc.id.slice(-8).toUpperCase()}</h3>
                  <p className={styles.cardSubtext}>
                    Engagement ID: {esc.engagementId.slice(-8)} • Startup: {esc.engagement?.startup?.companyName}
                  </p>
                </div>
                <div>
                  <span className={`badge ${esc.status === 'INVESTIGATING' ? 'badge-blue' : 'badge-amber'}`}>
                    {esc.status}
                  </span>
                </div>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.detailRow}>
                  <dt>Reported By</dt>
                  <dd>{esc.reporter?.firstName} {esc.reporter?.lastName}</dd>
                </div>
                <div className={styles.detailRow}>
                  <dt>Submitted</dt>
                  <dd>{new Date(esc.createdAt).toLocaleString()}</dd>
                </div>
                <div className={styles.reasonBox}>
                  <strong>Reason for Escalation:</strong>
                  <p>{esc.reason}</p>
                </div>
              </div>
              <div className={styles.cardActions}>
                {esc.status === 'OPEN' && (
                  <button className="btn btn-secondary" onClick={() => handleUpdateStatus(esc.id, 'INVESTIGATING')}>
                    Start Investigating
                  </button>
                )}
                {esc.status !== 'RESOLVED' && esc.status !== 'CLOSED' && (
                  <button className="btn btn-primary" onClick={() => handleUpdateStatus(esc.id, 'RESOLVED')}>
                    Mark Resolved
                  </button>
                )}
                <button className="btn btn-secondary" style={{ color: 'var(--color-text-secondary)', background: 'transparent', border: 'none' }} onClick={() => handleUpdateStatus(esc.id, 'CLOSED')}>
                  Close Case (No action)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminEscalationsPage() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <AdminEscalationsContent />
      </ProtectedLayout>
    </AuthProvider>
  );
}
