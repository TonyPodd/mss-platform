'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '../../lib/api';
import { News } from '@mss/shared';
import styles from './news.module.css';

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNews = async () => {
    try {
      setLoading(true);
      const data = await apiClient.news.getAll();
      setNews(data);
    } catch (error) {
      console.error('Ошибка загрузки новостей:', error);
      alert('Не удалось загрузить новости');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту новость?')) {
      return;
    }

    try {
      await apiClient.news.delete(id);
      await loadNews();
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert('Не удалось удалить новость');
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await apiClient.news.publish(id);
      await loadNews();
    } catch (error) {
      console.error('Ошибка публикации:', error);
      alert('Не удалось опубликовать новость');
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      await apiClient.news.unpublish(id);
      await loadNews();
    } catch (error) {
      console.error('Ошибка снятия с публикации:', error);
      alert('Не удалось снять новость с публикации');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Управление новостями</h1>
        <Link href="/news/new" className={styles.addButton}>
          + Добавить новость
        </Link>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Заголовок</th>
              <th>Дата публикации</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {news.map((item) => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>
                  {item.publishedAt
                    ? new Date(item.publishedAt).toLocaleDateString('ru-RU')
                    : '-'}
                </td>
                <td>
                  <span
                    className={`${styles.badge} ${
                      item.isPublished ? styles.badgePublished : styles.badgeDraft
                    }`}
                  >
                    {item.isPublished ? 'Опубликовано' : 'Черновик'}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    {!item.isPublished && (
                      <button
                        className={`${styles.button} ${styles.buttonPublish}`}
                        onClick={() => handlePublish(item.id)}
                      >
                        Опубликовать
                      </button>
                    )}
                    {item.isPublished && (
                      <button
                        className={`${styles.button} ${styles.buttonUnpublish}`}
                        onClick={() => handleUnpublish(item.id)}
                      >
                        Снять с публикации
                      </button>
                    )}
                    <Link href={`/news/${item.id}/edit`} className={styles.button}>
                      Редактировать
                    </Link>
                    <button
                      className={`${styles.button} ${styles.buttonDelete}`}
                      onClick={() => handleDelete(item.id)}
                    >
                      Удалить
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {news.length === 0 && (
        <div className={styles.empty}>
          <p>Новостей пока нет</p>
          <Link href="/news/new" className={styles.addButton}>
            Создать первую новость
          </Link>
        </div>
      )}
    </div>
  );
}
