'use client';

import Link from 'next/link';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../lib/api';
import ImageUpload from '../../../components/ImageUpload';
import styles from './news-form.module.css';

export default function NewNewsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    isPublished: false,
    publishedAt: new Date().toISOString().slice(0, 16),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newsData = {
        title: formData.title,
        content: formData.content,
        imageUrl: formData.imageUrl || null,
        isPublished: formData.isPublished,
        publishedAt: formData.isPublished ? new Date(formData.publishedAt).toISOString() : null,
      };

      await apiClient.news.create(newsData);
      router.push('/news');
    } catch (error) {
      console.error('Ошибка создания новости:', error);
      alert('Не удалось создать новость');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Добавить новость</h1>
        <Link href="/news" className={styles.backButton}>
          Назад к списку
        </Link>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="title">Заголовок *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="content">Содержание *</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows={10}
            placeholder="Напишите текст новости..."
            className={styles.textarea}
          />
        </div>

        <ImageUpload
          currentImageUrl={formData.imageUrl}
          onImageChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
          label="Изображение новости"
        />

        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleChange}
              className={styles.checkbox}
            />
            <span>Опубликовать сразу</span>
          </label>
        </div>

        {formData.isPublished && (
          <div className={styles.formGroup}>
            <label htmlFor="publishedAt">Дата публикации</label>
            <input
              type="datetime-local"
              id="publishedAt"
              name="publishedAt"
              value={formData.publishedAt}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
        )}

        <div className={styles.formActions}>
          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? 'Создание...' : 'Создать новость'}
          </button>
          <Link href="/news" className={styles.cancelButton}>
            Отмена
          </Link>
        </div>
      </form>
    </div>
  );
}
