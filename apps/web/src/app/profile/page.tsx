'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import { Subscription, Booking, SubscriptionType, GroupEnrollment } from '@mss/shared';
import Header from '../../components/Header';
import styles from './profile.module.css';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, refreshUser, activeSubscription } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [enrollments, setEnrollments] = useState<GroupEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    age: '',
  });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'bookings' | 'enrollments'>('subscriptions');
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
      const [subs, bookingHistory, myEnrollments] = await Promise.all([
        apiClient.users.getSubscriptions(),
        apiClient.users.getBookingHistory(),
        apiClient.groupEnrollments.getMyEnrollments(),
      ]);
      setSubscriptions(subs);
      setBookings(bookingHistory);
      setEnrollments(myEnrollments);
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
                    <span className={styles.infoLabel}>Имя:</span>
                    <span className={styles.infoValue}>{user.firstName}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Фамилия:</span>
                    <span className={styles.infoValue}>{user.lastName}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Email:</span>
                    <span className={styles.infoValue}>{user.email}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Телефон:</span>
                    <span className={styles.infoValue}>{user.phone || 'Не указан'}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Возраст:</span>
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
                className={`${styles.tab} ${activeTab === 'subscriptions' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('subscriptions')}
              >
                Абонементы ({subscriptions.length})
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'bookings' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('bookings')}
              >
                История записей ({bookings.length})
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'enrollments' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('enrollments')}
              >
                Мои направления ({enrollments.filter(e => e.status === 'ACTIVE').length})
              </button>
            </div>

            <div className={styles.tabContent}>
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
                              Использовано: {(subscription.totalBalance - subscription.remainingBalance).toFixed(2)} ₽ из {subscription.totalBalance.toFixed(2)} ₽
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
                    bookings.map((booking) => (
                      <div key={booking.id} className={styles.listCard}>
                        <div className={styles.listCardHeader}>
                          <div>
                            <h3 className={styles.listCardTitle}>Запись на мастер-класс</h3>
                            <p className={styles.listCardSubtitle}>
                              {booking.participantsCount} участник(ов) •
                              {booking.paymentMethod === 'SUBSCRIPTION' ? ' Абонемент' : ' Оплата на месте'}
                            </p>
                          </div>
                          {getBookingStatusBadge(booking.status)}
                        </div>
                        <div className={styles.listCardFooter}>
                          <span>Дата записи: {formatDate(booking.createdAt)}</span>
                        </div>
                      </div>
                    ))
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
                        <div key={enrollment.id} className={styles.listCard}>
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
                      ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>

      {showPurchaseModal && (
        <div className={styles.modalOverlay} onClick={() => setShowPurchaseModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Выберите абонемент</h2>
              <button className={styles.modalClose} onClick={() => setShowPurchaseModal(false)}>
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              {subscriptionTypes.length === 0 ? (
                <p>Нет доступных абонементов</p>
              ) : (
                <div className={styles.subscriptionTypesGrid}>
                  {subscriptionTypes.map((type) => (
                    <div key={type.id} className={styles.typeCard}>
                      <h3 className={styles.typeName}>{type.name}</h3>
                      <div className={styles.typePrice}>{type.price} ₽</div>
                      <p className={styles.typeDescription}>{type.description}</p>
                      <div className={styles.typeFeatures}>
                        <div className={styles.typeFeature}>
                          💳 Баланс: {type.amount.toFixed(2)} ₽
                        </div>
                        <div className={styles.typeFeature}>
                          ⏰ {formatDuration(type.durationDays)}
                        </div>
                        <div className={styles.typeFeature}>
                          🎁 Скидка 10% при оплате занятий
                        </div>
                      </div>
                      <button
                        className={styles.typePurchaseButton}
                        onClick={() => handlePurchase(type.id)}
                        disabled={purchasing === type.id}
                      >
                        {purchasing === type.id ? 'Покупка...' : 'Купить'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
