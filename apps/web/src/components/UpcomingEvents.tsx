import Link from 'next/link';
import styles from './UpcomingEvents.module.css';
import { Event, EVENT_COLORS } from '@mss/shared';

interface UpcomingEventsProps {
  events: Event[];
}

export default function UpcomingEvents({ events }: UpcomingEventsProps) {
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (!events || events.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Ближайших мастер-классов пока нет</p>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <h2 className={styles.title}>Ближайшие мастер-классы</h2>
      <div className={styles.grid}>
        {events.map((event) => (
          <Link href={`/events/${event.id}`} key={event.id} className={styles.card}>
            <div
              className={styles.cardBadge}
              style={{ backgroundColor: EVENT_COLORS[event.type] }}
            >
              {event.type === 'MASTER_CLASS' && 'Мастер-класс'}
              {event.type === 'REGULAR_GROUP' && 'Группа'}
              {event.type === 'ONE_TIME_EVENT' && 'Событие'}
            </div>

            {event.imageUrl && (
              <div
                className={styles.cardImage}
                style={{ backgroundImage: `url(${event.imageUrl})` }}
              />
            )}

            <div className={styles.cardContent}>
              <h3>{event.title}</h3>
              <p className={styles.cardDate}>{formatDate(event.startDate)}</p>
              <p className={styles.cardDescription}>{event.description}</p>

              <div className={styles.cardFooter}>
                <span className={styles.cardPrice}>{event.price} ₽</span>
                <span className={styles.cardSeats}>
                  Мест: {event.maxParticipants - event.currentParticipants}
                </span>
              </div>

              <button className={styles.cardButton}>Записаться</button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
