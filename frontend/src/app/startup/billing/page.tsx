'use client';

import { useEffect, useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { paymentsApi, Invoice } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import styles from './page.module.css';

const STATUS_BADGE: Record<string, string> = { DRAFT: 'badge-amber', ISSUED: 'badge-teal', PAID: 'badge-violet', OVERDUE: '', CANCELLED: '' };

function StartupBillingContent() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.organizationId) {
      paymentsApi.getStartupInvoices(user.organizationId)
        .then(setInvoices)
        .catch(() => setError('Could not load invoices.'))
        .finally(() => setLoading(false));
    }
  }, [user]);

  function handlePay(url?: string) {
    if (!url) return alert('No payment link available.');
    // In production, opens Stripe Checkout
    alert('Mock Stripe Checkout opened.\nURL: ' + url + '\n\n(In full implementation, this processes via webhook.)');
  }

  return (
    <div className={styles.page} id="startup-billing">
      <div className={styles.header}>
        <h1 className={styles.title}>Billing & Invoices</h1>
        <p className={styles.subtitle}>Manage platform payments and view invoice history.</p>
      </div>

      {error && <div className={styles.errorBox}><span>⚠</span> {error}</div>}

      {loading ? (
        <p className={styles.loading}>Loading…</p>
      ) : invoices.length === 0 ? (
        <div className={styles.emptyCard}>
          <span style={{ fontSize: '3rem' }}>💳</span>
          <h2>No invoices yet</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>Invoices will appear here once engagements are active.</p>
        </div>
      ) : (
        <div className={styles.invoiceList}>
          {invoices.map((inv) => {
            const isOverdue = inv.status === 'OVERDUE' || (inv.status === 'ISSUED' && new Date(inv.dueDate) < new Date());
            return (
              <div key={inv.id} className={`${styles.invoiceCard} ${isOverdue ? styles.overdue : ''}`} id={`invoice-${inv.id}`}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.invoiceTitle}>{inv.description}</h3>
                    <p className={styles.subtext}>For: {inv.paymentPlan?.contract?.sow.title || 'Engagement'}</p>
                  </div>
                  <div className={styles.amountBlock}>
                    <span className={styles.amount}>${inv.amountUsd.toLocaleString()}</span>
                    <span className={`badge ${STATUS_BADGE[isOverdue && inv.status !== 'PAID' ? 'OVERDUE' : inv.status] || ''}`}>
                      {isOverdue && inv.status !== 'PAID' ? 'OVERDUE' : inv.status}
                    </span>
                  </div>
                </div>

                <div className={styles.detailsRow}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Issued</span>
                    <span className={styles.detailValue}>{inv.issuedAt ? new Date(inv.issuedAt).toLocaleDateString() : '—'}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Due Date</span>
                    <span className={`${styles.detailValue} ${isOverdue && inv.status !== 'PAID' ? styles.warningText : ''}`}>
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Paid</span>
                    <span className={styles.detailValue}>{inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : '—'}</span>
                  </div>

                  <div className={styles.actionCol}>
                    {inv.status === 'ISSUED' || inv.status === 'OVERDUE' ? (
                      <button className="btn btn-primary" onClick={() => handlePay(inv.stripeUrl)} id={`pay-${inv.id}`}>
                        Pay Now
                      </button>
                    ) : inv.status === 'PAID' ? (
                      <button className="btn btn-secondary" onClick={() => alert('Receipt downloaded (mock)')}>
                        Download Receipt
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function StartupBillingPage() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <StartupBillingContent />
      </ProtectedLayout>
    </AuthProvider>
  );
}
