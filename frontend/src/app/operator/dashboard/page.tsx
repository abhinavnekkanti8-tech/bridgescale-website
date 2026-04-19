'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { operatorsApi, OperatorProfile, SupplyQualityScore } from '@/lib/api-client';
import { CompletionChecklist } from '@/components/CompletionChecklist';
import { UnlockMatchingCTA } from '@/components/UnlockMatchingCTA';
import styles from './page.module.css';

const TIER_CONFIG: Record<string, { label: string; class: string }> = {
  TIER_A: { label: 'Tier A', class: 'badge-teal' },
  TIER_B: { label: 'Tier B', class: 'badge-amber' },
  TIER_C: { label: 'Tier C', class: '' },
  UNVERIFIED: { label: 'Unverified', class: '' },
};

const COMPONENT_META = [
  { key: 'domainExpertise', label: 'Domain Expertise', max: 20 },
  { key: 'regionExperience', label: 'Region Experience', max: 15 },
  { key: 'referencesVerified', label: 'References Verified', max: 15 },
  { key: 'trackRecord', label: 'Track Record', max: 15 },
  { key: 'platformFit', label: 'Platform Fit', max: 15 },
  { key: 'availability', label: 'Availability', max: 10 },
  { key: 'responsiveness', label: 'Responsiveness', max: 10 },
];

type CompletionStatus = {
  assessmentComplete: boolean;
  referencesComplete: boolean;
  canPay: boolean;
  matchingUnlocked: boolean;
  matchingUnlockedAt?: string;
};

function DashboardContent() {
  const [profile, setProfile] = useState<OperatorProfile | null>(null);
  const [score, setScore] = useState<SupplyQualityScore | null>(null);
  const [completion, setCompletion] = useState<CompletionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const prof = await operatorsApi.getMyProfile();
      setProfile(prof);
      if (prof && prof.scores?.length > 0) {
        setScore(prof.scores[0]);
        setPolling(false);
      } else if (prof) {
        setPolling(true);
      }

      // Fetch completion status for freemium flow
      try {
        const res = await fetch('/api/v1/applications/completion-status');
        if (res.ok) {
          const compData = await res.json();
          setCompletion(compData);
        }
      } catch (err) {
        // Completion status not available for old applications
      }
    } catch { /* no profile yet */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => { if (polling) fetchData(); }, 3000);
    return () => clearInterval(interval);
  }, [fetchData, polling]);

  if (loading) return <div className={styles.page}><p className={styles.loading}>Loading…</p></div>;

  if (!profile) return (
    <div className={styles.page}>
      <div className={styles.emptyCard}>
        <span style={{ fontSize: '3rem' }}>🚀</span>
        <h2>Create Your Operator Profile</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>Set up your profile to get quality-scored and matched with startups.</p>
        <Link href="/operator/profile" className="btn btn-primary" id="create-profile-cta">Create Profile →</Link>
      </div>
    </div>
  );

  const tierConf = TIER_CONFIG[profile.tier] || TIER_CONFIG.UNVERIFIED;

  const checklistItems = [
    { key: 'profile', label: 'Profile basics', complete: !!profile, actionLabel: 'Complete profile', actionHref: '/operator/profile' },
    { key: 'assessment', label: 'Assessment', complete: completion?.assessmentComplete ?? false, actionLabel: 'Complete now', actionHref: '/operator/dashboard/complete-assessment' },
    { key: 'references', label: 'References', complete: completion?.referencesComplete ?? false, actionLabel: 'Complete now', actionHref: '/operator/dashboard/complete-references' },
  ];

  const unlockReason = completion && !completion.canPay
    ? (!completion.assessmentComplete && !completion.referencesComplete)
      ? 'Complete your references and assessment to unlock matching.'
      : !completion.assessmentComplete
      ? 'Complete your assessment to unlock matching.'
      : !completion.referencesComplete
      ? 'Complete your references to unlock matching.'
      : undefined
    : undefined;

  return (
    <div className={styles.page} id="operator-dashboard">
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Operator Dashboard</h1>
          <p className={styles.subtitle}>Your profile, quality score, and verification status.</p>
        </div>
        <Link href="/operator/profile" className="btn btn-secondary">Edit Profile</Link>
      </div>

      {completion && !completion.matchingUnlocked && (
        <>
          <CompletionChecklist items={checklistItems} title="Profile completion" />
          <UnlockMatchingCTA
            canPay={completion.canPay}
            amount="$50"
            provider="STRIPE"
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
              if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl;
              }
            }}
            reason={unlockReason}
          />
        </>
      )}

      <div className={styles.statRow}>
        <div className={styles.stat}>
          <span className={styles.statValue}>
            <span className={`badge ${tierConf.class}`} style={{ fontSize: '1rem' }}>{tierConf.label}</span>
          </span>
          <span className={styles.statLabel}>Current Tier</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{profile.verification.replace(/_/g, ' ')}</span>
          <span className={styles.statLabel}>Verification</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{profile.lanes.map((l: string) => l.replace(/_/g, ' ')).join(', ')}</span>
          <span className={styles.statLabel}>Lanes</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{profile.regions.join(', ')}</span>
          <span className={styles.statLabel}>Regions</span>
        </div>
      </div>

      {polling && !score && (
        <div className={styles.loadingCard}>
          <div className={styles.spinner} />
          <h2>Quality Scoring in Progress…</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>Evaluating your 7 supply quality dimensions.</p>
        </div>
      )}

      {score && (
        <div className="card" style={{ flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className={styles.scoreHeader}>
            <h2>Supply Quality Score</h2>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: score.scoreTotal >= 80 ? '#14b8a6' : score.scoreTotal >= 65 ? '#f59e0b' : '#ef4444' }}>
              {score.scoreTotal}<span style={{ fontWeight: 400, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>/100</span>
            </span>
          </div>
          <div className={styles.breakdown}>
            {COMPONENT_META.map((c) => {
              const val = (score.scoreBreakdown as unknown as Record<string, number>)[c.key] ?? 0;
              const pct = (val / c.max) * 100;
              const barColor = pct >= 75 ? '#14b8a6' : pct >= 50 ? '#f59e0b' : '#ef4444';
              return (
                <div key={c.key} className={styles.breakdownRow}>
                  <span className={styles.compLabel}>{c.label}</span>
                  <div className={styles.barTrack}><div className={styles.barFill} style={{ width: `${pct}%`, background: barColor }} /></div>
                  <span className={styles.compScore}>{val}<span style={{ color: 'var(--color-text-muted)' }}>/{c.max}</span></span>
                </div>
              );
            })}
          </div>
          {score.blockers.length > 0 && (
            <div>
              <h3 style={{ marginBottom: 'var(--space-3)', fontSize: '0.9375rem' }}>Blockers</h3>
              <ul className={styles.blockerList}>
                {score.blockers.map((b: string, i: number) => <li key={i} className={styles.blocker}><span>⚠</span> {b}</li>)}
              </ul>
            </div>
          )}
          {score.recommendation && <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>{score.recommendation}</p>}
        </div>
      )}
    </div>
  );
}

export default function OperatorDashboardPage() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <DashboardContent />
      </ProtectedLayout>
    </AuthProvider>
  );
}
