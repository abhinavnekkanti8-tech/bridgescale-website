'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

const ROLE_ROUTES: Record<string, string> = {
  STARTUP_ADMIN: '/startup/dashboard',
  STARTUP_MEMBER: '/startup/dashboard',
  OPERATOR: '/operator/dashboard',
  PLATFORM_ADMIN: '/admin/dashboard',
  DEAL_DESK: '/admin/dashboard',
};

function RoleRedirector() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const route = ROLE_ROUTES[user.role] ?? '/startup/dashboard';
      router.replace(route);
    } else if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [user, loading, router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <p style={{ fontSize: '1rem' }}>Redirecting to your dashboard…</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthProvider>
      <RoleRedirector />
    </AuthProvider>
  );
}
