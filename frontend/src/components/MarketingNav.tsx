'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './MarketingNav.module.css';

const serviceLinks = [
  { href: '/services/sales-leadership',  label: 'Fractional Leadership' },
  { href: '/services/sales-execution',   label: 'Fractional Execution / Operations' },
  { href: '/services/partnerships-bd',   label: 'Fractional BD / Partnerships' },
];

export function MarketingNav() {
  const path = usePathname();

  const links = [
    { href: '/',              label: 'Home' },
    { href: '/for-companies', label: 'For Companies' },
    { href: '/for-talent',    label: 'For Talent' },
    { href: '/about',         label: 'About' },
  ];

  const isServiceActive = serviceLinks.some(s => path.startsWith(s.href));

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>◆ BridgeScale</Link>
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

          {/* Services dropdown */}
          <div className={`${styles.navItem} ${isServiceActive ? styles.navItemActive : ''}`}>
            <span className={`${styles.link} ${isServiceActive ? styles.linkActive : ''} ${styles.servicesToggle}`}>
              Services
            </span>
            <div className={styles.dropdown}>
              {serviceLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`${styles.dropdownLink} ${path === href ? styles.dropdownLinkActive : ''}`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <Link href="/auth/login" className={styles.link}>Log in</Link>
        </div>
      </div>
    </nav>
  );
}
