'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import QueueShell, { QueueColumn } from '@/components/admin/QueueShell';
import qs from '@/components/admin/QueueShell.module.css';
import { adminOpsApi, AdminEorEnrollmentRow, EorEnrollmentStatus } from '@/lib/api-client';

const columns: QueueColumn<AdminEorEnrollmentRow>[] = [
  {
    key: 'partner',
    label: 'Partner',
    render: (r) => r.partner,
  },
  {
    key: 'op',
    label: 'Operator',
    render: (r) => r.operatorProfile
      ? <span style={{ fontFamily: 'monospace', fontSize: 12 }}>op #{r.operatorProfile.id.slice(0, 6)}</span>
      : <span style={{ color: '#888' }}>—</span>,
  },
  {
    key: 'status',
    label: 'Status',
    render: (r) => {
      const cls =
        r.status === 'ACTIVE' ? `${qs.pill} ${qs.pill_done}` :
        r.status === 'PENDING' ? `${qs.pill} ${qs.pill_partial}` :
        r.status === 'NOT_STARTED' ? qs.pill :
        `${qs.pill} ${qs.pill_pending}`;
      return <span className={cls}>{r.status.replace(/_/g, ' ')}</span>;
    },
  },
  {
    key: 'partnerSideId',
    label: 'Partner-side ID',
    render: (r) => r.partnerSideId
      ? <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.partnerSideId}</span>
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
  { label: 'Pending', value: 'PENDING' as EorEnrollmentStatus },
  { label: 'Active', value: 'ACTIVE' as EorEnrollmentStatus },
  { label: 'Rejected', value: 'REJECTED' as EorEnrollmentStatus },
  { label: 'Terminated', value: 'TERMINATED' as EorEnrollmentStatus },
];

function EorQueue() {
  return (
    <QueueShell
      title="EOR enrolments"
      subtitle="Operator EOR-partner enrolments awaiting partner-side action. Today, ops manually advances status; in Phase 6 partner webhooks will keep this in sync automatically."
      columns={columns}
      filters={filters}
      load={(s) => adminOpsApi.eorEnrollments(s as EorEnrollmentStatus | undefined)}
      rowKey={(r) => r.id}
      emptyMessage="No EOR enrolments match this filter."
    />
  );
}

export default function AdminEorPage() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <EorQueue />
      </ProtectedLayout>
    </AuthProvider>
  );
}
