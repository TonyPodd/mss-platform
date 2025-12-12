'use client';

import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Calendar from '../../components/Calendar';
import EventModal from '../../components/EventModal';
import { apiClient } from '../../lib/api';
import { CalendarEvent, GroupSession } from '@mss/shared';
import styles from './calendar.module.css';

// Преобразовать GroupSession в формат CalendarEvent для календаря
function transformSessionToEvent(session: any): CalendarEvent {
  const group = session.group;
  return {
    id: session.id,
    groupSessionId: session.id, // Сохраняем ID занятия для записи
    title: group.name,
    description: group.description,
    startDate: new Date(session.date),
    endDate: new Date(new Date(session.date).getTime() + session.duration * 60000),
    price: group.price,
    maxParticipants: group.maxParticipants,
    currentParticipants: session.currentParticipants,
    type: 'REGULAR_GROUP' as any,
    status: session.status === 'CANCELLED' ? 'CANCELLED' : 'PUBLISHED',
    imageUrl: group.imageUrl,
    masterId: group.masterId,
    createdAt: new Date(session.createdAt),
    updatedAt: new Date(session.updatedAt),
  } as CalendarEvent;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      // Загружаем события и занятия направлений параллельно
      const [masterClassEvents, groupSessions] = await Promise.all([
        apiClient.events.getUpcoming(100),
        apiClient.groupSessions.getAllSessions(new Date(), new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)), // 6 месяцев вперёд
      ]);

      // Преобразуем занятия в формат Event
      const sessionEvents = groupSessions
        .filter(session => session.status !== 'CANCELLED')
        .map(transformSessionToEvent);

      // Объединяем и сортируем по дате
      const allEvents = [...masterClassEvents, ...sessionEvents].sort((a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );

      setEvents(allEvents);
    } catch (error) {
      console.error('Ошибка загрузки событий:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1>Календарь мероприятий</h1>
            <p>Выберите удобную дату и запишитесь на мастер-класс или занятие</p>
          </div>

          {loading ? (
            <div className={styles.loading}>Загрузка календаря...</div>
          ) : (
            <Calendar events={events} onEventClick={handleEventClick} />
          )}
        </div>
      </main>
      <Footer />

      <EventModal event={selectedEvent} onClose={handleCloseModal} />
    </>
  );
}
