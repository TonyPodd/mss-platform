'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import styles from './Header.module.css';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          MSS Platform
        </Link>

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

        <div className={styles.authSection}>
          {isAuthenticated ? (
            <div className={styles.profileContainer}>
              <button
                className={styles.profileButton}
                onClick={toggleProfileMenu}
                aria-label="Профиль"
              >
                <div className={styles.avatar}>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <span className={styles.userName}>
                  {user?.firstName}
                </span>
              </button>

              {isProfileMenuOpen && (
                <div className={styles.profileMenu}>
                  <Link
                    href="/profile"
                    className={styles.profileMenuItem}
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    Мой профиль
                  </Link>
                  <button
                    className={styles.profileMenuItem}
                    onClick={handleLogout}
                  >
                    Выйти
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className={styles.loginButton}>
              Войти
            </Link>
          )}
        </div>

        <button
          className={`${styles.burger} ${isMenuOpen ? styles.burgerOpen : ''}`}
          onClick={toggleMenu}
          aria-label="Меню"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
}
