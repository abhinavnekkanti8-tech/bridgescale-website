'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import styles from './layout.module.css';

const NAV_BY_ROLE: Record<string, { label: string; href: string }[]> = {
  STARTUP_ADMIN: [
    { label: 'Dashboard', href: '/startup/dashboard' },
    { label: 'My Profile', href: '/startup/profile' },
    { label: 'Discovery', href: '/startup/discovery' },
    { label: 'Shortlist', href: '/startup/matching' },
    { label: 'Contracts', href: '/startup/contracts' },
    { label: 'Billing', href: '/startup/billing' },
    { label: 'Engagements', href: '/startup/engagements' },
  ],
  STARTUP_MEMBER: [
    { label: 'Dashboard', href: '/startup/dashboard' },
    { label: 'Engagements', href: '/startup/engagements' },
  ],
  OPERATOR: [
    { label: 'Dashboard', href: '/operator/dashboard' },
    { label: 'My Profile', href: '/operator/profile' },
    { label: 'Invitations', href: '/operator/invitations' },
    { label: 'Matches', href: '/operator/matches' },
    { label: 'Contracts', href: '/operator/contracts' },
    { label: 'Engagements', href: '/operator/engagements' },
  ],
  PLATFORM_ADMIN: [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Startups', href: '/admin/startups' },
    { label: 'Operators', href: '/admin/operators' },
    { label: 'Matching', href: '/admin/matching' },
    { label: 'Contracts', href: '/admin/contracts' },
    { label: 'Billing', href: '/admin/billing' },
    { label: 'Engagements', href: '/admin/discovery' },
    { label: 'Analytics', href: '/admin/analytics' },
    { label: 'Escalations', href: '/admin/escalations' },
    { label: 'Deal Desk', href: '/admin/deal-desk' },
    { label: 'Settings', href: '/admin/settings' },
  ],
  DEAL_DESK: [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'My Cases', href: '/admin/deal-desk' },
  ],
};

export function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <span className="gradient-text" style={{ fontSize: '2rem' }}>◆</span>
        <p>Loading…</p>
      </div>
    );
  }

  if (!user) {
    router.replace('/auth/login');
    return null;
  }

  const navItems = NAV_BY_ROLE[user.role] ?? [];

  async function handleLogout() {
    await logout();
    router.push('/auth/login');
  }

  return (
    <div className={styles.shell}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <Link href="/" className={styles.sidebarLogo}>
            <span className="gradient-text">◆</span>
            <span className={styles.sidebarLogoText}>Nexus</span>
          </Link>
          <nav className={styles.nav}>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={styles.navItem}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className={styles.sidebarBottom}>
          <div className={styles.userChip}>
            <div className={styles.userAvatar}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.name}</span>
              <span className={styles.userRole}>{user.role.replace(/_/g, ' ')}</span>
            </div>
          </div>
          <button id="logout-btn" onClick={handleLogout} className={styles.logoutBtn}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={styles.main}>{children}</main>
    </div>
  );
}
