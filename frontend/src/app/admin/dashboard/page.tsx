'use client';

import { useEffect, useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { useAuth } from '@/contexts/AuthContext';
import { adminOpsApi, demoSeedApi, DemoCredentials, QueueCounts } from '@/lib/api-client';
import styles from './dashboard.module.css';
import Link from 'next/link';

function AdminDashboardContent() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<QueueCounts | null>(null);
  const [demo, setDemo] = useState<DemoCredentials | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');

  useEffect(() => {
    adminOpsApi.queueCounts().then(setCounts).catch(() => {});
  }, []);

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

  const opsQueues = [
    { id: 'pre-sow', icon: '📝', label: 'Pre-SOW review queue', href: '/admin/pre-sow', count: counts?.preSowAwaitingConfirmation, badge: 'awaiting confirmation' },
    { id: 'msa', icon: '✍️', label: 'MSA signing dashboard', href: '/admin/msa', count: counts?.msaPendingSignatures, badge: 'pending signatures' },
    { id: 'contracts', icon: '📄', label: 'SOW + contract signing', href: '/admin/contracts', count: counts?.contractsPendingSignatures, badge: 'pending signatures' },
    { id: 'compliance', icon: '⚖️', label: 'Compliance decisions', href: '/admin/compliance', count: counts?.complianceDecisionsLast30d, badge: 'last 30 days' },
    { id: 'eor', icon: '🌐', label: 'EOR enrolments', href: '/admin/eor', count: counts?.eorEnrolmentsPending, badge: 'pending' },
    { id: 'ledgers', icon: '💰', label: 'Payment ledgers', href: '/admin/ledgers', count: counts?.ledgersAwaitingReview, badge: 'awaiting review' },
  ];


  async function onSeedDemo() {
    setSeeding(true); setSeedMsg('');
    try {
      const result = await demoSeedApi.seed();
      setDemo(result);
      setSeedMsg('Demo data seeded. Use the credentials below to log in as either side.');
    } catch {
      setSeedMsg('Could not seed demo data. Check the backend log.');
    } finally {
      setSeeding(false);
    }
  }

  async function onCleanupDemo() {
    setSeeding(true); setSeedMsg('');
    try {
      await demoSeedApi.cleanup();
      setDemo(null);
      setSeedMsg('Demo data cleaned up.');
    } catch {
      setSeedMsg('Could not clean up demo data.');
    } finally {
      setSeeding(false);
    }
  }

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


      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Phase-2 clickable demo</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: 0 }}>
          Seeds a Demo Startup + Demo Operator with a complete end-to-end engagement (call done, mutual intent, Pre-SOW shared, MSA pending signatures, SOW + contract pending, active engagement workspace). Re-running wipes the previous demo data first.
        </p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button className="btn btn-primary" onClick={onSeedDemo} disabled={seeding}>
            {seeding ? 'Working…' : '🌱 Seed demo data'}
          </button>
          <button className="btn btn-secondary" onClick={onCleanupDemo} disabled={seeding}>
            🧹 Clean up demo
          </button>
        </div>
        {seedMsg && (
          <div style={{ padding: '10px 14px', background: '#fff3d6', color: '#8a5a1f', borderRadius: 4, fontSize: '0.85rem', marginBottom: 12 }}>
            {seedMsg}
          </div>
        )}
        {demo && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {(['startup', 'operator'] as const).map((side) => (
              <div key={side} className="card" style={{ flexDirection: 'column', gap: 6, padding: 16 }}>
                <div style={{ fontSize: '0.7rem', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                  Demo {side}
                </div>
                <div><strong>Email:</strong> <code>{demo[side].email}</code></div>
                <div><strong>Password:</strong> <code>{demo[side].password}</code></div>
                <a href={demo[side].dashboard} className="btn btn-secondary" style={{ width: 'fit-content', padding: '0.35rem 0.85rem', fontSize: '0.82rem' }}>
                  Open {side} dashboard →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Deal-desk queues</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: 0 }}>
          Triage surfaces for the engagement-flow gates. Numbers refresh on dashboard load.
        </p>
        <div className={styles.actionList}>
          {opsQueues.map((q) => (
            <Link key={q.id} href={q.href} className={`card ${styles.actionCard}`} id={`admin-queue-${q.id}`}>
              <span className={styles.actionIcon}>{q.icon}</span>
              <div className={styles.actionBody}>
                <span className={styles.actionLabel}>{q.label}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  {q.count != null ? `${q.count} ${q.badge}` : 'loading…'}
                </span>
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
