'use client';

import { useState } from 'react';
import styles from './UnlockMatchingCTA.module.css';

interface UnlockMatchingCTAProps {
  canPay: boolean;
  amount: string;
  provider: string;
  onUnlock: () => Promise<void>;
  reason?: string;
}

export function UnlockMatchingCTA({ canPay, amount, provider, onUnlock, reason }: UnlockMatchingCTAProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!canPay || loading) return;
    setLoading(true);
    try {
      await onUnlock();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.cta}>
      <div className={styles.lockRow}>
        <span className={styles.lockIcon}>🔒</span>
        <span className={styles.lockText}>Unlock matching — {amount} one-time</span>
      </div>
      <button
        className={styles.payBtn}
        disabled={!canPay || loading}
        onClick={handleClick}
      >
        {loading ? 'Processing...' : `Pay ${amount}`}
      </button>
      {!canPay && reason && (
        <p className={styles.disabledNote}>{reason}</p>
      )}
    </div>
  );
}
