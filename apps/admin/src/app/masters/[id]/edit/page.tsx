'use client';

import Link from 'next/link';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '../../../../lib/api';
import { Master } from '@mss/shared';
import ImageUpload from '../../../../components/ImageUpload';
import styles from '../../new/master-form.module.css';

export default function EditMasterPage() {
  const router = useRouter();
  const params = useParams();
  const masterId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    avatarUrl: '',
    vkLink: '',
    instagramLink: '',
    telegramLink: '',
    specializations: '',
    isActive: true,
  });

  useEffect(() => {
    loadMaster();
  }, [masterId]);

  const loadMaster = async () => {
    try {
      setInitialLoading(true);
      const master = await apiClient.masters.getById(masterId);
      setFormData({
        name: master.name,
        bio: master.bio || '',
        avatarUrl: master.avatarUrl || '',
        vkLink: master.vkLink || '',
        instagramLink: master.instagramLink || '',
        telegramLink: master.telegramLink || '',
        specializations: master.specializations.join(', '),
        isActive: master.isActive,
      });
    } catch (error) {
      console.error('Ошибка загрузки мастера:', error);
      alert('Не удалось загрузить данные мастера');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const masterData = {
        name: formData.name,
        bio: formData.bio || null,
        avatarUrl: formData.avatarUrl || null,
        vkLink: formData.vkLink || null,
        instagramLink: formData.instagramLink || null,
        telegramLink: formData.telegramLink || null,
        specializations: formData.specializations
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s),
        isActive: formData.isActive,
      };

      await apiClient.masters.update(masterId, masterData);
      router.push('/masters');
    } catch (error) {
      console.error('Ошибка обновления мастера:', error);
      alert('Не удалось обновить мастера');
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

  if (initialLoading) {
    return <div className={styles.container}>Загрузка...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Редактировать мастера</h1>
        <Link href="/masters" className={styles.backButton}>
          Назад к списку
        </Link>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Имя *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="bio">Биография</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={5}
            placeholder="Расскажите о мастере..."
            className={styles.textarea}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="specializations">Специализации (через запятую) *</label>
          <input
            type="text"
            id="specializations"
            name="specializations"
            value={formData.specializations}
            onChange={handleChange}
            required
            placeholder="керамика, гончарное дело, роспись"
            className={styles.input}
          />
        </div>

        <ImageUpload
          currentImageUrl={formData.avatarUrl}
          onImageChange={(url) => setFormData((prev) => ({ ...prev, avatarUrl: url }))}
          label="Аватар"
        />

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="vkLink">Ссылка ВКонтакте</label>
            <input
              type="url"
              id="vkLink"
              name="vkLink"
              value={formData.vkLink}
              onChange={handleChange}
              placeholder="https://vk.com/username"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="instagramLink">Ссылка Instagram</label>
            <input
              type="url"
              id="instagramLink"
              name="instagramLink"
              value={formData.instagramLink}
              onChange={handleChange}
              placeholder="https://instagram.com/username"
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="telegramLink">Ссылка Telegram</label>
          <input
            type="url"
            id="telegramLink"
            name="telegramLink"
            value={formData.telegramLink}
            onChange={handleChange}
            placeholder="https://t.me/username"
            className={styles.input}
          />
        </div>

        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className={styles.checkbox}
            />
            <span>Активен</span>
          </label>
        </div>

        <div className={styles.formActions}>
          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
          <Link href="/masters" className={styles.cancelButton}>
            Отмена
          </Link>
        </div>
      </form>
    </div>
  );
}
