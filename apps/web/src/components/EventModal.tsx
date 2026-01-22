'use client';

import { useState } from 'react';
import { CalendarEvent, EVENT_COLORS } from '@mss/shared';
import { getImageUrl } from '../lib/utils';
import BookingForm from './BookingForm';
import styles from './EventModal.module.css';

interface EventModalProps {
  event: CalendarEvent | null;
  onClose: () => void;
}

export default function EventModal({ event, onClose }: EventModalProps) {
  const [showBookingForm, setShowBookingForm] = useState(false);

  if (!event) return null;

  const handleBookingSuccess = () => {
    setShowBookingForm(false);
    onClose();
  };

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    const weekday = new Intl.DateTimeFormat('ru-RU', { weekday: 'long' }).format(date);
    const day = date.getDate();
    const month = new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(date);
    const year = date.getFullYear();
    const time = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(date);

    return {
      full: `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${day} ${month} ${year}`,
      time,
    };
  };

  const getTimeOfDay = (dateString: Date) => {
    const hour = new Date(dateString).getHours();
    if (hour >= 6 && hour < 12) return 'Утро';
    if (hour >= 12 && hour < 18) return 'День';
    if (hour >= 18 && hour < 23) return 'Вечер';
    return null;
  };

  const getDifficultyLabel = (difficulty?: string) => {
    if (!difficulty) return null;
    switch (difficulty.toUpperCase()) {
      case 'BEGINNER':
        return 'Начинающий';
      case 'INTERMEDIATE':
        return 'Средний';
      case 'ADVANCED':
        return 'Продвинутый';
      default:
        return null;
    }
  };

  const getDuration = (startDate: Date, endDate: Date) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));

    if (durationMinutes < 60) {
      return `${durationMinutes} мин`;
    }

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (minutes === 0) {
      return `${hours} ${hours === 1 ? 'час' : hours < 5 ? 'часа' : 'часов'}`;
    }

    return `${hours},${Math.floor(minutes / 6)} часа`;
  };

  const getEventTypeName = (type: string) => {
    switch (type) {
      case 'MASTER_CLASS':
        return 'Мастер-класс';
      case 'REGULAR_GROUP':
        return 'Группа';
      case 'ONE_TIME_EVENT':
        return 'Событие';
      default:
        return type;
    }
  };

  const availableSeats = event.maxParticipants - event.currentParticipants;
  const isFull = availableSeats <= 0;
  const dateInfo = formatDate(event.startDate);
  const timeOfDay = getTimeOfDay(event.startDate);
  const duration = getDuration(event.startDate, event.endDate);
  const difficulty = getDifficultyLabel((event as any).difficulty);
  const materials = (event as any).materials as string[] | undefined;
  const resultImages = (event as any).resultImages as string[] | undefined;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>

        {!showBookingForm ? (
          <>
            <div className={styles.modalContent}>
              <div className={styles.header}>
                <div className={styles.badge}>{getEventTypeName(event.type)}</div>
                <h2 className={styles.title}>{event.title}</h2>
              </div>

              <div className={styles.dateSection}>
                <div className={styles.dateMain}>{dateInfo.full}</div>
                <div className={styles.chips}>
                  <span className={styles.timeChip}>{dateInfo.time}</span>
                  {timeOfDay && <span className={styles.timeOfDayChip}>{timeOfDay}</span>}
                  <span className={styles.durationChip}>{duration}</span>
                </div>
              </div>

              <div className={styles.attributes}>
                {difficulty && (
                  <div className={styles.attribute}>
                    <span className={styles.attributeLabel}>Уровень:</span>
                    <span className={styles.attributeValue}>{difficulty}</span>
                  </div>
                )}
                <div className={styles.attribute}>
                  <span className={styles.attributeLabel}>Стоимость:</span>
                  <span className={styles.price}>{event.price} ₽</span>
                </div>
                <div className={styles.attribute}>
                  <span className={styles.attributeLabel}>Доступно мест:</span>
                  <span className={`${styles.attributeValue} ${isFull ? styles.noSeats : ''}`}>
                    {isFull ? 'Мест нет' : `${availableSeats} из ${event.maxParticipants}`}
                  </span>
                </div>
              </div>

              <div className={styles.description}>
                <h3 className={styles.descriptionTitle}>О мастер-классе</h3>
                <p className={styles.descriptionText}>{event.description}</p>
              </div>

              {materials && materials.length > 0 && (
                <div className={styles.materials}>
                  <h3 className={styles.materialsTitle}>Материалы</h3>
                  <ul className={styles.materialsList}>
                    {materials.map((material, index) => (
                      <li key={index}>{material}</li>
                    ))}
                  </ul>
                </div>
              )}

              {resultImages && resultImages.length > 0 && (
                <div className={styles.results}>
                  <h3 className={styles.resultsTitle}>Примеры работ</h3>
                  <div className={styles.resultsGrid}>
                    {resultImages.map((image, index) => (
                      <div
                        key={index}
                        className={styles.resultImage}
                        style={{ backgroundImage: `url(${getImageUrl(image)})` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {!isFull ? (
                <button
                  className={styles.registerButton}
                  onClick={() => setShowBookingForm(true)}
                >
                  {event.groupSessionId ? 'Записаться на занятие' : 'Записаться'}
                </button>
              ) : (
                <div className={styles.fullMessage}>
                  К сожалению, все места заняты
                </div>
              )}
            </div>
          </>
        ) : (
          <BookingForm
            event={event}
            groupSessionId={event.groupSessionId}
            onSuccess={handleBookingSuccess}
            onCancel={() => setShowBookingForm(false)}
          />
        )}
      </div>
    </div>
  );
}
