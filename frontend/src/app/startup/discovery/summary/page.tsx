'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { discoveryApi, DiscoveryCall, Package } from '@/lib/api-client';
import styles from './page.module.css';

const PKG_ICON: Record<string, string> = { PIPELINE_SPRINT: '🚀', BD_SPRINT: '🤝', FRACTIONAL_RETAINER: '👔' };
const STATUS_BADGE: Record<string, string> = { SCHEDULED: 'badge-violet', COMPLETED: 'badge-teal', CANCELLED: '', NO_SHOW: '' };

function SummaryContent() {
  const searchParams = useSearchParams();
  const callId = searchParams.get('callId');
  const [call, setCall] = useState<DiscoveryCall | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [polling, setPolling] = useState(true);
  const [notes, setNotes] = useState('');
  const [submittingNotes, setSubmittingNotes] = useState(false);
  const [error, setError] = useState('');

  const fetchCall = useCallback(async () => {
    if (!callId) { setError('No call ID.'); setPolling(false); return; }
    try {
      const data = await discoveryApi.findOne(callId);
      setCall(data);
      if (data.aiSummary) setPolling(false);
    } catch { setError('Could not load call.'); setPolling(false); }
  }, [callId]);

  useEffect(() => {
    fetchCall();
    discoveryApi.getPackages().then(setPackages).catch(() => {});
    const interval = setInterval(() => { if (polling) fetchCall(); }, 3000);
    return () => clearInterval(interval);
  }, [fetchCall, polling]);

  async function handleSubmitNotes() {
    if (!callId || !notes.trim()) return;
    setSubmittingNotes(true);
    try {
      await discoveryApi.addNotes(callId, notes);
      setPolling(true);
    } catch { setError('Failed to submit notes.'); }
    setSubmittingNotes(false);
  }

  if (error) return <div className={styles.page}><div className={styles.errorBox}><span>⚠</span> {error}</div></div>;
  if (!call) return <div className={styles.page}><div className={styles.loadingCard}><div className={styles.spinner} /><h2>Loading…</h2></div></div>;

  const recommended = packages.filter((p) => call.recommendedPkgs?.includes(p.type));

  return (
    <div className={styles.page} id="discovery-summary">
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Discovery Summary</h1>
          <p className={styles.subtitle}>
            Scheduled: {new Date(call.scheduledAt).toLocaleString()} · <span className={`badge ${STATUS_BADGE[call.status] || ''}`}>{call.status}</span>
          </p>
        </div>
        {call.meetingLink && <a href={call.meetingLink} target="_blank" rel="noreferrer" className="btn btn-primary" id="join-meeting-btn">Join Meeting →</a>}
      </div>

      {/* Notes input (if no notes yet) */}
      {!call.notes && call.status !== 'CANCELLED' && (
        <div className="card" style={{ flexDirection: 'column', gap: 'var(--space-4)' }}>
          <h2 className={styles.sectionTitle}>Capture Meeting Notes</h2>
          <textarea id="discovery-notes" rows={6} className={styles.textarea} value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter your structured discovery notes here. The AI will generate a summary and package recommendation from these notes…" />
          <button className="btn btn-primary" disabled={!notes.trim() || submittingNotes} onClick={handleSubmitNotes} id="submit-notes-btn">
            {submittingNotes ? 'Submitting…' : 'Submit Notes & Generate Summary'}
          </button>
        </div>
      )}

      {/* AI Summary */}
      {call.notes && !call.aiSummary && polling && (
        <div className={styles.loadingCard}>
          <div className={styles.spinner} />
          <h2>Generating AI Summary…</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>Analyzing notes and generating package recommendation.</p>
        </div>
      )}

      {(call.aiSummary || call.overrideSummary) && (
        <div className="card" style={{ flexDirection: 'column', gap: 'var(--space-4)' }}>
          <h2 className={styles.sectionTitle}>AI-Generated Summary</h2>
          {call.adminOverride && <div className={styles.overrideBadge}>⚙ Summary overridden by Platform Admin</div>}
          <div className={styles.summaryBox}>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: 1.8, fontSize: '0.9375rem' }}>
              {call.overrideSummary || call.aiSummary}
            </pre>
          </div>
        </div>
      )}

      {/* Package Recommendation */}
      {call.aiRecommendation && (
        <div className="card" style={{ flexDirection: 'column', gap: 'var(--space-4)' }}>
          <h2 className={styles.sectionTitle}>Recommended Package</h2>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, fontSize: '0.9375rem' }}>{call.aiRecommendation}</p>
          {recommended.length > 0 && (
            <div className={styles.pkgGrid}>
              {recommended.map((pkg) => (
                <div key={pkg.id} className={styles.pkgCard}>
                  <span className={styles.pkgIcon}>{PKG_ICON[pkg.type] || '📦'}</span>
                  <h3 className={styles.pkgName}>{pkg.name}</h3>
                  <p className={styles.pkgDesc}>{pkg.description}</p>
                  <div className={styles.pkgMeta}>
                    <span>{pkg.durationWeeks} weeks</span>
                    <span>{pkg.weeklyHours} hrs/wk</span>
                    <span className={styles.pkgPrice}>${pkg.priceUsd.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CTA */}
      {call.aiRecommendation && (
        <div className={styles.ctaCard}>
          <h3>Ready for matching?</h3>
          <p>Based on your discovery call, we can now generate an operator shortlist for you.</p>
          <Link href="/startup/matching" className="btn btn-primary" id="proceed-matching-cta">Proceed to Matching →</Link>
        </div>
      )}
    </div>
  );
}

export default function DiscoverySummaryPage() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <SummaryContent />
      </ProtectedLayout>
    </AuthProvider>
  );
}
