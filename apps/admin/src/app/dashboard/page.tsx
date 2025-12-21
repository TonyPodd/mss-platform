'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '../../lib/api';
import styles from './dashboard.module.css';

interface DashboardStats {
  totalEvents: number;
  upcomingEvents: number;
  totalMasters: number;
  activeMasters: number;
  totalNews: number;
  publishedNews: number;
  totalBookings: number;
  pendingBookings: number;
}

interface RecentBooking {
  id: string;
  eventId?: string;
  groupSessionId?: string;
  event?: {
    title: string;
    startDate: Date;
    type: string;
  } | null;
  groupSession?: {
    group: {
      name: string;
    };
  } | null;
  participantsCount: number;
  status: string;
  createdAt: Date;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    upcomingEvents: 0,
    totalMasters: 0,
    activeMasters: 0,
    totalNews: 0,
    publishedNews: 0,
    totalBookings: 0,
    pendingBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [events, masters, news, bookings] = await Promise.all([
        apiClient.events.getList(1, 100),
        apiClient.masters.getList(),
        apiClient.news.getAll(),
        apiClient.bookings.getList(),
      ]);

      setStats({
        totalEvents: events.total || events.data.length,
        upcomingEvents: events.data.filter((e) => new Date(e.startDate) > new Date()).length,
        totalMasters: masters.length,
        activeMasters: masters.filter((m) => m.isActive).length,
        totalNews: news.length,
        publishedNews: news.filter((n) => n.isPublished).length,
        totalBookings: bookings.length,
        pendingBookings: bookings.filter((b: any) => b.status === 'PENDING').length,
      });

      setRecentBookings(bookings.slice(0, 5) as RecentBooking[]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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
      value: stats.totalBookings,
      subtitle: `Ожидают: ${stats.pendingBookings}`,
      icon: '📝',
      color: '#9C27B0',
    },
  ];

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Ожидает',
      CONFIRMED: 'Подтверждена',
      CANCELLED: 'Отменена',
      ATTENDED: 'Посетил',
    };
    return labels[status] || status;
  };

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getBookingTitle = (booking: RecentBooking): string => {
    if (booking.event?.title) {
      return booking.event.title;
    }
    if (booking.groupSession?.group?.name) {
      return booking.groupSession.group.name;
    }
    return 'Без названия';
  };

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

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
          <Link href="/events/new" className={styles.button}>
            + Создать событие
          </Link>
          <Link href="/news/new" className={styles.button}>
            + Добавить новость
          </Link>
          <Link href="/masters/new" className={styles.button}>
            + Добавить мастера
          </Link>
        </div>
      </div>

      <div className={styles.recentSection}>
        <div className={styles.sectionHeader}>
          <h2>Последние записи</h2>
          <Link href="/bookings" className={styles.viewAllLink}>
            Все записи →
          </Link>
        </div>
        {recentBookings.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Нет записей</p>
          </div>
        ) : (
          <div className={styles.bookingsList}>
            {recentBookings.map((booking) => (
              <div key={booking.id} className={styles.bookingCard}>
                <div className={styles.bookingInfo}>
                  <h4>{getBookingTitle(booking)}</h4>
                  <p className={styles.bookingMeta}>
                    {booking.participantsCount} участник(ов) • {formatDate(booking.createdAt)}
                  </p>
                </div>
                <span className={`${styles.bookingStatus} ${styles[`status${booking.status}`]}`}>
                  {getStatusLabel(booking.status)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
