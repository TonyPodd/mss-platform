'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '../../lib/api';
import { Master } from '@mss/shared';
import styles from './masters.module.css';

export default function MastersPage() {
  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMasters = async () => {
    try {
      setLoading(true);
      const data = await apiClient.masters.getList();
      setMasters(data);
    } catch (error) {
      console.error('Ошибка загрузки мастеров:', error);
      alert('Не удалось загрузить мастеров');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasters();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого мастера?')) {
      return;
    }

    try {
      await apiClient.masters.delete(id);
      await loadMasters();
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert('Не удалось удалить мастера');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Управление мастерами</h1>
        <Link href="/masters/new" className={styles.addButton}>
          + Добавить мастера
        </Link>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Имя</th>
              <th>Специализации</th>
              <th>Рейтинг</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {masters.map((master) => (
              <tr key={master.id}>
                <td>
                  <div className={styles.masterInfo}>
                    {master.avatarUrl && (
                      <img src={master.avatarUrl} alt={master.name} className={styles.avatar} />
                    )}
                    <span>{master.name}</span>
                  </div>
                </td>
                <td>
                  <div className={styles.specializations}>
                    {master.specializations.map((spec, idx) => (
                      <span key={idx} className={styles.specBadge}>
                        {spec}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <div className={styles.rating}>
                    ⭐ {master.rating ? master.rating.toFixed(1) : '0.0'}
                  </div>
                </td>
                <td>
                  <span
                    className={`${styles.badge} ${
                      master.isActive ? styles.badgeActive : styles.badgeInactive
                    }`}
                  >
                    {master.isActive ? 'Активен' : 'Неактивен'}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <Link href={`/masters/${master.id}/edit`} className={styles.button}>
                      Редактировать
                    </Link>
                    <button
                      className={`${styles.button} ${styles.buttonDelete}`}
                      onClick={() => handleDelete(master.id)}
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

      {masters.length === 0 && (
        <div className={styles.empty}>
          <p>Мастеров пока нет</p>
          <Link href="/masters/new" className={styles.addButton}>
            Добавить первого мастера
          </Link>
        </div>
      )}
    </div>
  );
}
