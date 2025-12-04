'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          MSS Platform
        </Link>

        <button
          className={`${styles.burger} ${isMenuOpen ? styles.burgerOpen : ''}`}
          onClick={toggleMenu}
          aria-label="Меню"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
          <Link href="/calendar" onClick={() => setIsMenuOpen(false)}>
            Календарь
          </Link>
          <Link href="/groups" onClick={() => setIsMenuOpen(false)}>
            Направления
          </Link>
          <Link href="/masters" onClick={() => setIsMenuOpen(false)}>
            Наши мастера
          </Link>
          <Link href="/shop" onClick={() => setIsMenuOpen(false)}>
            Магазин
          </Link>
        </nav>
      </div>
    </header>
  );
}
