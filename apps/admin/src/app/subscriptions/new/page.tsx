'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '../../../lib/api';
import styles from './subscription-form.module.css';

export default function NewSubscriptionTypePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    amount: '',
    durationDays: '',
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        amount: parseFloat(formData.amount),
        durationDays: formData.durationDays ? parseInt(formData.durationDays) : null,
        isActive: formData.isActive,
      };

      await apiClient.subscriptionTypes.create(data);
      router.push('/subscriptions');
    } catch (error) {
      console.error('Ошибка создания типа абонемента:', error);
      alert('Не удалось создать тип абонемента');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const discount = formData.amount && formData.price
    ? parseFloat(formData.amount) - parseFloat(formData.price)
    : 0;
  const discountPercent = formData.amount && formData.price
    ? ((discount / parseFloat(formData.amount)) * 100).toFixed(1)
    : 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Создать тип абонемента</h1>
        <Link href="/subscriptions" className={styles.backButton}>
          Назад к списку
        </Link>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">
            Название <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Например: Абонемент на 10 занятий"
            className={styles.input}
          />
          <small className={styles.hint}>Название, которое увидят пользователи</small>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Описание</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Краткое описание преимуществ абонемента"
            className={styles.textarea}
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="price">
              Цена (₽) <span className={styles.required}>*</span>
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="5000"
              className={styles.input}
            />
            <small className={styles.hint}>Сколько заплатит пользователь</small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="amount">
              Баланс на счете (₽) <span className={styles.required}>*</span>
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="5500"
              className={styles.input}
            />
            <small className={styles.hint}>Баланс, который получит пользователь</small>
          </div>
        </div>

        {discount > 0 && (
          <div className={styles.discountInfo}>
            <strong>Скидка для пользователя:</strong> {discount.toFixed(2)} ₽ ({discountPercent}%)
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="durationDays">Срок действия (дней)</label>
          <input
            type="number"
            id="durationDays"
            name="durationDays"
            value={formData.durationDays}
            onChange={handleChange}
            min="1"
            placeholder="30"
            className={styles.input}
          />
          <small className={styles.hint}>Оставьте пустым для бессрочного абонемента</small>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className={styles.checkbox}
            />
            Активен (доступен для покупки)
          </label>
        </div>

        <div className={styles.formActions}>
          <Link href="/subscriptions" className={styles.cancelButton}>
            Отмена
          </Link>
          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? 'Создание...' : 'Создать абонемент'}
          </button>
        </div>
      </form>
    </div>
  );
}
