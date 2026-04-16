'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function UnlockMatchingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  // Initiate unlock payment on mount
  useEffect(() => {
    async function initiatePayment() {
      try {
        const res = await fetch('/api/v1/applications/initiate-unlock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
          throw new Error('Failed to initiate payment');
        }

        const data = await res.json();

        // For Stripe (talent), redirect to checkoutUrl
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        }
      } catch (err: any) {
        setError(err.message || 'Could not initiate payment');
      }
    }

    if (user) {
      initiatePayment();
    }
  }, [user]);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
      <div style={{ padding: '2rem', backgroundColor: '#f9f7f5', borderRadius: '0.75rem' }}>
        <div style={{ fontSize: '48px', marginBottom: '1rem' }}>💳</div>
        <h2 style={{ marginBottom: '0.5rem' }}>Preparing checkout...</h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Redirecting you to Stripe to complete your $50 payment.
        </p>

        {error && (
          <div style={{ backgroundColor: '#fee', color: '#c00', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
            ⚠ {error}
          </div>
        )}

        {error && (
          <Link
            href="/operator/dashboard"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#9e7f5a',
              color: 'white',
              borderRadius: '0.5rem',
              textDecoration: 'none',
            }}
          >
            Back to dashboard
          </Link>
        )}
      </div>
    </div>
  );
}
