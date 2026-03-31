'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { useAuth } from '@/contexts/AuthContext';
import styles from './dashboard.module.css';
import Link from 'next/link';

function StartupDashboardContent() {
  const { user } = useAuth();

  const nextActions = [
    { id: 'readiness', icon: '📊', label: 'View Readiness Score', href: '/startup/profile', status: 'Pending', badgeClass: 'badge-amber' },
    { id: 'discovery', icon: '📅', label: 'Schedule Discovery Call', href: '/startup/discovery', status: 'Not started', badgeClass: 'badge-violet' },
    { id: 'shortlist', icon: '🔍', label: 'View Operator Shortlist', href: '/startup/shortlist', status: 'Locked', badgeClass: 'badge-teal' },
    { id: 'engagements', icon: '🚀', label: 'Active Engagements', href: '/startup/engagements', status: '0 active', badgeClass: 'badge-teal' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Welcome back, <span className="gradient-text">{user?.name}</span></h1>
          <p className={styles.subtitle}>Here&apos;s an overview of your platform activity.</p>
        </div>
        <Link href="/startup/profile" className="btn btn-primary" id="complete-profile-btn">
          Complete Profile →
        </Link>
      </div>

      <div className={styles.statGrid}>
        {[
          { label: 'Readiness Score', value: '—', note: 'Submit profile to score', color: 'var(--color-accent-amber)' },
          { label: 'Operators Shortlisted', value: '0', note: 'After discovery call', color: 'var(--color-accent-violet)' },
          { label: 'Active Engagements', value: '0', note: 'No active sprints', color: 'var(--color-accent-teal)' },
          { label: 'Health Score', value: '—', note: 'No active engagement', color: '#22c55e' },
        ].map((s) => (
          <div key={s.label} className="card" style={{ gap: '0.5rem' }}>
            <span className={styles.statLabel}>{s.label}</span>
            <span className={styles.statValue} style={{ color: s.color }}>{s.value}</span>
            <span className={styles.statNote}>{s.note}</span>
          </div>
        ))}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Your Next Steps</h2>
        <div className={styles.actionList}>
          {nextActions.map((a) => (
            <Link key={a.id} href={a.href} className={`card ${styles.actionCard}`} id={`action-${a.id}`}>
              <span className={styles.actionIcon}>{a.icon}</span>
              <div className={styles.actionBody}>
                <span className={styles.actionLabel}>{a.label}</span>
                <span className={`badge ${a.badgeClass}`}>{a.status}</span>
              </div>
              <span className={styles.actionArrow}>→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function StartupDashboardPage() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <StartupDashboardContent />
      </ProtectedLayout>
    </AuthProvider>
  );
}
