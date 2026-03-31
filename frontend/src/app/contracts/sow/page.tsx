'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { contractsApi, StatementOfWork } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import styles from './page.module.css';

const STATUS_BADGE: Record<string, string> = { DRAFT: '', REVIEW: 'badge-amber', APPROVED: 'badge-teal', SIGNED: 'badge-violet', LOCKED: '' };

function SowEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sowId = searchParams.get('id');
  const { user } = useAuth();

  const [sow, setSow] = useState<StatementOfWork | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Editor State
  const [title, setTitle] = useState('');
  const [scope, setScope] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [timeline, setTimeline] = useState('');
  const [weeklyHours, setWeeklyHours] = useState('');
  const [totalPriceUsd, setTotalPriceUsd] = useState('');
  const [changeNote, setChangeNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!sowId) { setError('SoW ID required.'); setLoading(false); return; }
    contractsApi.findOneSow(sowId)
      .then((data) => {
        setSow(data);
        setTitle(data.title);
        setScope(data.scope);
        setDeliverables(data.deliverables);
        setTimeline(data.timeline);
        setWeeklyHours(data.weeklyHours.toString());
        setTotalPriceUsd(data.totalPriceUsd.toString());
      })
      .catch(() => setError('Failed to load SoW.'))
      .finally(() => setLoading(false));
  }, [sowId]);

  const canEdit = sow && (sow.status === 'DRAFT' || sow.status === 'REVIEW') && (user?.role === 'PLATFORM_ADMIN' || user?.role === 'OPERATOR');
  // Startup cannot edit, only view and approve. Admin/Operator can edit DRAFT.

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!sowId || !canEdit) return;
    setSaving(true);
    try {
      const updated = await contractsApi.editSow(sowId, {
        title, scope, deliverables, timeline,
        weeklyHours: parseInt(weeklyHours, 10),
        totalPriceUsd: parseInt(totalPriceUsd, 10),
        changeNote: changeNote || 'Updated SoW fields',
      });
      setSow({ ...sow, ...updated });
      setChangeNote('');
      alert('Changes saved as a new version.');
    } catch {
      setError('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmitReview() {
    if (!sowId) return;
    try {
      const updated = await contractsApi.submitForReview(sowId);
      setSow({ ...sow, status: updated.status } as StatementOfWork);
    } catch { setError('Failed to submit for review.'); }
  }

  async function handleApprove() {
    if (!sowId) return;
    try {
      const updated = await contractsApi.approveSow(sowId);
      setSow({ ...sow, status: updated.status } as StatementOfWork);
      alert('SoW Approved! Contract generated.');
      router.push(`/startup/contracts`); // Startup approves then goes to contracts
    } catch { setError('Failed to approve SoW.'); }
  }

  if (loading) return <div className={styles.page}><p className={styles.loading}>Loading SoW…</p></div>;
  if (error) return <div className={styles.page}><div className={styles.errorBox}><span>⚠</span> {error}</div></div>;
  if (!sow) return null;

  return (
    <div className={styles.page} id="sow-editor">
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Statement of Work: {sow.title}</h1>
          <p className={styles.meta}>
            Version {sow.currentVersion} · <span className={`badge ${STATUS_BADGE[sow.status] || ''}`}>{sow.status}</span>
          </p>
        </div>
        <div className={styles.actions}>
          {sow.status === 'DRAFT' && canEdit && (
            <button className="btn btn-secondary" onClick={handleSubmitReview} id="btn-submit-review">Submit for Review</button>
          )}
          {sow.status === 'REVIEW' && (user?.role === 'STARTUP_ADMIN' || user?.role === 'PLATFORM_ADMIN') && (
            <button className="btn btn-primary" onClick={handleApprove} id="btn-approve-sow">Approve & Generate Contract</button>
          )}
          {sow.status === 'APPROVED' && (
            <button className="btn btn-primary" onClick={() => router.push(user?.role === 'STARTUP_ADMIN' ? '/startup/contracts' : '/operator/contracts')} id="btn-view-contract">View Contract Details</button>
          )}
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.main}>
          <form onSubmit={handleSave} className={styles.formContainer}>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label>Total Price (USD)</label>
                <div className={styles.inputPrefix}>
                  <span>$</span>
                  <input type="number" value={totalPriceUsd} onChange={(e) => setTotalPriceUsd(e.target.value)} disabled={!canEdit} required />
                </div>
              </div>
              <div className={styles.field}>
                <label>Weekly Hours</label>
                <input type="number" value={weeklyHours} onChange={(e) => setWeeklyHours(e.target.value)} disabled={!canEdit} required />
              </div>
            </div>

            <div className={styles.field}>
              <label>Scope of Work</label>
              <textarea rows={4} value={scope} onChange={(e) => setScope(e.target.value)} disabled={!canEdit} required />
            </div>

            <div className={styles.field}>
              <label>Deliverables</label>
              <textarea rows={6} value={deliverables} onChange={(e) => setDeliverables(e.target.value)} disabled={!canEdit} required />
            </div>

            <div className={styles.field}>
              <label>Timeline</label>
              <input type="text" value={timeline} onChange={(e) => setTimeline(e.target.value)} disabled={!canEdit} required />
            </div>

            {canEdit && (
              <div className={styles.saveBlock}>
                <input type="text" placeholder="Note about changes (optional)" value={changeNote} onChange={(e) => setChangeNote(e.target.value)} className={styles.noteInput} />
                <button type="submit" className="btn btn-primary" disabled={saving} id="btn-save-sow">{saving ? 'Saving…' : 'Save New Version'}</button>
              </div>
            )}
          </form>

          <div className={styles.clausesBlock}>
            <h3>Standard Clauses</h3>
            <p className={styles.clauseItem}><strong>Non-Circumvention:</strong> This contract operates under the Antigravity Master Services Agreement. Parties agree not to transact directly outside the platform.</p>
            <p className={styles.clauseItem}><strong>Payment Terms:</strong> Escrow-backed weekly/monthly milestones as per platform standard terms.</p>
          </div>
        </div>

        <div className={styles.sidebar}>
          <h3>Version History</h3>
          <div className={styles.versionList}>
            {sow.versions?.map((v) => (
              <div key={v.id} className={styles.versionItem}>
                <span className={styles.vBadge}>v{v.version}</span>
                <div className={styles.vInfo}>
                  <p className={styles.vNote}>{v.changeNote || 'No change note'}</p>
                  <p className={styles.vDate}>{new Date(v.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SowEditorPage() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <SowEditorContent />
      </ProtectedLayout>
    </AuthProvider>
  );
}
