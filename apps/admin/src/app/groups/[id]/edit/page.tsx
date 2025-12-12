'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '../../../../lib/api';
import { Master, RegularGroup } from '@mss/shared';
import ImageUpload from '../../../../components/ImageUpload';
import styles from '../../new/group-form.module.css';

export default function EditGroupPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [masters, setMasters] = useState<Master[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    imageUrl: '',
    daysOfWeek: [] as number[],
    time: '',
    duration: '90',
    price: '',
    maxParticipants: '',
    masterId: '',
    isActive: true,
  });

  useEffect(() => {
    if (groupId) {
      loadData();
    }
  }, [groupId]);

  const loadData = async () => {
    try {
      const [group, mastersData] = await Promise.all([
        apiClient.groups.getById(groupId),
        apiClient.masters.getList(),
      ]);

      setMasters(mastersData.filter((m) => m.isActive));

      const schedule = typeof group.schedule === 'object' ? group.schedule : { daysOfWeek: [], time: '', duration: 90 };

      setFormData({
        name: group.name,
        description: group.description,
        shortDescription: group.shortDescription,
        imageUrl: group.imageUrl || '',
        daysOfWeek: schedule.daysOfWeek || [],
        time: schedule.time || '',
        duration: String(schedule.duration || 90),
        price: String(group.price),
        maxParticipants: String(group.maxParticipants),
        masterId: group.masterId,
        isActive: group.isActive,
      });
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      alert('Не удалось загрузить данные направления');
      router.push('/groups');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const groupData = {
        name: formData.name,
        description: formData.description,
        shortDescription: formData.shortDescription,
        imageUrl: formData.imageUrl || null,
        schedule: {
          daysOfWeek: formData.daysOfWeek,
          time: formData.time,
          duration: parseInt(formData.duration),
        },
        price: parseFloat(formData.price),
        maxParticipants: parseInt(formData.maxParticipants),
        masterId: formData.masterId,
        isActive: formData.isActive,
      };

      await apiClient.groups.update(groupId, groupData);
      router.push('/groups');
    } catch (error) {
      console.error('Ошибка обновления направления:', error);
      alert('Не удалось обновить направление');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox' && name !== 'isActive') {
      // Skip day checkboxes - handled separately
      return;
    }
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDayToggle = (day: number) => {
    setFormData((prev) => {
      const daysOfWeek = prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...prev.daysOfWeek, day].sort((a, b) => a - b);
      return { ...prev, daysOfWeek };
    });
  };

  if (initialLoading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>Загрузка...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Редактировать направление</h1>
        <a href="/groups" className={styles.backButton}>
          Назад к списку
        </a>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Название *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Например: Гончарное дело для начинающих"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="shortDescription">Краткое описание *</label>
          <input
            type="text"
            id="shortDescription"
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleChange}
            required
            placeholder="Короткое описание в 1-2 предложения"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Полное описание *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={8}
            placeholder="Подробное описание направления, что включает в себя программа..."
            className={styles.textarea}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Дни недели *</label>
          <div className={styles.daysGrid}>
            {[
              { value: 1, label: 'Пн' },
              { value: 2, label: 'Вт' },
              { value: 3, label: 'Ср' },
              { value: 4, label: 'Чт' },
              { value: 5, label: 'Пт' },
              { value: 6, label: 'Сб' },
              { value: 0, label: 'Вс' },
            ].map((day) => (
              <label key={day.value} className={styles.dayCheckbox}>
                <input
                  type="checkbox"
                  checked={formData.daysOfWeek.includes(day.value)}
                  onChange={() => handleDayToggle(day.value)}
                  className={styles.checkbox}
                />
                <span>{day.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="time">Время начала *</label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="duration">Продолжительность (мин) *</label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              required
              min="15"
              step="5"
              placeholder="90"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="masterId">Мастер *</label>
            <select
              id="masterId"
              name="masterId"
              value={formData.masterId}
              onChange={handleChange}
              required
              className={styles.select}
            >
              <option value="">Выберите мастера</option>
              {masters.map((master) => (
                <option key={master.id} value={master.id}>
                  {master.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="price">Цена за занятие (₽) *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="1500"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="maxParticipants">Максимум участников *</label>
            <input
              type="number"
              id="maxParticipants"
              name="maxParticipants"
              value={formData.maxParticipants}
              onChange={handleChange}
              required
              min="1"
              placeholder="10"
              className={styles.input}
            />
          </div>
        </div>

        <ImageUpload
          currentImageUrl={formData.imageUrl}
          onImageChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
          label="Изображение направления"
        />

        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className={styles.checkbox}
            />
            <span>Активно</span>
          </label>
        </div>

        <div className={styles.formActions}>
          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
          <a href="/groups" className={styles.cancelButton}>
            Отмена
          </a>
        </div>
      </form>
    </div>
  );
}
