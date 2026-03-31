'use client';

import { useEffect, useState } from 'react';
import { healthApi, SystemNudge } from '@/lib/api-client';
import styles from './NudgeBanner.module.css';

export function NudgeBanner() {
  const [nudges, setNudges] = useState<SystemNudge[]>([]);

  const fetchNudges = () => {
    healthApi.getMyNudges()
      .then(setNudges)
      .catch(console.error);
  };

  useEffect(() => {
    fetchNudges();
    // In a real app this would use WebSockets or SSE for real-time. We poll every minute here.
    const interval = setInterval(fetchNudges, 60000);
    return () => clearInterval(interval);
  }, []);

  async function handleDismiss(id: string) {
    try {
      await healthApi.markNudgeRead(id);
      setNudges(nudges.filter(n => n.id !== id));
    } catch {
      // ignore
    }
  }

  if (nudges.length === 0) return null;

  return (
    <div className={styles.bannerContainer}>
      {nudges.map((nudge) => (
        <div key={nudge.id} className={`${styles.nudgeAlert} ${styles[nudge.nudgeType.toLowerCase()] || styles.default}`}>
          <div className={styles.icon}>
            {nudge.nudgeType === 'PAYMENT_REMINDER' ? '💳' :
             nudge.nudgeType.includes('OVERDUE') ? '⚠️' : '🔔'}
          </div>
          <div className={styles.content}>
            <strong>{nudge.engagement?.contract?.sow.title || 'Platform Notice'}</strong>
            <p>{nudge.message}</p>
          </div>
          <button className={styles.dismissBtn} onClick={() => handleDismiss(nudge.id)} aria-label="Dismiss">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
