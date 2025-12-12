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
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getEventTypeName = (type: string) => {
    switch (type) {
      case 'MASTER_CLASS':
        return 'Мастер-класс';
      case 'REGULAR_GROUP':
        return 'Постоянная группа';
      case 'ONE_TIME_EVENT':
        return 'Разовое событие';
      default:
        return type;
    }
  };

  const availableSeats = event.maxParticipants - event.currentParticipants;
  const isFull = availableSeats <= 0;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>

        {!showBookingForm ? (
          <>
            {event.imageUrl && (
              <div
                className={styles.modalImage}
                style={{ backgroundImage: `url(${getImageUrl(event.imageUrl)})` }}
              />
            )}

            <div className={styles.modalContent}>
              <div
                className={styles.badge}
                style={{ backgroundColor: EVENT_COLORS[event.type] }}
              >
                {getEventTypeName(event.type)}
              </div>

              <h2 className={styles.title}>{event.title}</h2>

              <div className={styles.info}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Дата и время:</span>
                  <span className={styles.infoValue}>{formatDate(event.startDate)}</span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Стоимость:</span>
                  <span className={styles.infoPrice}>{event.price} ₽</span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Доступно мест:</span>
                  <span className={`${styles.infoValue} ${isFull ? styles.noSeats : ''}`}>
                    {isFull ? 'Мест нет' : `${availableSeats} из ${event.maxParticipants}`}
                  </span>
                </div>
              </div>

              <div className={styles.description}>
                <h3>Описание</h3>
                <p>{event.description}</p>
              </div>

              {!isFull && (
                <button
                  className={styles.registerButton}
                  onClick={() => setShowBookingForm(true)}
                >
                  {event.groupSessionId ? 'Записаться на занятие' : 'Записаться на мастер-класс'}
                </button>
              )}

              {isFull && (
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
