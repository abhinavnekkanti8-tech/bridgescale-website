'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { useAuth } from '@/contexts/AuthContext';
import styles from './dashboard.module.css';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { BlurredMatchCard } from '@/components/BlurredMatchCard';
import { UnlockMatchingCTA } from '@/components/UnlockMatchingCTA';

type MatchData = {
  applicationId: string;
  status: string;
  matchingUnlocked: boolean;
  matchingUnlockedAt?: string;
  feeAmountMinor: number;
  feeCurrency: string;
  paymentProvider: string;
  startupProfile?: {
    shortlists: Array<{
      candidates: Array<{
        id: string;
        matchScore?: number;
        region?: string;
        lane?: string;
        yearsExperience?: number;
      }>;
    }>;
  };
};

type CompletionStatus = {
  matchingUnlocked: boolean;
  canPay: boolean;
  feeCurrency: string;
  paymentProvider: string;
};

function StartupDashboardContent() {
  const { user } = useAuth();
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [completionStatus, setCompletionStatus] = useState<CompletionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [appRes, statusRes] = await Promise.allSettled([
        fetch('/api/v1/applications/my-application', { credentials: 'include' }),
        fetch('/api/v1/applications/completion-status', { credentials: 'include' }),
      ]);

      if (appRes.status === 'fulfilled' && appRes.value.ok) {
        setMatchData(await appRes.value.json());
      }
      if (statusRes.status === 'fulfilled' && statusRes.value.ok) {
        setCompletionStatus(await statusRes.value.json());
      }
      setLoading(false);
    }
    fetchData();
  }, []);

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
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Your top matches</h2>
          <p className={styles.sectionSubtitle}>
            {completionStatus?.matchingUnlocked
              ? 'You\'ve unlocked full match details.'
              : 'Unlock to see operator profiles, track records, and book discovery calls.'}
          </p>
        </div>

        {(() => {
          const candidates = matchData?.startupProfile?.shortlists?.[0]?.candidates ?? [];
          const locked = !completionStatus?.matchingUnlocked;

          return candidates.length > 0 ? (
            <div className={styles.matchesGrid}>
              {candidates.slice(0, 3).map((c, i) => (
                <BlurredMatchCard
                  key={c.id ?? i}
                  matchScore={c.matchScore ?? 80 + i * 5}
                  region={c.region ?? 'EU / UK'}
                  lane={c.lane ?? 'General'}
                  yearsExperience={c.yearsExperience ?? 5}
                  locked={locked}
                />
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              We&apos;re preparing your matches. Check back soon.
            </p>
          );
        })()}

        {completionStatus && !completionStatus.matchingUnlocked && (
          <UnlockMatchingCTA
            canPay={completionStatus.canPay}
            amount={completionStatus.feeCurrency === 'INR' ? '₹8,500' : '$100'}
            provider={completionStatus.paymentProvider ?? 'RAZORPAY'}
            onUnlock={async () => {
              const res = await fetch('/api/v1/applications/initiate-unlock', {
                method: 'POST',
                credentials: 'include',
              });
              const data = await res.json();
              if (data.dummyMode && data.unlocked) {
                window.location.reload();
                return;
              }
              // TODO: open Razorpay modal with data.orderId / data.keyId
              alert('Payment flow coming soon. Set DUMMY_PAYMENT_MODE=true in dev.');
            }}
            reason={!completionStatus.canPay ? 'Complete all required steps first.' : undefined}
          />
        )}
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
