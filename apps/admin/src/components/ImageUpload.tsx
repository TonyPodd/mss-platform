'use client';

import { useState, useRef } from 'react';
import { apiClient } from '../lib/api';
import styles from './ImageUpload.module.css';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageChange: (imageUrl: string) => void;
  label?: string;
}

export default function ImageUpload({ currentImageUrl, onImageChange, label }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  // Преобразуем относительный URL в полный для preview
  const getFullUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${url}`;
  };
  const [previewUrl, setPreviewUrl] = useState(getFullUrl(currentImageUrl));
  const [useUrlInput, setUseUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    // Проверяем размер файла (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5MB');
      return;
    }

    try {
      setUploading(true);

      console.log('Uploading file:', file.name, file.size, file.type);

      // Загружаем файл
      const upload = await apiClient.upload.uploadFile(file);

      console.log('Upload response:', upload);

      // Обновляем preview и уведомляем родителя
      const fullUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${
        upload.url
      }`;
      console.log('Full URL:', fullUrl);
      console.log('Relative URL to save:', upload.url);
      setPreviewUrl(fullUrl);
      // Сохраняем в базу только относительный путь
      onImageChange(upload.url);
    } catch (error) {
      console.error('Ошибка загрузки файла:', error);
      alert(`Не удалось загрузить файл: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput) {
      setPreviewUrl(urlInput);
      onImageChange(urlInput);
      setUseUrlInput(false);
      setUrlInput('');
    }
  };

  const handleRemove = () => {
    setPreviewUrl('');
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={styles.container}>
      {label && <label className={styles.label}>{label}</label>}

      <div className={styles.uploadArea}>
        {previewUrl ? (
          <div className={styles.preview}>
            <img src={previewUrl} alt="Preview" className={styles.previewImage} />
            <button type="button" onClick={handleRemove} className={styles.removeButton}>
              Удалить
            </button>
          </div>
        ) : (
          <div className={styles.uploadOptions}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className={styles.uploadButton}
            >
              {uploading ? 'Загрузка...' : 'Выбрать файл'}
            </button>

            <span className={styles.separator}>или</span>

            {useUrlInput ? (
              <div className={styles.urlInput}>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className={styles.input}
                />
                <button type="button" onClick={handleUrlSubmit} className={styles.urlButton}>
                  OK
                </button>
                <button
                  type="button"
                  onClick={() => setUseUrlInput(false)}
                  className={styles.cancelButton}
                >
                  Отмена
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setUseUrlInput(true)}
                className={styles.urlToggle}
              >
                Вставить URL
              </button>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className={styles.fileInput}
      />
    </div>
  );
}
