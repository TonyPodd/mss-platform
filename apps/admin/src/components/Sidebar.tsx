'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { apiClient } from '../lib/api';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { href: '/dashboard', label: 'Дашборд', icon: '📊' },
    { href: '/events', label: 'Мастер-классы', icon: '🎨' },
    { href: '/groups', label: 'Направления', icon: '🔵' },
    { href: '/masters', label: 'Мастера', icon: '👨‍🎨' },
    { href: '/news', label: 'Новости', icon: '📰' },
    { href: '/products', label: 'Товары', icon: '🛍️' },
    { href: '/bookings', label: 'Записи', icon: '📝' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    apiClient.clearToken();
    router.push('/login');
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <h2>MSS Admin</h2>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${pathname?.startsWith(item.href) ? styles.active : ''}`}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className={styles.logoutSection}>
        <button onClick={handleLogout} className={styles.logoutButton}>
          <span className={styles.icon}>🚪</span>
          <span>Выйти</span>
        </button>
      </div>
    </aside>
  );
}
