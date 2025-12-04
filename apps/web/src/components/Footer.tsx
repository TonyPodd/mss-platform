import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.logo}>
            <h3>MSS Platform</h3>
            <p>Творческая студия мастер-классов</p>
          </div>

          <div className={styles.contacts}>
            <h4>Контакты</h4>
            <p>
              <strong>Адрес:</strong> г. Москва, ул. Примерная, д. 123
            </p>
            <p>
              <strong>Телефон:</strong> +7 (999) 123-45-67
            </p>
            <p>
              <strong>Email:</strong> info@mss-platform.ru
            </p>
          </div>

          <div className={styles.social}>
            <h4>Мы в соцсетях</h4>
            <div className={styles.socialLinks}>
              <a href="https://vk.com" target="_blank" rel="noopener noreferrer">
                VK
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
              <a href="https://t.me" target="_blank" rel="noopener noreferrer">
                Telegram
              </a>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>&copy; {new Date().getFullYear()} MSS Platform. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
