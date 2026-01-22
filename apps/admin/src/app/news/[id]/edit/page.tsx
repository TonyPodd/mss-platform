'use client';

import Link from 'next/link';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '../../../../lib/api';
import { News } from '@mss/shared';
import ImageUpload from '../../../../components/ImageUpload';
import styles from '../../new/news-form.module.css';

export default function EditNewsPage() {
  const router = useRouter();
  const params = useParams();
  const newsId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    isPublished: false,
    publishedAt: '',
  });

  useEffect(() => {
    loadNews();
  }, [newsId]);

  const loadNews = async () => {
    try {
      setInitialLoading(true);
      const news = await apiClient.news.getById(newsId);
      setFormData({
        title: news.title,
        content: news.content,
        imageUrl: news.imageUrl || '',
        isPublished: news.isPublished,
        publishedAt: news.publishedAt
          ? new Date(news.publishedAt).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
      });
    } catch (error) {
      console.error('Ошибка загрузки новости:', error);
      alert('Не удалось загрузить данные новости');
    } finally {
      setInitialLoading(false);
    }
  };

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

      await apiClient.news.update(newsId, newsData);
      router.push('/news');
    } catch (error) {
      console.error('Ошибка обновления новости:', error);
      alert('Не удалось обновить новость');
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

  if (initialLoading) {
    return <div className={styles.container}>Загрузка...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Редактировать новость</h1>
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
            <span>Опубликовано</span>
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
            {loading ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
          <Link href="/news" className={styles.cancelButton}>
            Отмена
          </Link>
        </div>
      </form>
    </div>
  );
}
