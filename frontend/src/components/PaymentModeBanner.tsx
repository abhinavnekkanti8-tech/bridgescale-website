'use client';

/**
 * PaymentModeBanner
 *
 * Surfaces whether the running deployment is in dummy-payment mode or has
 * partner integrations stubbed. Renders only when at least one mode is off,
 * so live production deployments don't show a banner.
 */
import { useEffect, useState } from 'react';
import { paymentsApi } from '@/lib/api-client';

export default function PaymentModeBanner() {
  const [mode, setMode] = useState<{ dummyPaymentMode: boolean; partnerLiveMode: boolean; env: string } | null>(null);

  useEffect(() => {
    paymentsApi.getMode().then(setMode).catch(() => {});
  }, []);

  if (!mode) return null;
  if (!mode.dummyPaymentMode && mode.partnerLiveMode) return null; // fully live, no banner

  const labels: string[] = [];
  if (mode.dummyPaymentMode) labels.push('Dummy payments');
  if (!mode.partnerLiveMode) labels.push('Partner integrations stubbed');

  return (
    <div style={{
      background: '#fff3d6',
      borderLeft: '3px solid #d8a44a',
      color: '#8a5a1f',
      padding: '10px 16px',
      fontSize: '0.82rem',
      marginBottom: 16,
      display: 'flex',
      gap: 12,
      alignItems: 'center',
    }}>
      <strong style={{ fontWeight: 700 }}>{mode.env.toUpperCase()}</strong>
      <span>{labels.join(' · ')}. No real money will move.</span>
    </div>
  );
}
