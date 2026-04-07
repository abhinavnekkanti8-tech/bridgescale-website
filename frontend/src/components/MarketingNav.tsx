'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './MarketingNav.module.css';

export function MarketingNav() {
  const path = usePathname();

  const links = [
    { href: '/',              label: 'Home' },
    { href: '/for-companies', label: 'For Companies' },
    { href: '/for-talent',    label: 'For Talent' },
    { href: '/about',         label: 'About' },
    { href: '/blog',          label: 'Blog' },
  ];

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>BridgeScale</Link>
        <div className={styles.links}>
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`${styles.link} ${path === href ? styles.linkActive : ''}`}
            >
              {label}
            </Link>
          ))}
          <Link href="/auth/login" className={styles.link}>Log in</Link>
          <Link href="/#signup" className={styles.cta}>Request Early Access</Link>
        </div>
      </div>
    </nav>
  );
}
