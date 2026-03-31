'use client';

import { useEffect, useState, FormEvent } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { paymentsApi, Invoice, PaymentPlan } from '@/lib/api-client';
import styles from './page.module.css';

const STATUS_BADGE: Record<string, string> = { DRAFT: 'badge-amber', ISSUED: 'badge-teal', PAID: 'badge-violet', OVERDUE: '', CANCELLED: '' };

function AdminBillingContent() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Issue Invoice Modal State
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [newPlanId, setNewPlanId] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [issuing, setIssuing] = useState(false);

  // Status Action State
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchInvoices = () => {
    paymentsApi.getAllInvoices()
      .then(setInvoices)
      .catch(() => setError('Could not load invoices.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchInvoices(); }, []);

  async function handleIssueFormSubmit(e: FormEvent) {
    e.preventDefault();
    setIssuing(true);
    try {
      await paymentsApi.issueInvoice({
        paymentPlanId: newPlanId,
        amountUsd: parseInt(newAmount, 10),
        description: newDesc,
        dueDate: newDueDate,
      });
      setShowIssueModal(false);
      setNewPlanId(''); setNewAmount(''); setNewDesc(''); setNewDueDate('');
      fetchInvoices();
    } catch {
      alert('Failed to issue invoice.');
    } finally {
      setIssuing(false);
    }
  }

  async function handleStatusChange(invoiceId: string, action: 'pay' | 'overdue') {
    if (!confirm(`Are you sure you want to mark this invoice as ${action.toUpperCase()}?`)) return;
    setActioningId(invoiceId);
    try {
      if (action === 'pay') {
        await paymentsApi.markInvoicePaid(invoiceId);
      } else {
        await paymentsApi.markInvoiceOverdue(invoiceId);
      }
      fetchInvoices();
    } catch {
      alert(`Failed to mark as ${action}.`);
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Platform Billing & Invoicing</h1>
          <p className={styles.subtitle}>{invoices.length} total invoices in system</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowIssueModal(true)}>+ Issue New Invoice</button>
      </div>

      {error && <div className={styles.errorBox}><span>⚠</span> {error}</div>}

      {showIssueModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Issue Invoice</h2>
            <form onSubmit={handleIssueFormSubmit} className={styles.modalForm}>
              <div className={styles.field}>
                <label>Payment Plan ID</label>
                <input type="text" value={newPlanId} onChange={(e) => setNewPlanId(e.target.value)} required placeholder="plan_xyz..." />
                <span className={styles.fieldHelp}>Find this on the contract details page.</span>
              </div>
              <div className={styles.field}>
                <label>Amount (USD)</label>
                <input type="number" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} required min={100} />
              </div>
              <div className={styles.field}>
                <label>Description</label>
                <input type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} required placeholder="e.g. Month 1 Retainer Fee" />
              </div>
              <div className={styles.field}>
                <label>Due Date</label>
                <input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} required />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowIssueModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={issuing}>{issuing ? 'Issuing...' : 'Issue Invoice'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>Loading…</div>
      ) : invoices.length === 0 ? (
        <div className={styles.empty}>No invoices have been issued yet.</div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHead}>
            <span>Description</span>
            <span>Amount</span>
            <span>Due Date</span>
            <span>Status</span>
            <span>Admin Actions</span>
          </div>
          {invoices.map((inv) => {
            const isOverdue = inv.status === 'OVERDUE' || (inv.status === 'ISSUED' && new Date(inv.dueDate) < new Date());
            return (
              <div key={inv.id} className={`${styles.tableRow} ${isOverdue ? styles.rowOverdue : ''}`}>
                <div>
                  <p className={styles.primaryTitle}>{inv.description}</p>
                  <p className={styles.subtext}>Plan: {inv.paymentPlanId.slice(0, 8)}...</p>
                </div>
                <span className={styles.valueText}>${inv.amountUsd.toLocaleString()}</span>
                
                <span className={isOverdue && inv.status !== 'PAID' ? styles.warningText : ''}>
                  {new Date(inv.dueDate).toLocaleDateString()}
                </span>
                
                <span className={`badge ${STATUS_BADGE[isOverdue && inv.status !== 'PAID' ? 'OVERDUE' : inv.status] || ''}`}>
                  {isOverdue && inv.status !== 'PAID' ? 'OVERDUE' : inv.status}
                </span>
                
                <div className={styles.actionRow}>
                  {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                    <>
                      <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        onClick={() => handleStatusChange(inv.id, 'pay')} disabled={actioningId === inv.id}>
                        Mark Paid
                      </button>
                      <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        onClick={() => handleStatusChange(inv.id, 'overdue')} disabled={actioningId === inv.id || inv.status === 'OVERDUE'}>
                        Mark Overdue
                      </button>
                    </>
                  )}
                  {inv.status === 'PAID' && <span className={styles.successText}>✓ Paid on {new Date(inv.paidAt!).toLocaleDateString()}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminBillingPage() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <AdminBillingContent />
      </ProtectedLayout>
    </AuthProvider>
  );
}
