'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import styles from './Header.module.css';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { getTotalItems, clearCart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);

  const handleLogout = () => {
    clearCart();
    logout();
    setIsProfileMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logoWrapper}>
          <img src="/logo-na-zare.png" alt="На заре" className={styles.logoImage} />
          <span className={styles.logoText}>На заре</span>
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
          <Link href="/cart" className={styles.cartLink} aria-label="Корзина">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 2L7 6H3L5 20H19L21 6H17L15 2H9Z" />
              <circle cx="9" cy="20" r="1" />
              <circle cx="15" cy="20" r="1" />
            </svg>
            {getTotalItems() > 0 && <span className={styles.cartBadge}>{getTotalItems()}</span>}
          </Link>

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
