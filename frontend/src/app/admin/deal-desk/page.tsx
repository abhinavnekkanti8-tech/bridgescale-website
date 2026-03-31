'use client';

import { useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import styles from './page.module.css';

interface DealDeskCase {
  id: string;
  startupName: string;
  triggerType: 'APPLICATION_REVIEW' | 'ESCALATION' | 'CUSTOM_DEAL' | 'RENEWAL';
  assignedTo: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  notes: string;
}

const MOCK_CASES: DealDeskCase[] = [
  { id: '1', startupName: 'AcmeTech Ltd', triggerType: 'APPLICATION_REVIEW', assignedTo: 'Jane (Deal Desk)', status: 'OPEN', createdAt: '2026-03-12', notes: 'High ARR, needs custom package.' },
  { id: '2', startupName: 'GrowthCo EU', triggerType: 'ESCALATION', assignedTo: 'Mike (Deal Desk)', status: 'IN_PROGRESS', createdAt: '2026-03-10', notes: 'Operator replacement requested, investigating.' },
  { id: '3', startupName: 'SalesForce Africa', triggerType: 'CUSTOM_DEAL', assignedTo: 'Jane (Deal Desk)', status: 'RESOLVED', createdAt: '2026-02-28', notes: 'Custom retainer negotiated. SOW v3 signed.' },
];

function DealDeskContent() {
  const [cases, setCases] = useState<DealDeskCase[]>(MOCK_CASES);
  const [filter, setFilter] = useState<string>('ALL');

  const filtered = filter === 'ALL' ? cases : cases.filter(c => c.status === filter);

  const statusColor: Record<string, string> = {
    OPEN: '#3b82f6',
    IN_PROGRESS: '#f59e0b',
    RESOLVED: '#10b981',
    CLOSED: '#6b7280',
  };

  function handleStatusChange(id: string, newStatus: string) {
    setCases(prev => prev.map(c => c.id === id ? { ...c, status: newStatus as DealDeskCase['status'] } : c));
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Deal Desk</h1>
        <p className={styles.subtitle}>Manage application reviews, escalations, custom deals, and partner assignments.</p>
      </header>

      <div className={styles.filterBar}>
        {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(f => (
          <button key={f} className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`} onClick={() => setFilter(f)}>
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className={styles.caseList}>
        {filtered.map(c => (
          <div key={c.id} className={styles.caseCard}>
            <div className={styles.caseHeader}>
              <h3>{c.startupName}</h3>
              <span className={styles.badge} style={{ backgroundColor: statusColor[c.status] + '20', color: statusColor[c.status] }}>
                {c.status.replace('_', ' ')}
              </span>
            </div>
            <div className={styles.caseMeta}>
              <span>Trigger: <strong>{c.triggerType.replace(/_/g, ' ')}</strong></span>
              <span>Assigned: <strong>{c.assignedTo}</strong></span>
              <span>Created: {c.createdAt}</span>
            </div>
            <p className={styles.caseNotes}>{c.notes}</p>
            <div className={styles.caseActions}>
              <select value={c.status} onChange={e => handleStatusChange(c.id, e.target.value)}>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className={styles.empty}>No cases match the current filter.</div>}
      </div>
    </div>
  );
}

export default function DealDeskPage() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <DealDeskContent />
      </ProtectedLayout>
    </AuthProvider>
  );
}
