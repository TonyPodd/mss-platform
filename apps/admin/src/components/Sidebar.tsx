'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: '/dashboard', label: 'Дашборд', icon: '📊' },
    { href: '/events', label: 'События', icon: '🎨' },
    { href: '/masters', label: 'Мастера', icon: '👨‍🎨' },
    { href: '/news', label: 'Новости', icon: '📰' },
    { href: '/products', label: 'Товары', icon: '🛍️' },
    { href: '/bookings', label: 'Записи', icon: '📝' },
  ];

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
    </aside>
  );
}
