'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace('/auth/login');
      return;
    }

    if (user.stage === 'ONBOARDING') {
      router.replace('/for-talent/apply');
      return;
    }

    if (user.stage === 'PENDING_APPROVAL') {
      router.replace('/application/status');
      return;
    }

    if (user.role === 'PLATFORM_ADMIN' || user.role === 'DEAL_DESK') {
      router.replace('/admin/dashboard');
      return;
    }

    if (user.role === 'STARTUP_ADMIN' || user.role === 'STARTUP_MEMBER') {
      router.replace('/startup/dashboard');
      return;
    }

    router.replace('/operator/dashboard');
  }, [loading, router, user]);

  return <div style={{ minHeight: '100vh', background: 'var(--color-bg, #0a0a0a)' }} />;
}
