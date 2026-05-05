'use client';

import { useEffect, useState, useCallback } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { coreFlowApi, EngagementCall } from '@/lib/api-client';
import EngagementIntentPanel from '@/components/engagement/EngagementIntentPanel';
import styles from '@/app/startup/calls/calls.module.css';

function CallsContent() {
  const [calls, setCalls] = useState<EngagementCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await coreFlowApi.listMyCalls();
      setCalls(data);
    } catch {
      setErr('Could not load your calls.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <div className={styles.page}><p className={styles.loading}>Loading calls…</p></div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Discovery calls</h1>
        <p className={styles.sub}>
          30-minute introductory calls with companies who unlocked your profile. After the call, indicate engagement intent — when both parties are interested, BridgeScale will issue the Pre-SOW Commercial Summary.
        </p>
      </header>

      {err && <div className={styles.err}>{err}</div>}

      {calls.length === 0 ? (
        <div className={styles.empty}>
          <p>No calls scheduled yet. When a company requests a call with you, it will appear here.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {calls.map((c) => (
            <EngagementIntentPanel key={c.id} call={c} viewer="OPERATOR" onChange={load} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OperatorCallsPage() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <CallsContent />
      </ProtectedLayout>
    </AuthProvider>
  );
}
