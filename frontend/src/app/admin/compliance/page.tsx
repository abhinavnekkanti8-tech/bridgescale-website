'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import QueueShell, { QueueColumn } from '@/components/admin/QueueShell';
import qs from '@/components/admin/QueueShell.module.css';
import { adminOpsApi, AdminComplianceRow } from '@/lib/api-client';

const columns: QueueColumn<AdminComplianceRow>[] = [
  {
    key: 'mode',
    label: 'Mode',
    render: (r) => {
      const cls =
        r.mode === 'CONTRACTOR' ? `${qs.pill} ${qs.pill_done}` :
        r.mode === 'BLOCKED_PENDING_REVIEW' ? `${qs.pill} ${qs.pill_pending}` :
        `${qs.pill} ${qs.pill_partial}`;
      return <span className={cls}>{r.mode.replace(/_/g, ' ')}</span>;
    },
  },
  {
    key: 'reason',
    label: 'Reason',
    render: (r) => <div style={{ maxWidth: 480 }}>{r.reason}</div>,
  },
  {
    key: 'op',
    label: 'Operator',
    render: (r) => r.operatorProfile
      ? <span style={{ fontFamily: 'monospace', fontSize: 12 }}>op #{r.operatorProfile.id.slice(0, 6)}</span>
      : <span style={{ color: '#888' }}>—</span>,
  },
  {
    key: 'sow',
    label: 'SOW',
    render: (r) => r.sowId
      ? <span style={{ fontFamily: 'monospace', fontSize: 12 }}>sow #{r.sowId.slice(0, 6)}</span>
      : <span style={{ color: '#888' }}>—</span>,
  },
  {
    key: 'who',
    label: 'Decided by',
    render: (r) => r.decidedBy,
  },
  {
    key: 'when',
    label: 'When',
    render: (r) => new Date(r.createdAt).toLocaleString(),
  },
];

function ComplianceQueue() {
  return (
    <QueueShell
      title="Compliance decisions"
      subtitle="Recent compliance-mode decisions. Use this to audit how the resolver classified engagements (CONTRACTOR / EOR_REQUIRED / BLOCKED_PENDING_REVIEW etc.)."
      columns={columns}
      load={() => adminOpsApi.complianceDecisions()}
      rowKey={(r) => r.id}
      emptyMessage="No compliance decisions logged in the last window."
    />
  );
}

export default function AdminCompliancePage() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <ComplianceQueue />
      </ProtectedLayout>
    </AuthProvider>
  );
}
