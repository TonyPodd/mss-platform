'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '../../../../lib/api';
import styles from './sessions.module.css';

interface Participant {
  id: string;
  userId: string;
  participants: any[];
  contactEmail: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  subscription: {
    remainingBalance: number;
    status: string;
  };
}

interface Session {
  id: string;
  date: Date;
  duration: number;
  status: string;
  currentParticipants: number;
  group?: {
    id: string;
    name: string;
    maxParticipants: number;
  };
}

export default function GroupSessionsPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params?.id as string;

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [sessionToCancel, setSessionToCancel] = useState<Session | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (groupId) {
      loadSessions();
    }
  }, [groupId]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await apiClient.groupSessions.getUpcomingSessions(groupId);
      setSessions(data);
    } catch (error) {
      console.error('Ошибка загрузки занятий:', error);
      alert('Не удалось загрузить список занятий');
    } finally {
      setLoading(false);
    }
  };

  const loadParticipants = async (sessionId: string) => {
    try {
      setLoadingParticipants(true);
      const data = await apiClient.groupSessions.getSessionParticipants(sessionId);
      setParticipants(data.participants);
      setSelectedSession(sessionId);
    } catch (error) {
      console.error('Ошибка загрузки участников:', error);
      alert('Не удалось загрузить список участников');
    } finally {
      setLoadingParticipants(false);
    }
  };

  const handleCancelSession = async () => {
    if (!sessionToCancel || !cancelReason.trim()) {
      alert('Укажите причину отмены занятия');
      return;
    }

    try {
      setCancelling(true);
      await apiClient.groupSessions.cancelSession(sessionToCancel.id, cancelReason);
      alert('Занятие отменено. Участникам отправлены уведомления на email.');
      setShowCancelDialog(false);
      setSessionToCancel(null);
      setCancelReason('');
      await loadSessions();
    } catch (error: any) {
      console.error('Ошибка отмены занятия:', error);
      alert(error.response?.data?.message || 'Не удалось отменить занятие');
    } finally {
      setCancelling(false);
    }
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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      SCHEDULED: 'Запланировано',
      COMPLETED: 'Завершено',
      CANCELLED: 'Отменено',
    };
    return labels[status] || status;
  };

  const getStatusClass = (status: string) => {
    const classes: Record<string, string> = {
      SCHEDULED: styles.statusScheduled,
      COMPLETED: styles.statusCompleted,
      CANCELLED: styles.statusCancelled,
    };
    return classes[status] || '';
  };

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Управление занятиями направления</h1>
        <button onClick={() => router.back()} className={styles.backButton}>
          ← Назад
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className={styles.empty}>
          <p>Нет предстоящих занятий</p>
        </div>
      ) : (
        <div className={styles.sessionsGrid}>
          {sessions.map((session) => (
            <div key={session.id} className={styles.sessionCard}>
              <div className={styles.sessionHeader}>
                <h3>{formatDate(session.date)}</h3>
                <span className={`${styles.status} ${getStatusClass(session.status)}`}>
                  {getStatusLabel(session.status)}
                </span>
              </div>

              <div className={styles.sessionInfo}>
                <p>Длительность: {session.duration} минут</p>
                <p>
                  Участников: {session.currentParticipants} / {session.group?.maxParticipants || '?'}
                </p>
              </div>

              <div className={styles.sessionActions}>
                <button
                  onClick={() => loadParticipants(session.id)}
                  className={styles.btnView}
                  disabled={loadingParticipants}
                >
                  {selectedSession === session.id && !loadingParticipants
                    ? 'Скрыть участников'
                    : 'Показать участников'}
                </button>
                {session.status === 'SCHEDULED' && (
                  <button
                    onClick={() => {
                      setSessionToCancel(session);
                      setShowCancelDialog(true);
                    }}
                    className={styles.btnCancel}
                  >
                    Отменить занятие
                  </button>
                )}
              </div>

              {selectedSession === session.id && (
                <div className={styles.participantsList}>
                  {loadingParticipants ? (
                    <p className={styles.loadingText}>Загрузка участников...</p>
                  ) : participants.length === 0 ? (
                    <p className={styles.emptyText}>Нет зачисленных участников</p>
                  ) : (
                    <table className={styles.participantsTable}>
                      <thead>
                        <tr>
                          <th>Имя</th>
                          <th>Email</th>
                          <th>Телефон</th>
                          <th>Участники</th>
                          <th>Баланс абонемента</th>
                        </tr>
                      </thead>
                      <tbody>
                        {participants.map((participant) => (
                          <tr key={participant.id}>
                            <td>
                              {participant.user.firstName} {participant.user.lastName}
                            </td>
                            <td>{participant.user.email}</td>
                            <td>{participant.user.phone || '—'}</td>
                            <td>
                              {participant.participants.map((p: any, idx: number) => (
                                <div key={idx}>{p.fullName}</div>
                              ))}
                            </td>
                            <td>
                              {participant.subscription.remainingBalance.toFixed(2)} ₽
                              <br />
                              <span className={styles.subscriptionStatus}>
                                ({participant.subscription.status})
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showCancelDialog && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Отмена занятия</h2>
            <p>
              Вы действительно хотите отменить занятие{' '}
              {sessionToCancel && formatDate(sessionToCancel.date)}?
            </p>
            <p className={styles.warningText}>
              Всем зачисленным участникам будет отправлено уведомление на email.
            </p>

            <div className={styles.formGroup}>
              <label>Причина отмены *</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Например: В связи с новогодними праздниками занятие отменено"
                rows={4}
                className={styles.textarea}
              />
            </div>

            <div className={styles.modalActions}>
              <button
                onClick={handleCancelSession}
                disabled={cancelling || !cancelReason.trim()}
                className={styles.btnConfirm}
              >
                {cancelling ? 'Отмена...' : 'Отменить занятие'}
              </button>
              <button
                onClick={() => {
                  setShowCancelDialog(false);
                  setSessionToCancel(null);
                  setCancelReason('');
                }}
                disabled={cancelling}
                className={styles.btnClose}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
