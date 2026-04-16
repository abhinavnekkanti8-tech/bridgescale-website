'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const UPLOADS_DIR = process.cwd();

function loadRazorpay(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).Razorpay) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.head.appendChild(script);
  });
}

export default function UnlockMatchingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const appId = searchParams.get('appId');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState<any>(null);

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
        setPaymentData(data);
      } catch (err: any) {
        setError(err.message || 'Could not initiate payment');
      }
    }

    if (user) {
      initiatePayment();
    }
  }, [user]);

  async function openRazorpayModal() {
    if (!paymentData) return;
    setError('');
    setLoading(true);

    try {
      await loadRazorpay();

      const options = {
        key: paymentData.keyId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: 'BridgeScale',
        description: 'Unlock operator matches',
        order_id: paymentData.orderId,
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#9e7f5a' },
        handler: async (response: any) => {
          try {
            const res = await fetch('/api/v1/applications/verify-unlock', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                applicationId: paymentData.applicationId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            if (!res.ok) {
              throw new Error('Payment verification failed');
            }

            // Success - redirect to shortlist
            setTimeout(() => {
              window.location.href = '/startup/shortlist';
            }, 1000);
          } catch (err: any) {
            setError(err.message || 'Payment verification failed');
            setLoading(false);
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err.message || 'Could not open payment modal');
      setLoading(false);
    }
  }

  if (!paymentData) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Preparing payment...</h2>
        {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
        <Link href="/startup/dashboard" style={{ marginTop: '1rem', display: 'inline-block' }}>
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ padding: '2rem', backgroundColor: '#f9f7f5', borderRadius: '0.75rem', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🔓</div>
        <h2 style={{ marginBottom: '0.5rem' }}>Unlock Your Matches</h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Access detailed profiles and book discovery calls with {paymentData.currency === 'INR' ? '₹15,000' : '$50'}.
        </p>

        {error && (
          <div style={{ backgroundColor: '#fee', color: '#c00', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
            ⚠ {error}
          </div>
        )}

        <button
          onClick={openRazorpayModal}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#9e7f5a',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Opening payment...' : `Pay ${paymentData.currency === 'INR' ? '₹15,000' : '$50'} →`}
        </button>

        <p style={{ fontSize: '0.875rem', color: '#999', marginTop: '1rem' }}>
          Secured by Razorpay
        </p>
      </div>

      <Link
        href="/startup/dashboard"
        style={{ marginTop: '1.5rem', display: 'inline-block', color: '#666', textDecoration: 'none' }}
      >
        ← Back
      </Link>
    </div>
  );
}
