'use client';

import { useEffect, useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import styles from './page.module.css';

interface Invite {
  id: string;
  email: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
  createdAt: string;
  expiresAt: string;
}

function InvitationsContent() {
  const [invites, setInvites] = useState<Invite[]>([
    { id: '1', email: 'alex.operator@example.com', status: 'ACCEPTED', createdAt: '2026-02-10', expiresAt: '2026-02-17' },
    { id: '2', email: 'sam.growth@example.com', status: 'PENDING', createdAt: '2026-03-01', expiresAt: '2026-03-08' },
    { id: '3', email: 'jordan.sales@example.com', status: 'EXPIRED', createdAt: '2026-01-15', expiresAt: '2026-01-22' },
  ]);

  const statusColor: Record<string, string> = {
    ACCEPTED: '#10b981',
    PENDING: '#f59e0b',
    EXPIRED: '#ef4444',
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Invitations</h1>
        <p className={styles.subtitle}>View and manage your platform invitations.</p>
      </header>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Status</th>
              <th>Invited</th>
              <th>Expires</th>
            </tr>
          </thead>
          <tbody>
            {invites.map(inv => (
              <tr key={inv.id}>
                <td>{inv.email}</td>
                <td>
                  <span className={styles.badge} style={{ backgroundColor: statusColor[inv.status] + '20', color: statusColor[inv.status] }}>
                    {inv.status}
                  </span>
                </td>
                <td>{inv.createdAt}</td>
                <td>{inv.expiresAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function OperatorInvitationsPage() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <InvitationsContent />
      </ProtectedLayout>
    </AuthProvider>
  );
}
