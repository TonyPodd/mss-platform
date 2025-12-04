import { apiClient } from '../../lib/api';
import styles from './dashboard.module.css';

async function getDashboardData() {
  try {
    const [events, masters, news] = await Promise.all([
      apiClient.events.getList(1, 100),
      apiClient.masters.getList(),
      apiClient.news.getAll(),
    ]);

    return {
      totalEvents: events.total || events.data.length,
      upcomingEvents: events.data.filter((e) => new Date(e.startDate) > new Date()).length,
      totalMasters: masters.length,
      activeMasters: masters.filter((m) => m.isActive).length,
      totalNews: news.length,
      publishedNews: news.filter((n) => n.isPublished).length,
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      totalEvents: 0,
      upcomingEvents: 0,
      totalMasters: 0,
      activeMasters: 0,
      totalNews: 0,
      publishedNews: 0,
    };
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardData();

  const cards = [
    {
      title: 'Всего событий',
      value: stats.totalEvents,
      subtitle: `Предстоящих: ${stats.upcomingEvents}`,
      icon: '🎨',
      color: '#4CAF50',
    },
    {
      title: 'Мастера',
      value: stats.totalMasters,
      subtitle: `Активных: ${stats.activeMasters}`,
      icon: '👨‍🎨',
      color: '#2196F3',
    },
    {
      title: 'Новости',
      value: stats.totalNews,
      subtitle: `Опубликовано: ${stats.publishedNews}`,
      icon: '📰',
      color: '#FF9800',
    },
    {
      title: 'Записи',
      value: 0,
      subtitle: 'В разработке',
      icon: '📝',
      color: '#9C27B0',
    },
  ];

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Дашборд</h1>
      <p className={styles.subtitle}>Общая статистика платформы</p>

      <div className={styles.grid}>
        {cards.map((card, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon} style={{ background: card.color }}>
                {card.icon}
              </span>
              <h3 className={styles.cardTitle}>{card.title}</h3>
            </div>
            <div className={styles.cardValue}>{card.value}</div>
            <div className={styles.cardSubtitle}>{card.subtitle}</div>
          </div>
        ))}
      </div>

      <div className={styles.quickActions}>
        <h2>Быстрые действия</h2>
        <div className={styles.actionButtons}>
          <a href="/events/new" className={styles.button}>
            + Создать событие
          </a>
          <a href="/news/new" className={styles.button}>
            + Добавить новость
          </a>
          <a href="/masters/new" className={styles.button}>
            + Добавить мастера
          </a>
        </div>
      </div>
    </div>
  );
}
