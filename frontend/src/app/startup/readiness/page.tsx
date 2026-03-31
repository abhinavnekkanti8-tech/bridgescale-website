'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { startupsApi, ReadinessScore } from '@/lib/api-client';
import styles from './page.module.css';

const ELIGIBILITY_CONFIG = {
  INELIGIBLE: { label: 'Not Yet Eligible', color: '#ef4444', badgeClass: 'badge-amber', description: 'Your score is below 60. Resolve blockers before applying for a sprint.' },
  SPRINT_ONLY: { label: 'Sprint Eligible', color: '#f59e0b', badgeClass: 'badge-amber', description: 'Score 60–74. You can apply for a Pipeline or BD Sprint with strict governance.' },
  SPRINT_AND_RETAINER: { label: 'All Packages Eligible', color: '#14b8a6', badgeClass: 'badge-teal', description: 'Score 75+. You are eligible for all packages including Fractional Retainer.' },
};

const COMPONENT_META = [
  { key: 'icpClarity', label: 'ICP Clarity', max: 15 },
  { key: 'collateralReadiness', label: 'Collateral Readiness', max: 15 },
  { key: 'executionCapacity', label: 'Execution Capacity', max: 20 },
  { key: 'budgetReadiness', label: 'Budget Readiness', max: 20 },
  { key: 'salesMotionFit', label: 'Sales Motion Fit', max: 10 },
  { key: 'toolingReadiness', label: 'Tooling Readiness', max: 10 },
  { key: 'responsivenessCommitment', label: 'Responsiveness Commitment', max: 10 },
];

function ScoreGauge({ score }: { score: number }) {
  const pct = (score / 100) * 100;
  const color = score >= 75 ? '#14b8a6' : score >= 60 ? '#f59e0b' : '#ef4444';
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className={styles.gaugeWrap}>
      <svg className={styles.gauge} viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="54" stroke="var(--color-border)" strokeWidth="10" />
        <circle
          cx="60" cy="60" r="54"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className={styles.gaugeCenter}>
        <span className={styles.gaugeScore} style={{ color }}>{score}</span>
        <span className={styles.gaugeLabel}>/ 100</span>
      </div>
    </div>
  );
}

function ReadinessContent() {
  const searchParams = useSearchParams();
  const profileId = searchParams.get('profileId');
  const [score, setScore] = useState<ReadinessScore | null>(null);
  const [polling, setPolling] = useState(true);
  const [error, setError] = useState('');

  const fetchScore = useCallback(async () => {
    if (!profileId) { setError('No profile ID provided.'); setPolling(false); return; }
    try {
      const scores = await startupsApi.getScores(profileId);
      if (scores.length > 0) {
        setScore(scores[0]);
        setPolling(false);
      }
    } catch { setError('Could not load scores. Please try again.'); setPolling(false); }
  }, [profileId]);

  useEffect(() => {
    fetchScore();
    const interval = setInterval(() => { if (polling) fetchScore(); }, 3000);
    return () => clearInterval(interval);
  }, [fetchScore, polling]);

  if (error) return (
    <div className={styles.page}>
      <div className={styles.errorBox}><span>⚠</span> {error}</div>
      <Link href="/startup/profile" className="btn btn-primary">Re-submit Profile</Link>
    </div>
  );

  if (polling && !score) return (
    <div className={styles.page}>
      <div className={styles.loadingCard} id="scoring-loading">
        <div className={styles.spinner} />
        <h2>AI Scoring in Progress…</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>Our AI is evaluating your 7 readiness dimensions. This takes about 5 seconds.</p>
      </div>
    </div>
  );

  if (!score) return null;

  const eligConf = ELIGIBILITY_CONFIG[score.eligibility];

  return (
    <div className={styles.page} id="readiness-result">
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Demand Readiness Score</h1>
          <p className={styles.subtitle}>AI-generated assessment based on your startup profile.</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/startup/profile" className="btn btn-secondary" id="re-score-btn">Re-submit Profile</Link>
        </div>
      </div>

      {/* Score overview */}
      <div className={styles.scoreOverview}>
        <ScoreGauge score={score.scoreTotal} />
        <div className={styles.scoreDetails}>
          <span className={`badge ${eligConf.badgeClass}`} style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}>
            {eligConf.label}
          </span>
          <p className={styles.eligDesc}>{eligConf.description}</p>
          {score.recommendation && (
            <div className={styles.recommendation}>
              <span className={styles.recLabel}>AI Recommendation</span>
              <p>{score.recommendation}</p>
            </div>
          )}
          {score.adminOverride && (
            <div className={styles.overrideBadge}>⚙ Score manually overridden by Platform Admin</div>
          )}
        </div>
      </div>

      {/* Component breakdown */}
      <div className="card" style={{ flexDirection: 'column', gap: 'var(--space-4)' }}>
        <h2 className={styles.sectionTitle}>Score Breakdown</h2>
        <div className={styles.breakdown}>
          {COMPONENT_META.map((c) => {
            const val = (score.scoreBreakdown as Record<string, number>)[c.key] ?? 0;
            const pct = (val / c.max) * 100;
            const barColor = pct >= 75 ? '#14b8a6' : pct >= 50 ? '#f59e0b' : '#ef4444';
            return (
              <div key={c.key} className={styles.breakdownRow}>
                <span className={styles.compLabel}>{c.label}</span>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${pct}%`, background: barColor }} />
                </div>
                <span className={styles.compScore}>{val}<span style={{ color: 'var(--color-text-muted)' }}>/{c.max}</span></span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Blockers */}
      {score.blockers.length > 0 && (
        <div className="card" style={{ flexDirection: 'column', gap: 'var(--space-4)' }}>
          <h2 className={styles.sectionTitle}>Blockers to Resolve</h2>
          <ul className={styles.blockerList}>
            {score.blockers.map((b, i) => (
              <li key={i} className={styles.blocker}>
                <span className={styles.blockerIcon}>⚠</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA */}
      {score.eligibility !== 'INELIGIBLE' && (
        <div className={styles.ctaCard}>
          <h3>Ready to find your operator?</h3>
          <p>You're eligible for a structured sprint engagement. Schedule your discovery call to get matched.</p>
          <Link href="/startup/discovery" id="schedule-discovery-cta" className="btn btn-primary">
            Schedule Discovery Call →
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ReadinessPage() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <ReadinessContent />
      </ProtectedLayout>
    </AuthProvider>
  );
}
