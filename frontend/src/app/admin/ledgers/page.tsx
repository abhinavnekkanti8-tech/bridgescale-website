'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import QueueShell, { QueueColumn } from '@/components/admin/QueueShell';
import qs from '@/components/admin/QueueShell.module.css';
import { adminOpsApi, AdminPaymentLedgerRow } from '@/lib/api-client';

const columns: QueueColumn<AdminPaymentLedgerRow>[] = [
  {
    key: 'sow',
    label: 'SOW',
    render: (r) => (
      <div>
        <div>{r.contract?.sow?.title ?? '—'}</div>
        <div style={{ fontSize: 12, color: '#888' }}>contract #{r.contractId.slice(0, 6)}</div>
      </div>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    render: (r) => {
      const cls =
        r.status === 'READY_FOR_PAYOUT' ? `${qs.pill} ${qs.pill_done}` :
        r.status === 'APPROVED' ? `${qs.pill} ${qs.pill_done}` :
        r.status === 'REVIEWED' ? `${qs.pill} ${qs.pill_partial}` :
        r.status === 'BLOCKED' ? `${qs.pill} ${qs.pill_pending}` :
        qs.pill;
      return <span className={cls}>{r.status.replace(/_/g, ' ')}</span>;
    },
  },
  {
    key: 'amount',
    label: 'Total',
    render: (r) => r.totalAmountCents != null
      ? `${r.currency ?? ''} ${(r.totalAmountCents / 100).toLocaleString()}`
      : '—',
  },
  {
    key: 'attempts',
    label: 'Payout attempts',
    render: (r) => r.payoutAttempts && r.payoutAttempts.length > 0
      ? <div style={{ fontSize: 12 }}>{r.payoutAttempts.map((a) => `${a.provider}:${a.status}`).join(' · ')}</div>
      : <span style={{ color: '#888' }}>none</span>,
  },
  {
    key: 'updated',
    label: 'Updated',
    render: (r) => new Date(r.updatedAt).toLocaleDateString(),
  },
];

const filters = [
  { label: 'All', value: undefined },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Reviewed', value: 'REVIEWED' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Ready for payout', value: 'READY_FOR_PAYOUT' },
  { label: 'Blocked', value: 'BLOCKED' },
];

function LedgerQueue() {
  return (
    <QueueShell
      title="Payment ledgers"
      subtitle="Per-contract payment ledgers, including payout attempts. Use to spot ledgers stuck in DRAFT or BLOCKED."
      columns={columns}
      filters={filters}
      load={(s) => adminOpsApi.paymentLedgers(s)}
      rowKey={(r) => r.id}
      emptyMessage="No ledgers match this filter."
    />
  );
}

export default function AdminLedgersPage() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <LedgerQueue />
      </ProtectedLayout>
    </AuthProvider>
  );
}
