'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import { Subscription, Booking, SubscriptionType, GroupEnrollment, Order, PaymentMethod } from '@mss/shared';
import Header from '../../components/Header';
import styles from './profile.module.css';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, refreshUser, activeSubscription, refreshSubscription } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [enrollments, setEnrollments] = useState<GroupEnrollment[]>([]);
  const [expandedEnrollment, setExpandedEnrollment] = useState<string | null>(null);
  const [enrollmentSessions, setEnrollmentSessions] = useState<Record<string, any[]>>({});
  const [loadingSessions, setLoadingSessions] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    age: '',
  });
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderQR, setSelectedOrderQR] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'bookings' | 'upcoming' | 'enrollments' | 'orders'>('upcoming');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [subscriptionTypes, setSubscriptionTypes] = useState<SubscriptionType[]>([]);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) {
      setEditForm({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
        age: user.age ? String(user.age) : '',
      });
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [subs, bookingHistory, upcoming, myEnrollments, myOrders] = await Promise.all([
        apiClient.users.getSubscriptions(),
        apiClient.users.getBookingHistory(),
        apiClient.bookings.getMyUpcoming(),
        apiClient.groupEnrollments.getMyEnrollments(),
        user ? apiClient.orders.getMyOrders(user.id) : Promise.resolve([]),
      ]);
      setSubscriptions(subs);
      setBookings(bookingHistory);
      setUpcomingBookings(upcoming);
      setEnrollments(myEnrollments);
      setOrders(myOrders);
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (user) {
      setEditForm({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
        age: user.age ? String(user.age) : '',
      });
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await apiClient.users.updateProfile({
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phone: editForm.phone || undefined,
        age: editForm.age ? parseInt(editForm.age) : undefined,
      });
      await refreshUser();
      setIsEditing(false);
      alert('Профиль успешно обновлен');
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
      alert('Не удалось обновить профиль');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      ACTIVE: { label: 'Активен', className: styles.statusActive },
      DEPLETED: { label: 'Исчерпан', className: styles.statusDepleted },
      EXPIRED: { label: 'Истёк', className: styles.statusExpired },
    };
    const statusInfo = statusMap[status] || { label: status, className: '' };
    return <span className={`${styles.statusBadge} ${statusInfo.className}`}>{statusInfo.label}</span>;
  };

  const getBookingStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      PENDING: { label: 'Ожидает', className: styles.bookingPending },
      CONFIRMED: { label: 'Подтверждена', className: styles.bookingConfirmed },
      CANCELLED: { label: 'Отменена', className: styles.bookingCancelled },
      COMPLETED: { label: 'Завершена', className: styles.bookingCompleted },
    };
    const statusInfo = statusMap[status] || { label: status, className: '' };
    return <span className={`${styles.statusBadge} ${statusInfo.className}`}>{statusInfo.label}</span>;
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'Не указано';
    return new Date(date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const loadSubscriptionTypes = async () => {
    try {
      const types = await apiClient.subscriptionTypes.getActive();
      setSubscriptionTypes(types);
    } catch (error) {
      console.error('Ошибка загрузки типов абонементов:', error);
    }
  };

  const handlePurchaseClick = async () => {
    setShowPurchaseModal(true);
    await loadSubscriptionTypes();
  };

  const handlePurchase = async (typeId: string) => {
    try {
      setPurchasing(typeId);
      await apiClient.users.purchaseSubscription(typeId);
      alert('Абонемент успешно приобретён!');
      await loadData();
      await refreshSubscription();
      setShowPurchaseModal(false);
    } catch (error: any) {
      console.error('Ошибка покупки абонемента:', error);
      alert(error.response?.data?.message || 'Не удалось приобрести абонемент');
    } finally {
      setPurchasing(null);
    }
  };

  const formatDuration = (days?: number) => {
    if (!days) return 'Бессрочный';
    if (days === 30) return '1 месяц';
    if (days === 60) return '2 месяца';
    if (days === 90) return '3 месяца';
    return `${days} дней`;
  };

  const handleCancelEnrollment = async (enrollmentId: string) => {
    if (!confirm('Вы уверены, что хотите отменить запись на это направление?')) {
      return;
    }

    try {
      await apiClient.groupEnrollments.cancelEnrollment(enrollmentId);
      alert('Вы успешно отписались от направления');
      await loadData();
    } catch (error: any) {
      console.error('Ошибка отмены зачисления:', error);
      alert(error.response?.data?.message || 'Не удалось отменить запись');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Вы уверены, что хотите отменить участие в этом занятии?')) {
      return;
    }

    try {
      await apiClient.bookings.cancel(bookingId);
      alert('Запись успешно отменена');
      await loadData();
      // Обновляем список занятий для открытого направления
      if (expandedEnrollment) {
        const sessions = await apiClient.groupEnrollments.getUpcomingSessions(expandedEnrollment);
        setEnrollmentSessions(prev => ({ ...prev, [expandedEnrollment]: sessions }));
      }
    } catch (error: any) {
      console.error('Ошибка отмены записи:', error);
      alert(error.response?.data?.message || 'Не удалось отменить запись');
    }
  };


  const formatDateTime = (date: string | Date | undefined) => {
    if (!date) return 'Не указано';
    return new Date(date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleEnrollmentSessions = async (enrollmentId: string) => {
    if (expandedEnrollment === enrollmentId) {
      setExpandedEnrollment(null);
      return;
    }

    setExpandedEnrollment(enrollmentId);

    // Если уже загружали - не загружаем повторно
    if (enrollmentSessions[enrollmentId]) {
      return;
    }

    setLoadingSessions(enrollmentId);
    try {
      const sessions = await apiClient.groupEnrollments.getUpcomingSessions(enrollmentId);
      setEnrollmentSessions(prev => ({ ...prev, [enrollmentId]: sessions }));
    } catch (error) {
      console.error('Ошибка загрузки занятий:', error);
      alert('Не удалось загрузить список занятий');
    } finally {
      setLoadingSessions(null);
    }
  };


  if (isLoading || loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Header />
      <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.profileHeader}>
          <div className={styles.avatarLarge}>
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div className={styles.userInfo}>
            <h1 className={styles.userName}>{user.firstName} {user.lastName}</h1>
            <p className={styles.userEmail}>{user.email}</p>
            <div className={styles.profileStats}>
              {activeSubscription ? (
                <>
                  <span className={`${styles.statChip} ${styles.active}`}>
                    ✓ Абонемент активен
                  </span>
                  <span className={styles.statChip}>
                    💳 {activeSubscription.remainingBalance.toFixed(0)} ₽
                  </span>
                  <span className={styles.statChip}>
                    🎁 Скидка 10%
                  </span>
                </>
              ) : (
                <span className={styles.statChip}>
                  Нет активного абонемента
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.grid}>
          {/* Левая колонка - Информация о профиле */}
          <div className={styles.leftColumn}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Личная информация</h2>
                {!isEditing && (
                  <button onClick={handleEdit} className={styles.editButton}>
                    Редактировать
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className={styles.editForm}>
                  <div className={styles.formGroup}>
                    <label>Имя</label>
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Фамилия</label>
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Телефон</label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="+7 (999) 123-45-67"
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Возраст</label>
                    <input
                      type="number"
                      min="0"
                      max="150"
                      value={editForm.age}
                      onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                      placeholder="Например, 25"
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.editActions}>
                    <button
                      onClick={handleCancelEdit}
                      className={styles.cancelButton}
                      disabled={saving}
                    >
                      Отмена
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className={styles.saveButton}
                      disabled={saving}
                    >
                      {saving ? 'Сохранение...' : 'Сохранить'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.profileInfo}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Email</span>
                    <span className={`${styles.infoValue} ${styles.verified}`}>{user.email}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Телефон</span>
                    <span className={styles.infoValue}>{user.phone || 'Не указан'}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Возраст</span>
                    <span className={styles.infoValue}>{user.age || 'Не указан'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Правая колонка - Табы */}
          <div className={styles.rightColumn}>
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === 'upcoming' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('upcoming')}
              >
                Предстоящие
                <span className={styles.tabBadge}>{upcomingBookings.length}</span>
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'subscriptions' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('subscriptions')}
              >
                Абонемент
                <span className={styles.tabBadge}>{subscriptions.length}</span>
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'enrollments' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('enrollments')}
              >
                Направления
                <span className={styles.tabBadge}>{enrollments.filter(e => e.status === 'ACTIVE').length}</span>
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'bookings' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('bookings')}
              >
                История
                <span className={styles.tabBadge}>{bookings.length}</span>
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'orders' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                Заказы
                <span className={styles.tabBadge}>{orders.length}</span>
              </button>
            </div>

            <div className={styles.tabContent}>
              {activeTab === 'upcoming' && (
                <div className={styles.upcomingList}>
                  {upcomingBookings.length === 0 ? (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIcon}>📅</div>
                      <p>У вас нет предстоящих занятий</p>
                    </div>
                  ) : (
                    upcomingBookings.map((booking) => {
                      const eventDate = booking.event?.startDate || booking.groupSession?.date;
                      const eventTitle = booking.event?.title || booking.groupSession?.group?.name || 'Занятие';
                      const isGroupSession = !!booking.groupSessionId;

                      return (
                        <div key={booking.id} className={styles.listCard}>
                          <div className={styles.listCardHeader}>
                            <div>
                              <h3 className={styles.listCardTitle}>
                                {eventTitle}
                              </h3>
                              <p className={styles.listCardSubtitle}>
                                {formatDateTime(eventDate)}
                                {isGroupSession && ' • Занятие направления'}
                              </p>
                              <p className={styles.listCardSubtitle}>
                                Участников: {booking.participantsCount} • {booking.totalPrice.toFixed(2)} ₽
                              </p>
                            </div>
                            {getBookingStatusBadge(booking.status)}
                          </div>
                          <div className={styles.listCardFooter}>
                            <span>
                              {booking.status === 'PENDING' && 'Деньги будут списаны за день до занятия'}
                              {booking.status === 'CONFIRMED' && 'Деньги списаны, вы записаны на занятие'}
                            </span>
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className={styles.cancelButton}
                            >
                              Отменить участие
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {activeTab === 'subscriptions' && (
                <div className={styles.subscriptionsList}>
                  <button onClick={handlePurchaseClick} className={styles.purchaseButton}>
                    Купить новый абонемент
                  </button>

                  {subscriptions.length === 0 ? (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIcon}>📋</div>
                      <p>У вас пока нет абонементов</p>
                    </div>
                  ) : (
                    subscriptions.map((subscription) => (
                      <div key={subscription.id} className={styles.listCard}>
                        <div className={styles.listCardHeader}>
                          <div>
                            <h3 className={styles.listCardTitle}>
                              {subscription.name}
                            </h3>
                            <p className={styles.listCardSubtitle}>
                              Доступно: {subscription.remainingBalance.toFixed(2)} ₽ • Всего пополнено: {subscription.totalBalance.toFixed(2)} ₽
                            </p>
                          </div>
                          {getStatusBadge(subscription.status)}
                        </div>
                        <div className={styles.listCardFooter}>
                          <span>Действителен до: {subscription.expiresAt ? formatDate(subscription.expiresAt) : 'Бессрочный'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'bookings' && (
                <div className={styles.bookingsList}>
                  {bookings.length === 0 ? (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIcon}>📅</div>
                      <p>У вас пока нет записей на мастер-классы</p>
                    </div>
                  ) : (
                    bookings.map((booking) => {
                      const eventTitle = booking.event?.title || booking.groupSession?.group?.name || 'Занятие';
                      const eventDate = booking.event?.startDate || booking.groupSession?.date;

                      return (
                        <div key={booking.id} className={styles.listCard}>
                          <div className={styles.listCardHeader}>
                            <div>
                              <h3 className={styles.listCardTitle}>{eventTitle}</h3>
                              <p className={styles.listCardSubtitle}>
                                {eventDate ? formatDateTime(eventDate) : formatDate(booking.createdAt)} •
                                {booking.participantsCount} участник(ов) •
                                {booking.paymentMethod === 'SUBSCRIPTION' ? ' Абонемент' : ' Оплата на месте'}
                              </p>
                            </div>
                            {getBookingStatusBadge(booking.status)}
                          </div>
                          <div className={styles.listCardFooter}>
                            <span>Записались: {formatDate(booking.createdAt)}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {activeTab === 'enrollments' && (
                <div className={styles.enrollmentsList}>
                  {enrollments.filter(e => e.status === 'ACTIVE').length === 0 ? (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIcon}>🎯</div>
                      <p>Вы пока не записаны ни на одно направление</p>
                    </div>
                  ) : (
                    enrollments
                      .filter(e => e.status === 'ACTIVE')
                      .map((enrollment) => (
                        <div key={enrollment.id} className={styles.enrollmentCard}>
                          <div className={styles.listCard}>
                            <div className={styles.listCardHeader}>
                              <div>
                                <h3 className={styles.listCardTitle}>
                                  {enrollment.group?.name || 'Направление'}
                                </h3>
                                <p className={styles.listCardSubtitle}>
                                  {enrollment.participants.length} участник(ов)
                                  {enrollment.group?.schedule && ` • ${enrollment.group.schedule.time}`}
                                </p>
                              </div>
                              <div className={styles.enrollmentActions}>
                                <button
                                  onClick={() => toggleEnrollmentSessions(enrollment.id)}
                                  className={styles.viewSessionsButton}
                                >
                                  {expandedEnrollment === enrollment.id ? 'Скрыть занятия' : 'Показать занятия'}
                                </button>
                                <button
                                  onClick={() => handleCancelEnrollment(enrollment.id)}
                                  className={styles.cancelEnrollmentButton}
                                >
                                  Отписаться
                                </button>
                              </div>
                            </div>
                            <div className={styles.listCardFooter}>
                              <span>Дата записи: {formatDate(enrollment.createdAt)}</span>
                            </div>
                          </div>

                          {expandedEnrollment === enrollment.id && (
                            <div className={styles.sessionsList}>
                              {loadingSessions === enrollment.id ? (
                                <div className={styles.loadingText}>Загрузка занятий...</div>
                              ) : enrollmentSessions[enrollment.id]?.length === 0 ? (
                                <div className={styles.emptySessionsText}>
                                  Нет предстоящих занятий
                                </div>
                              ) : (
                                enrollmentSessions[enrollment.id]?.map((session) => (
                                  <div key={session.id} className={styles.sessionCard}>
                                    <div className={styles.sessionInfo}>
                                      <div className={styles.sessionDate}>
                                        {formatDateTime(session.date)}
                                      </div>
                                      <div className={styles.sessionDetails}>
                                        {session.duration} минут • {session.currentParticipants}/{session.maxParticipants} участников
                                      </div>
                                    </div>
                                    <div className={styles.sessionStatus}>
                                      <span className={styles.bookingStatus}>
                                        {session.booking?.status === 'CANCELLED'
                                          ? '✗ Отменено'
                                          : session.booking?.status === 'PENDING'
                                          ? '⏳ Ожидает'
                                          : '✓ Записаны'}
                                      </span>
                                      {session.booking && session.booking.status !== 'CANCELLED' && session.booking.status !== 'COMPLETED' && (
                                        <button
                                          onClick={() => handleCancelBooking(session.booking.id)}
                                          className={styles.cancelSessionButton}
                                        >
                                          Отменить
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      ))
                  )}
                </div>
              )}

              {activeTab === 'orders' && (
                <div className={styles.ordersList}>
                  {orders.length === 0 ? (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIcon}>🛍️</div>
                      <p>У вас пока нет заказов</p>
                    </div>
                  ) : (
                    orders.map((order: any) => {
                      const getOrderStatusBadge = (status: string) => {
                        const statusMap: Record<string, { label: string; className: string }> = {
                          PENDING: { label: 'Ожидает', className: styles.orderPending },
                          CONFIRMED: { label: 'Подтвержден', className: styles.orderConfirmed },
                          READY: { label: 'Готов к выдаче', className: styles.orderReady },
                          COMPLETED: { label: 'Выдан', className: styles.orderCompleted },
                          CANCELLED: { label: 'Отменен', className: styles.orderCancelled },
                        };
                        const statusInfo = statusMap[status] || { label: status, className: '' };
                        return <span className={`${styles.statusBadge} ${statusInfo.className}`}>{statusInfo.label}</span>;
                      };

                      return (
                        <div key={order.id} className={styles.listCard}>
                          <div className={styles.listCardHeader}>
                            <div>
                              <h3 className={styles.listCardTitle}>
                                Заказ от {formatDate(order.createdAt)}
                              </h3>
                              <p className={styles.listCardSubtitle}>
                                Товаров: {order.items?.length || 0} • Сумма: {order.totalAmount} ₽
                              </p>
                              <div className={styles.orderItems}>
                                {order.items?.map((item: any) => (
                                  <div key={item.id} className={styles.orderItem}>
                                    {item.product?.name} × {item.quantity} = {item.price * item.quantity} ₽
                                  </div>
                                ))}
                              </div>
                            </div>
                            {getOrderStatusBadge(order.status)}
                          </div>
                          <div className={styles.listCardFooter}>
                            <span>
                              {order.status === 'PENDING' && 'Заказ принят, ожидает подтверждения'}
                              {order.status === 'CONFIRMED' && 'Заказ подтвержден, готовится'}
                              {order.status === 'READY' && 'Заказ готов к выдаче. Покажите QR-код'}
                              {order.status === 'COMPLETED' && 'Заказ выдан'}
                            </span>
                            {(order.status === 'READY' || order.status === 'CONFIRMED') && (
                              <button
                                onClick={async () => {
                                  try {
                                    const { qrCode } = await apiClient.orders.getQRCode(order.id);
                                    setSelectedOrderQR(qrCode);
                                  } catch (error) {
                                    console.error('Ошибка загрузки QR-кода:', error);
                                    alert('Не удалось загрузить QR-код');
                                  }
                                }}
                                className={styles.viewQRButton}
                              >
                                Показать QR-код
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>

      {selectedOrderQR && (
        <div className={styles.modalOverlay} onClick={() => setSelectedOrderQR(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>QR-код для получения заказа</h2>
              <button className={styles.modalClose} onClick={() => setSelectedOrderQR(null)}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.qrInfo}>
                Покажите этот QR-код администратору для получения заказа
              </p>
              <div className={styles.qrCodeContainer}>
                <img src={selectedOrderQR} alt="QR код заказа" className={styles.qrCodeImage} />
              </div>
            </div>
          </div>
        </div>
      )}

      {showPurchaseModal && (
        <div className={styles.modalOverlay} onClick={() => setShowPurchaseModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Приобрести абонемент</h2>
              <button className={styles.modalClose} onClick={() => setShowPurchaseModal(false)}>
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              {subscriptionTypes.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>💳</div>
                  <p>В данный момент нет доступных абонементов</p>
                </div>
              ) : (
                <>
                  <p style={{ marginBottom: '1.5rem', color: '#6b5b52', lineHeight: '1.6' }}>
                    Абонемент дает вам баланс для оплаты занятий со скидкой 10%.
                    Выберите подходящий вариант:
                  </p>
                  <div className={styles.subscriptionTypesGrid}>
                    {subscriptionTypes.map((type) => {
                      const discount = type.amount - type.price;
                      const discountPercent = ((discount / type.amount) * 100).toFixed(0);

                      return (
                        <div key={type.id} className={styles.typeCard}>
                          <h3 className={styles.typeName}>{type.name}</h3>
                          <div className={styles.typePrice}>{type.price} ₽</div>
                          {type.description && (
                            <p className={styles.typeDescription}>{type.description}</p>
                          )}
                          <div className={styles.typeFeatures}>
                            <div className={styles.typeFeature}>
                              💳 Баланс на счете: {type.amount.toFixed(0)} ₽
                            </div>
                            <div className={styles.typeFeature}>
                              🎁 Экономия: {discount.toFixed(0)} ₽ ({discountPercent}%)
                            </div>
                            <div className={styles.typeFeature}>
                              ⏰ Срок действия: {formatDuration(type.durationDays)}
                            </div>
                            <div className={styles.typeFeature}>
                              ✓ Скидка 10% на все занятия
                            </div>
                          </div>
                          <button
                            className={styles.typePurchaseButton}
                            onClick={() => handlePurchase(type.id)}
                            disabled={purchasing === type.id}
                          >
                            {purchasing === type.id ? 'Оформление...' : `Купить за ${type.price} ₽`}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
