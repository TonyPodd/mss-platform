'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '../../lib/api';
import { Event } from '@mss/shared';
import styles from './events.module.css';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await apiClient.events.getList(1, 100);
      setEvents(data.data);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить это событие?')) return;

    try {
      await apiClient.events.delete(id);
      await loadEvents();
      alert('Событие удалено');
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Ошибка при удалении события');
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await apiClient.events.publish(id);
      await loadEvents();
      alert('Событие опубликовано');
    } catch (error) {
      console.error('Error publishing event:', error);
      alert('Ошибка при публикации');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Управление событиями</h1>
        <Link href="/events/new" className={styles.addButton}>
          + Создать событие
        </Link>
      </div>

      <div className={styles.table}>
        <table>
          <thead>
            <tr>
              <th>Название</th>
              <th>Тип</th>
              <th>Дата начала</th>
              <th>Цена</th>
              <th>Мест</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>{event.title}</td>
                <td>
                  <span className={`${styles.badge} ${styles[event.type]}`}>
                    {event.type === 'MASTER_CLASS' && 'МК'}
                    {event.type === 'REGULAR_GROUP' && 'Группа'}
                    {event.type === 'ONE_TIME_EVENT' && 'Событие'}
                  </span>
                </td>
                <td>{formatDate(event.startDate)}</td>
                <td>{event.price} ₽</td>
                <td>
                  {event.currentParticipants}/{event.maxParticipants}
                </td>
                <td>
                  <span className={`${styles.status} ${styles[event.status]}`}>
                    {event.status === 'PUBLISHED' && 'Опубликовано'}
                    {event.status === 'DRAFT' && 'Черновик'}
                    {event.status === 'CANCELLED' && 'Отменено'}
                    {event.status === 'COMPLETED' && 'Завершено'}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    {event.status === 'DRAFT' && (
                      <button
                        onClick={() => handlePublish(event.id)}
                        className={styles.publishBtn}
                      >
                        Опубликовать
                      </button>
                    )}
                    <Link href={`/events/${event.id}`} className={styles.editBtn}>
                      Редактировать
                    </Link>
                    <button onClick={() => handleDelete(event.id)} className={styles.deleteBtn}>
                      Удалить
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {events.length === 0 && (
          <div className={styles.empty}>
            <p>Событий пока нет. Создайте первое!</p>
          </div>
        )}
      </div>
    </div>
  );
}
