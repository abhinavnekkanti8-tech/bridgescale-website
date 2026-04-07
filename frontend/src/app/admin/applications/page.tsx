'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

// ── Types ──────────────────────────────────────────────────────────────────

interface Reference {
  name: string;
  company?: string;
  relationship: string;
  email: string;
  phone?: string;
}

interface Application {
  id: string;
  type: 'COMPANY' | 'TALENT';
  status: string;
  name: string;
  email: string;
  notes?: string;
  // Company fields
  companyName?: string;
  companyStage?: string;
  needArea?: string;
  targetMarkets?: string;
  engagementModel?: string;
  budgetRange?: string;
  urgency?: string;
  // Talent fields
  location?: string;
  talentCategory?: string;
  seniority?: string;
  engagementPref?: string;
  markets?: string;
  linkedInUrl?: string;
  references?: Reference[];
  cvFileName?: string;
  cvFileUrl?: string;
  // Payment
  feeAmountUsd: number;
  paidAt?: string;
  createdAt: string;
}

// ── Badge helpers ──────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
  SUBMITTED: 'badge-violet',
  UNDER_REVIEW: 'badge-amber',
  APPROVED: 'badge-teal',
  REJECTED: '',
  PENDING_PAYMENT: '',
};

const TYPE_BADGE: Record<string, string> = {
  COMPANY: 'badge-amber',
  TALENT: 'badge-violet',
};

// ── Main content ──────────────────────────────────────────────────────────

function AdminApplicationsContent() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'COMPANY' | 'TALENT'>('ALL');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const loadApplications = useCallback(() => {
    setLoading(true);
    apiFetch<Application[]>('/applications')
      .then(setApplications)
      .catch(() => setError('Could not load applications.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadApplications(); }, [loadApplications]);

  async function handleStatusChange(id: string, newStatus: string) {
    setActioningId(id);
    try {
      const updated = await apiFetch<Application>(`/applications/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setApplications((apps) => apps.map((a) => (a.id === id ? { ...a, ...updated } : a)));
      if (selectedApp?.id === id) setSelectedApp({ ...selectedApp, ...updated });
      setError('');
    } catch {
      setError('Status update failed.');
    }
    setActioningId(null);
  }

  async function handleScheduleInterview(id: string) {
    const scheduledAt = window.prompt(
      'Interview date/time (ISO 8601, e.g. 2026-04-15T10:00:00Z)',
    );
    if (!scheduledAt) return;
    const location = window.prompt('Location or meeting link (optional)') || undefined;
    setActioningId(id);
    try {
      const updated = await apiFetch<Application>(
        `/applications/${id}/schedule-interview`,
        {
          method: 'POST',
          body: JSON.stringify({ scheduledAt, location }),
        },
      );
      setApplications((apps) =>
        apps.map((a) => (a.id === id ? { ...a, ...updated } : a)),
      );
      if (selectedApp?.id === id) setSelectedApp({ ...selectedApp, ...updated });
      setError('');
    } catch {
      setError('Failed to schedule interview.');
    }
    setActioningId(null);
  }

  async function handleApprove(id: string) {
    if (!window.confirm('Approve this applicant? They will be activated immediately.')) {
      return;
    }
    const reason = window.prompt('Approval note (optional)') || undefined;
    setActioningId(id);
    try {
      const updated = await apiFetch<Application>(`/applications/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      setApplications((apps) =>
        apps.map((a) => (a.id === id ? { ...a, ...updated } : a)),
      );
      if (selectedApp?.id === id) setSelectedApp({ ...selectedApp, ...updated });
      setError('');
    } catch {
      setError('Approval failed.');
    }
    setActioningId(null);
  }

  async function handleReject(id: string) {
    const reason = window.prompt('Rejection reason (required)');
    if (!reason) return;
    setActioningId(id);
    try {
      const updated = await apiFetch<Application>(`/applications/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      setApplications((apps) =>
        apps.map((a) => (a.id === id ? { ...a, ...updated } : a)),
      );
      if (selectedApp?.id === id) setSelectedApp({ ...selectedApp, ...updated });
      setError('');
    } catch {
      setError('Rejection failed.');
    }
    setActioningId(null);
  }

  // ── Filtering ──
  const filtered = applications.filter((a) => {
    if (typeFilter !== 'ALL' && a.type !== typeFilter) return false;
    if (statusFilter && a.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || (a.companyName?.toLowerCase().includes(q) ?? false);
    }
    return true;
  });

  // ── Stats ──
  const total = applications.length;
  const companies = applications.filter((a) => a.type === 'COMPANY').length;
  const talent = applications.filter((a) => a.type === 'TALENT').length;
  const pending = applications.filter((a) => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW').length;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Applications</h1>
          <p className={styles.subtitle}>Review early-access applications from companies and talent</p>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsBar}>
        <div className={styles.statChip}>
          <span>Total</span>
          <span className={styles.statNum}>{total}</span>
        </div>
        <div className={styles.statChip}>
          <span>🏢 Companies</span>
          <span className={styles.statNum} style={{ color: 'var(--color-accent-amber)' }}>{companies}</span>
        </div>
        <div className={styles.statChip}>
          <span>🌏 Talent</span>
          <span className={styles.statNum} style={{ color: 'var(--color-accent-violet)' }}>{talent}</span>
        </div>
        <div className={styles.statChip}>
          <span>⏳ Pending</span>
          <span className={styles.statNum} style={{ color: 'var(--color-accent-teal)' }}>{pending}</span>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filterRow}>
        <div className={styles.tabs}>
          {(['ALL', 'COMPANY', 'TALENT'] as const).map((t) => (
            <button
              key={t}
              className={`${styles.tab} ${typeFilter === t ? styles.tabActive : ''}`}
              onClick={() => setTypeFilter(t)}
              type="button"
              id={`filter-${t.toLowerCase()}`}
            >
              {t === 'ALL' ? 'All' : t === 'COMPANY' ? '🏢 Companies' : '🌏 Talent'}
            </button>
          ))}
        </div>
        <select
          className={styles.statusFilter}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          id="status-filter"
        >
          <option value="">All statuses</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <input
          id="search-applications"
          type="search"
          className={styles.search}
          placeholder="Search by name, email, or company…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div className={styles.errorBox}><span>⚠</span> {error}</div>}

      {/* Table */}
      {loading ? (
        <div className={styles.loading}>Loading applications…</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>No applications found.</div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHead}>
            <span>Applicant</span>
            <span>Details</span>
            <span>Type</span>
            <span>Status</span>
            <span>Fee</span>
            <span>Date</span>
            <span>Actions</span>
          </div>
          {filtered.map((app) => (
            <div
              key={app.id}
              className={styles.tableRow}
              id={`app-row-${app.id}`}
              onClick={() => setSelectedApp(app)}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.nameCell}>
                <span className={styles.nameText}>{app.name}</span>
                <span className={styles.emailText}>{app.email}</span>
              </div>
              <div className={styles.detailCell}>
                {app.type === 'COMPANY' ? (
                  <>
                    {app.companyName && <span>{app.companyName}</span>}
                    {app.needArea && <span style={{ fontSize: '0.75rem' }}>{app.needArea}</span>}
                  </>
                ) : (
                  <>
                    {app.talentCategory && <span>{app.talentCategory}</span>}
                    {app.location && <span style={{ fontSize: '0.75rem' }}>📍 {app.location}</span>}
                  </>
                )}
                {app.cvFileName && <span className={styles.cvLink}>📄 CV</span>}
                {app.references && Array.isArray(app.references) && app.references.length > 0 && (
                  <span className={styles.refCount}>{app.references.length} refs</span>
                )}
              </div>
              <span className={`badge ${TYPE_BADGE[app.type] || ''}`}>{app.type}</span>
              <span className={`badge ${STATUS_BADGE[app.status] || ''}`}>{app.status.replace(/_/g, ' ')}</span>
              <span className={styles.fee}>${app.feeAmountUsd}</span>
              <span className={styles.date}>{new Date(app.createdAt).toLocaleDateString()}</span>
              <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
                {(app.status === 'SUBMITTED' || app.status === 'UNDER_REVIEW') && (
                  <>
                    <button
                      className="btn btn-primary"
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                      disabled={actioningId === app.id}
                      onClick={() => handleStatusChange(app.id, 'APPROVED')}
                      id={`approve-${app.id}`}
                    >
                      ✓ Approve
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                      disabled={actioningId === app.id}
                      onClick={() => handleStatusChange(app.id, 'REJECTED')}
                      id={`reject-${app.id}`}
                    >
                      ✗ Reject
                    </button>
                  </>
                )}
                {app.status === 'SUBMITTED' && (
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                    disabled={actioningId === app.id}
                    onClick={() => handleStatusChange(app.id, 'UNDER_REVIEW')}
                    id={`review-${app.id}`}
                  >
                    📋 Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Detail Drawer ── */}
      {selectedApp && (
        <>
          <div className={styles.overlay} onClick={() => setSelectedApp(null)} />
          <div className={styles.drawer}>
            <div className={styles.drawerHeader}>
              <div>
                <div className={styles.drawerTitle}>{selectedApp.name}</div>
                <div className={styles.drawerSub}>{selectedApp.email} · <span className={`badge ${TYPE_BADGE[selectedApp.type]}`}>{selectedApp.type}</span></div>
              </div>
              <button className={styles.drawerClose} onClick={() => setSelectedApp(null)} id="close-drawer">×</button>
            </div>

            {/* Status */}
            <div className={styles.drawerSection}>
              <div className={styles.drawerLabel}>Status</div>
              <span className={`badge ${STATUS_BADGE[selectedApp.status]}`} style={{ fontSize: '0.875rem', padding: '0.35rem 1rem' }}>
                {selectedApp.status.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Company details */}
            {selectedApp.type === 'COMPANY' && (
              <div className={styles.drawerSection}>
                <div className={styles.drawerLabel}>Company Details</div>
                <div className={styles.drawerGrid}>
                  {selectedApp.companyName && <div className={styles.drawerField}><span className={styles.drawerFieldLabel}>Company</span><span className={styles.drawerFieldValue}>{selectedApp.companyName}</span></div>}
                  {selectedApp.companyStage && <div className={styles.drawerField}><span className={styles.drawerFieldLabel}>Stage</span><span className={styles.drawerFieldValue}>{selectedApp.companyStage}</span></div>}
                  {selectedApp.needArea && <div className={styles.drawerField}><span className={styles.drawerFieldLabel}>Need Area</span><span className={styles.drawerFieldValue}>{selectedApp.needArea}</span></div>}
                  {selectedApp.targetMarkets && <div className={styles.drawerField}><span className={styles.drawerFieldLabel}>Target Markets</span><span className={styles.drawerFieldValue}>{selectedApp.targetMarkets}</span></div>}
                  {selectedApp.engagementModel && <div className={styles.drawerField}><span className={styles.drawerFieldLabel}>Engagement</span><span className={styles.drawerFieldValue}>{selectedApp.engagementModel}</span></div>}
                  {selectedApp.budgetRange && <div className={styles.drawerField}><span className={styles.drawerFieldLabel}>Budget</span><span className={styles.drawerFieldValue}>{selectedApp.budgetRange}</span></div>}
                  {selectedApp.urgency && <div className={styles.drawerField}><span className={styles.drawerFieldLabel}>Urgency</span><span className={styles.drawerFieldValue}>{selectedApp.urgency}</span></div>}
                </div>
              </div>
            )}

            {/* Talent details */}
            {selectedApp.type === 'TALENT' && (
              <div className={styles.drawerSection}>
                <div className={styles.drawerLabel}>Talent Profile</div>
                <div className={styles.drawerGrid}>
                  {selectedApp.talentCategory && <div className={styles.drawerField}><span className={styles.drawerFieldLabel}>Category</span><span className={styles.drawerFieldValue}>{selectedApp.talentCategory}</span></div>}
                  {selectedApp.seniority && <div className={styles.drawerField}><span className={styles.drawerFieldLabel}>Seniority</span><span className={styles.drawerFieldValue}>{selectedApp.seniority}</span></div>}
                  {selectedApp.location && <div className={styles.drawerField}><span className={styles.drawerFieldLabel}>Location</span><span className={styles.drawerFieldValue}>{selectedApp.location}</span></div>}
                  {selectedApp.markets && <div className={styles.drawerField}><span className={styles.drawerFieldLabel}>Markets</span><span className={styles.drawerFieldValue}>{selectedApp.markets}</span></div>}
                  {selectedApp.engagementPref && <div className={styles.drawerField}><span className={styles.drawerFieldLabel}>Engagement Pref</span><span className={styles.drawerFieldValue}>{selectedApp.engagementPref}</span></div>}
                  {selectedApp.linkedInUrl && <div className={styles.drawerField}><span className={styles.drawerFieldLabel}>LinkedIn</span><a href={selectedApp.linkedInUrl} target="_blank" rel="noopener noreferrer" className={styles.drawerFieldValue} style={{ color: 'var(--color-accent-violet)' }}>{selectedApp.linkedInUrl}</a></div>}
                </div>
              </div>
            )}

            {/* CV */}
            {selectedApp.cvFileName && (
              <div className={styles.drawerSection}>
                <div className={styles.drawerLabel}>CV / Resume</div>
                <a href={`${API_URL}${selectedApp.cvFileUrl}`} target="_blank" rel="noopener noreferrer" className={styles.cvLink} style={{ fontSize: '0.9375rem' }}>
                  📄 {selectedApp.cvFileName}
                </a>
              </div>
            )}

            {/* References */}
            {selectedApp.references && Array.isArray(selectedApp.references) && selectedApp.references.length > 0 && (
              <div className={styles.drawerSection}>
                <div className={styles.drawerLabel}>References ({selectedApp.references.length})</div>
                {selectedApp.references.map((ref: Reference, i: number) => (
                  <div key={i} className={styles.refCard}>
                    <div className={styles.refName}>{ref.name}</div>
                    {ref.company && <div className={styles.refDetail}>{ref.company}</div>}
                    <div className={styles.refDetail}>{ref.relationship}</div>
                    <div className={styles.refDetail}>✉ {ref.email}{ref.phone ? ` · ☎ ${ref.phone}` : ''}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Notes */}
            {selectedApp.notes && (
              <div className={styles.drawerSection}>
                <div className={styles.drawerLabel}>Notes</div>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>{selectedApp.notes}</p>
              </div>
            )}

            {/* Review link (diagnosis for COMPANY, pre-screen for TALENT) */}
            <div className={styles.drawerSection}>
              <div className={styles.drawerLabel}>Review</div>
              {selectedApp.type === 'COMPANY' ? (
                <Link
                  href={`/admin/applications/${selectedApp.id}/diagnosis`}
                  className="btn btn-secondary"
                  id="drawer-open-diagnosis"
                  style={{ textDecoration: 'none', display: 'inline-block' }}
                >
                  🩺 Open Diagnosis
                </Link>
              ) : (
                <Link
                  href={`/admin/applications/${selectedApp.id}/prescreen`}
                  className="btn btn-secondary"
                  id="drawer-open-prescreen"
                  style={{ textDecoration: 'none', display: 'inline-block' }}
                >
                  🔍 Open Pre-Screen
                </Link>
              )}
            </div>

            {/* Actions */}
            <div className={styles.drawerActions}>
              {selectedApp.status === 'SUBMITTED' && (
                <button
                  className="btn btn-secondary"
                  disabled={actioningId === selectedApp.id}
                  onClick={() => handleStatusChange(selectedApp.id, 'UNDER_REVIEW')}
                  id="drawer-review"
                >
                  📋 Mark Under Review
                </button>
              )}
              {(selectedApp.status === 'SUBMITTED' || selectedApp.status === 'UNDER_REVIEW') && (
                <button
                  className="btn btn-secondary"
                  disabled={actioningId === selectedApp.id}
                  onClick={() => handleScheduleInterview(selectedApp.id)}
                  id="drawer-schedule-interview"
                >
                  📅 Schedule Interview
                </button>
              )}
              {selectedApp.status !== 'APPROVED' && selectedApp.status !== 'REJECTED' && (
                <>
                  <button
                    className="btn btn-primary"
                    disabled={actioningId === selectedApp.id}
                    onClick={() => handleApprove(selectedApp.id)}
                    id="drawer-approve"
                  >
                    ✓ Approve
                  </button>
                  <button
                    className="btn btn-secondary"
                    disabled={actioningId === selectedApp.id}
                    onClick={() => handleReject(selectedApp.id)}
                    id="drawer-reject"
                  >
                    ✗ Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminApplicationsPage() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <AdminApplicationsContent />
      </ProtectedLayout>
    </AuthProvider>
  );
}
