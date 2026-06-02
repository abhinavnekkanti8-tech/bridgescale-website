'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import QueueShell, { QueueColumn } from '@/components/admin/QueueShell';
import qs from '@/components/admin/QueueShell.module.css';
import { adminOpsApi, AdminMsaRow, MsaStatus } from '@/lib/api-client';

const columns: QueueColumn<AdminMsaRow>[] = [
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
    key: 'status',
    label: 'Status',
    render: (r) => {
      const cls =
        r.status === 'FULLY_EXECUTED' ? `${qs.pill} ${qs.pill_done}` :
        r.status === 'PARTIALLY_SIGNED' ? `${qs.pill} ${qs.pill_partial}` :
        r.status === 'TERMINATED' ? `${qs.pill} ${qs.pill_pending}` : qs.pill;
      return <span className={cls}>{r.status.replace(/_/g, ' ')}</span>;
    },
  },
  {
    key: 'signers',
    label: 'Signed by',
    render: (r) => (
      <div style={{ fontSize: 12 }}>
        <div>Platform: {r.platformSignedAt ? '✓' : '—'}</div>
        <div>Startup: {r.startupSignedAt ? '✓' : '—'}</div>
        <div>Operator: {r.operatorSignedAt ? '✓' : '—'}</div>
      </div>
    ),
  },
  {
    key: 'doc',
    label: 'Document',
    render: (r) => r.documentUrl
      ? <a href={r.documentUrl} target="_blank" rel="noreferrer">📄 View</a>
      : <span style={{ color: '#888' }}>—</span>,
  },
  {
    key: 'updated',
    label: 'Updated',
    render: (r) => new Date(r.updatedAt).toLocaleDateString(),
  },
];

const filters = [
  { label: 'All', value: undefined },
  { label: 'Pending signatures', value: 'PENDING_SIGNATURES' as MsaStatus },
  { label: 'Partially signed', value: 'PARTIALLY_SIGNED' as MsaStatus },
  { label: 'Fully executed', value: 'FULLY_EXECUTED' as MsaStatus },
  { label: 'Terminated', value: 'TERMINATED' as MsaStatus },
];

function MsaQueue() {
  return (
    <QueueShell
      title="Master Service Agreements"
      subtitle="Tri-party signing dashboard. Surface MSAs blocked at any step so ops can chase the missing party."
      columns={columns}
      filters={filters}
      load={(s) => adminOpsApi.msas(s as MsaStatus | undefined)}
      rowKey={(r) => r.id}
      emptyMessage="No MSAs match this filter."
    />
  );
}

export default function AdminMsaPage() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <MsaQueue />
      </ProtectedLayout>
    </AuthProvider>
  );
}
