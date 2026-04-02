'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import styles from './success.module.css';

interface ApplicationStatus {
  id: string;
  type: string;
  status: string;
  name: string;
  email: string;
  feeAmountUsd: number;
  createdAt: string;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get('id');
  const [application, setApplication] = useState<ApplicationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  useEffect(() => {
    if (!applicationId) {
      setError('No application ID provided.');
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/applications/${applicationId}/status`)
      .then(res => {
        if (!res.ok) throw new Error('Application not found.');
        return res.json();
      })
      .then(data => setApplication(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [applicationId, API_URL]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.loadingText}>Loading application status…</div>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.errorIcon}>✕</div>
          <h1 className={styles.title}>Something went wrong</h1>
          <p className={styles.desc}>{error || 'Unable to load application status.'}</p>
          <Link href="/" className={styles.backLink}>← Back to BridgeScale</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.successIcon}>✓</div>
        <h1 className={styles.title}>Application received!</h1>
        <p className={styles.desc}>
          Thank you, <strong>{application.name}</strong>. Your {application.type.toLowerCase()} application
          has been submitted successfully. We&apos;ll review it and get back to you within 3–5 business days.
        </p>

        <div className={styles.details}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Reference</span>
            <code className={styles.detailValue}>{application.id}</code>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Email</span>
            <span className={styles.detailValue}>{application.email}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Application fee</span>
            <span className={styles.detailValue}>${application.feeAmountUsd} USD</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Status</span>
            <span className={`${styles.detailValue} ${styles.statusBadge}`}>
              {application.status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        <Link href="/" className={styles.backLink}>← Back to BridgeScale</Link>
      </div>
    </div>
  );
}

export default function ApplicationSuccessPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.loadingText}>Loading…</div>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
