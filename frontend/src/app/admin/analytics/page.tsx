'use client';

import { useEffect, useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { analyticsApi, AdminDashboardMetrics } from '@/lib/api-client';
import styles from './page.module.css';

function KPIWidget({ title, value, subtitle, trend }: { title: string, value: string | number, subtitle?: string, trend?: 'up' | 'down' | 'neutral' }) {
  return (
    <div className={styles.kpiCard}>
      <h3 className={styles.kpiTitle}>{title}</h3>
      <div className={styles.kpiValue}>
        {value}
        {trend === 'up' && <span className={styles.trendUp}>↑</span>}
        {trend === 'down' && <span className={styles.trendDown}>↓</span>}
      </div>
      {subtitle && <p className={styles.kpiSubtitle}>{subtitle}</p>}
    </div>
  );
}

function AdminAnalyticsContent() {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    analyticsApi.getDashboardMetrics()
      .then(setMetrics)
      .catch(() => setError('Failed to load dashboard metrics.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.page}><p className={styles.loading}>Loading Dashboard…</p></div>;
  if (error || !metrics) return <div className={styles.page}><div className={styles.errorBox}><span>⚠</span> {error}</div></div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Platform Analytics</h1>
        <p className={styles.subtitle}>Real-time marketplace health, financials, and utilization.</p>
      </header>

      <div className={styles.dashboardGrid}>
        
        {/* Platform Health Sector */}
        <section className={styles.sector}>
          <h2 className={styles.sectorTitle}>Marketplace Supply & Demand</h2>
          <div className={styles.metricGrid}>
            <KPIWidget title="Total Startups" value={metrics.platformHealth.totalStartups} trend="up" subtitle="Registered clients" />
            <KPIWidget title="Active Operators" value={metrics.platformHealth.totalOperators} trend="up" subtitle="Approved experts" />
            <KPIWidget title="Active Engagements" value={metrics.platformHealth.activeEngagements} subtitle="Currently in progress" />
            <KPIWidget title="Completed Sprints" value={metrics.platformHealth.completedEngagements} subtitle="Lifetime total" />
          </div>
        </section>

        {/* Financials Sector */}
        <section className={styles.sector}>
          <h2 className={styles.sectorTitle}>Financials & Revenue</h2>
          <div className={styles.metricGrid}>
            <KPIWidget title="Est. MRR" value={`$${metrics.financials.mrr.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} trend="up" subtitle="Monthly Recurring Revenue" />
            <KPIWidget title="Total Processed" value={`$${metrics.financials.totalInvoiced.toLocaleString()}`} subtitle="Lifetime Platform Volume" />
            <KPIWidget title="Unpaid Invoices" value={metrics.financials.unpaidInvoices} trend="neutral" subtitle="Awaiting client payment" />
          </div>
        </section>

        {/* Ops & Matching Sector */}
        <section className={styles.sector}>
          <h2 className={styles.sectorTitle}>Operations & Engagement Health</h2>
          <div className={styles.metricGrid}>
            <KPIWidget title="Open Match Queues" value={metrics.matching.openMatches} subtitle="Startups awaiting shortlists" />
            <KPIWidget title="Avg. Time to Match" value={`${metrics.matching.avgTimeDays} Days`} trend="down" subtitle="Application to SOW signed" />
            <KPIWidget title="Healthy Engagements" value={metrics.engagementHealth.onTrack} subtitle="Health Score >= 80" />
            <KPIWidget title="Engagements At Risk" value={metrics.engagementHealth.atRisk} trend="down" subtitle="Health Score < 50. Action req." />
          </div>
        </section>

      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <AdminAnalyticsContent />
      </ProtectedLayout>
    </AuthProvider>
  );
}
