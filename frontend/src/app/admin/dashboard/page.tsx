'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { useAuth } from '@/contexts/AuthContext';
import styles from './dashboard.module.css';
import Link from 'next/link';

function AdminDashboardContent() {
  const { user } = useAuth();

  const kpis = [
    { label: 'Startup Applications', value: '0', trend: '', color: 'var(--color-accent-amber)' },
    { label: 'Operators Active', value: '0', trend: '', color: 'var(--color-accent-violet)' },
    { label: 'Active Engagements', value: '0', trend: '', color: 'var(--color-accent-teal)' },
    { label: 'Engagements At Risk', value: '0', trend: '', color: '#ef4444' },
  ];

  const adminActions = [
    { id: 'applications', icon: '📨', label: 'Review Applications', href: '/admin/applications', badgeClass: 'badge-teal' },
    { id: 'startups', icon: '🚀', label: 'Review Startup Applications', href: '/admin/startups', badgeClass: 'badge-amber' },
    { id: 'operators', icon: '🌏', label: 'Verify Operators', href: '/admin/operators', badgeClass: 'badge-violet' },
    { id: 'engagements', icon: '📋', label: 'Monitor Engagements', href: '/admin/engagements', badgeClass: 'badge-teal' },
    { id: 'deal-desk', icon: '⚖️', label: 'Deal Desk Cases', href: '/admin/deal-desk', badgeClass: 'badge-amber' },
    { id: 'settings', icon: '⚙️', label: 'Scoring Configuration', href: '/admin/settings', badgeClass: 'badge-violet' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <p className={styles.subtitle}>Logged in as <span className="gradient-text">{user?.name}</span> · Platform Administration</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/admin/startups" className="btn btn-secondary" id="review-startups-btn">
            Review Startups
          </Link>
          <Link href="/admin/operators" className="btn btn-primary" id="verify-operators-btn">
            Verify Operators
          </Link>
        </div>
      </div>

      <div className={styles.statGrid}>
        {kpis.map((k) => (
          <div key={k.label} className="card" style={{ gap: '0.5rem' }}>
            <span className={styles.statLabel}>{k.label}</span>
            <span className={styles.statValue} style={{ color: k.color }}>{k.value}</span>
          </div>
        ))}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Admin Quick Actions</h2>
        <div className={styles.actionList}>
          {adminActions.map((a) => (
            <Link key={a.id} href={a.href} className={`card ${styles.actionCard}`} id={`admin-action-${a.id}`}>
              <span className={styles.actionIcon}>{a.icon}</span>
              <div className={styles.actionBody}>
                <span className={styles.actionLabel}>{a.label}</span>
              </div>
              <span className={styles.actionArrow}>→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <AdminDashboardContent />
      </ProtectedLayout>
    </AuthProvider>
  );
}
