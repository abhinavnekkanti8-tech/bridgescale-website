'use client';

import Link from 'next/link';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import QueueShell, { QueueColumn } from '@/components/admin/QueueShell';
import qs from '@/components/admin/QueueShell.module.css';
import { adminOpsApi, AdminPreSowRow, PreSowSummaryStatus } from '@/lib/api-client';

const columns: QueueColumn<AdminPreSowRow>[] = [
  {
    key: 'pair',
    label: 'Company / Operator',
    render: (r) => (
      <div>
        <div>{r.startup?.industry ?? '—'} <span style={{ color: '#888', fontSize: 12 }}>#{r.startupProfileId.slice(0, 6)}</span></div>
        <div style={{ fontSize: 12, color: '#888' }}>op #{r.operatorId.slice(0, 6)}</div>
      </div>
    ),
  },
  {
    key: 'shape',
    label: 'Engagement shape',
    render: (r) => (
      <div>
        <div>{r.engagementType}{r.retainerFlavour ? ` · ${r.retainerFlavour}` : ''}</div>
        <div style={{ fontSize: 12, color: '#888' }}>{r.serviceTemplate}</div>
      </div>
    ),
  },
  {
    key: 'price',
    label: 'Price',
    render: (r) => r.indicativePrice ? `${r.currency} ${r.indicativePrice.toLocaleString()}` : '—',
  },
  {
    key: 'comp',
    label: 'Comp',
    render: (r) => r.compensationMode,
  },
  {
    key: 'status',
    label: 'Status',
    render: (r) => {
      const cls =
        r.status === 'CONFIRMED' ? `${qs.pill} ${qs.pill_done}` :
        r.status === 'SHARED' ? `${qs.pill} ${qs.pill_partial}` :
        r.status === 'CANCELLED' ? `${qs.pill} ${qs.pill_pending}` : qs.pill;
      return <span className={cls}>{r.status}</span>;
    },
  },
  {
    key: 'confirms',
    label: 'Confirmed by',
    render: (r) => (
      <div style={{ fontSize: 12 }}>
        <div>Startup: {r.startupConfirmedAt ? '✓' : '—'}</div>
        <div>Operator: {r.operatorConfirmedAt ? '✓' : '—'}</div>
      </div>
    ),
  },
  {
    key: 'updated',
    label: 'Updated',
    render: (r) => new Date(r.updatedAt).toLocaleDateString(),
  },
];

const filters = [
  { label: 'All', value: undefined },
  { label: 'Shared (awaiting confirmation)', value: 'SHARED' as PreSowSummaryStatus },
  { label: 'Confirmed', value: 'CONFIRMED' as PreSowSummaryStatus },
  { label: 'Draft', value: 'DRAFT' as PreSowSummaryStatus },
  { label: 'Cancelled', value: 'CANCELLED' as PreSowSummaryStatus },
];

function PreSowQueue() {
  return (
    <QueueShell
      title="Pre-SOW Commercial Summaries"
      subtitle="Triage queue for Pre-SOW summaries. Filter to find ones awaiting party confirmation, then dig into the detail view to edit or chase."
      columns={columns}
      filters={filters}
      load={(s) => adminOpsApi.preSowSummaries(s as PreSowSummaryStatus | undefined)}
      rowKey={(r) => r.id}
      emptyMessage="No Pre-SOW summaries match this filter."
    />
  );
}

export default function AdminPreSowPage() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <PreSowQueue />
      </ProtectedLayout>
    </AuthProvider>
  );
}
