'use client';

import { useState, useEffect } from 'react';
import { CalendarEvent, BookingParticipant, PaymentMethod } from '@mss/shared';
import { apiClient } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { validatePhone } from '../lib/validation';
import Link from 'next/link';
import styles from './BookingForm.module.css';

interface BookingFormProps {
  event: CalendarEvent;
  groupSessionId?: string; // Если это занятие направления
  onSuccess: () => void;
  onCancel: () => void;
}

export default function BookingForm({ event, groupSessionId, onSuccess, onCancel }: BookingFormProps) {
  const { user, isAuthenticated, activeSubscription } = useAuth();
  const [loading, setLoading] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const isGroupSession = !!groupSessionId;
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    isGroupSession ? PaymentMethod.SUBSCRIPTION : PaymentMethod.ON_SITE
  );
  const [notes, setNotes] = useState('');
  const [participants, setParticipants] = useState<BookingParticipant[]>([
    { fullName: '', phone: '', age: undefined },
  ]);
  const [phoneErrors, setPhoneErrors] = useState<string[]>([]);

  const availableSeats = event.maxParticipants - event.currentParticipants;
  const totalPrice = event.price * participants.length;
  const discountedPrice = totalPrice * 0.9; // Скидка 10% при оплате через абонемент
  // Для направлений нужен только активный абонемент, баланс не проверяем (деньги списываются позже)
  const canUseSubscription = isGroupSession
    ? (isAuthenticated && activeSubscription && activeSubscription.remainingBalance > 0)
    : (isAuthenticated && activeSubscription && activeSubscription.remainingBalance >= discountedPrice);

  // Автозаполнение данных пользователя
  useEffect(() => {
    if (user) {
      // Заполняем email
      setContactEmail(user.email);

      // Заполняем данные первого участника
      const fullName = `${user.lastName} ${user.firstName}`;
      setParticipants([{
        fullName,
        phone: user.phone || '',
        age: user.age,
      }]);
    }
  }, [user]);

  const handleAddParticipant = () => {
    if (participants.length < availableSeats) {
      setParticipants([...participants, { fullName: '', phone: '', age: undefined }]);
    }
  };

  const handleRemoveParticipant = (index: number) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((_, i) => i !== index));
    }
  };

  const handleParticipantChange = (index: number, field: keyof BookingParticipant, value: string | number | undefined) => {
    const newParticipants = [...participants];
    if (field === 'fullName' || field === 'phone') {
      newParticipants[index][field] = value as string;
    } else if (field === 'age') {
      newParticipants[index][field] = value as number | undefined;
    }
    setParticipants(newParticipants);

    // Сбрасываем ошибку телефона при редактировании
    if (field === 'phone') {
      const newErrors = [...phoneErrors];
      newErrors[index] = '';
      setPhoneErrors(newErrors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Валидация участников
    const hasEmptyFields = participants.some(p => !p.fullName || !p.phone);
    if (hasEmptyFields) {
      alert('Пожалуйста, заполните ФИО и телефон для всех участников');
      setLoading(false);
      return;
    }

    // Валидация телефонов
    const errors: string[] = participants.map(p =>
      validatePhone(p.phone) ? '' : 'Введите корректный номер телефона (например, +7 999 123-45-67)'
    );

    if (errors.some(error => error !== '')) {
      setPhoneErrors(errors);
      setLoading(false);
      return;
    }

    try {
      await apiClient.bookings.create({
        eventId: groupSessionId ? undefined : event.id,
        groupSessionId: groupSessionId,
        participants,
        contactEmail,
        paymentMethod,
        notes,
        subscriptionId: paymentMethod === PaymentMethod.SUBSCRIPTION && activeSubscription ? activeSubscription.id : undefined,
      });

      alert(
        groupSessionId
          ? 'Вы успешно записались на занятие! Мы свяжемся с вами в ближайшее время.'
          : 'Вы успешно записались на мастер-класс! Мы свяжемся с вами в ближайшее время.'
      );
      onSuccess();
    } catch (error) {
      console.error('Ошибка при записи:', error);
      alert(`Не удалось записаться: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.form}>
      <h3 className={styles.title}>
        {groupSessionId ? 'Запись на занятие' : 'Запись на мастер-класс'}
      </h3>
      <p className={styles.eventTitle}>{event.title}</p>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="contactEmail">Email для связи *</label>
          <input
            type="email"
            id="contactEmail"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            required
            placeholder="example@mail.com"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Способ оплаты *</label>
          {isGroupSession ? (
            <div className={styles.paymentInfo}>
              <div className={styles.subscriptionRequired}>
                Для занятий направлений требуется активный абонемент
              </div>
              {canUseSubscription ? (
                <div className={styles.subscriptionActive}>
                  ✓ Оплата с абонемента (баланс: {activeSubscription?.remainingBalance.toFixed(2)} ₽)
                  <br />
                  <small>Деньги будут списываться за каждое занятие за день до его начала</small>
                </div>
              ) : (
                <div className={styles.subscriptionInactive}>
                  ✗ У вас нет активного абонемента.{' '}
                  <Link href="/profile" className={styles.loginLink}>
                    Приобрести абонемент
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.paymentMethods}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value={PaymentMethod.ON_SITE}
                  checked={paymentMethod === PaymentMethod.ON_SITE}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className={styles.radio}
                />
                <span>Оплата на месте</span>
              </label>

              {canUseSubscription ? (
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={PaymentMethod.SUBSCRIPTION}
                    checked={paymentMethod === PaymentMethod.SUBSCRIPTION}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className={styles.radio}
                  />
                  <span>
                    Оплата с абонемента (баланс: {activeSubscription?.remainingBalance.toFixed(2)} ₽, со скидкой 10%)
                  </span>
                </label>
              ) : (
                <label className={`${styles.radioLabel} ${styles.disabled}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={PaymentMethod.SUBSCRIPTION}
                    disabled
                    className={styles.radio}
                  />
                  <span>Оплата с абонемента (недоступно)</span>
                </label>
              )}
            </div>
          )}

          {!isGroupSession && !isAuthenticated && (
            <div className={styles.loginHint}>
              <Link href="/login" className={styles.loginLink}>
                Войдите в аккаунт
              </Link>
              {' '}для более выгодной оплаты по абонементу
            </div>
          )}

          {!isGroupSession && isAuthenticated && !activeSubscription && (
            <div className={styles.subscriptionHint}>
              У вас нет активного абонемента. Приобрести его можно в{' '}
              <Link href="/profile" className={styles.loginLink}>
                личном кабинете
              </Link>
            </div>
          )}

          {!isGroupSession && isAuthenticated && activeSubscription && activeSubscription.remainingBalance < discountedPrice && (
            <div className={styles.subscriptionHint}>
              На вашем абонементе осталось {activeSubscription.remainingBalance.toFixed(2)} ₽,
              недостаточно для записи (требуется {discountedPrice.toFixed(2)} ₽ со скидкой 10%)
            </div>
          )}
        </div>

        <div className={styles.participantsSection}>
          <div className={styles.participantsHeader}>
            <h4>Участники ({participants.length})</h4>
            {participants.length < availableSeats && (
              <button
                type="button"
                onClick={handleAddParticipant}
                className={styles.addButton}
              >
                + Добавить участника
              </button>
            )}
          </div>

          {participants.map((participant, index) => (
            <div key={index} className={styles.participantCard}>
              <div className={styles.participantHeader}>
                <span className={styles.participantNumber}>Участник {index + 1}</span>
                {participants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveParticipant(index)}
                    className={styles.removeButton}
                  >
                    ×
                  </button>
                )}
              </div>

              <div className={styles.participantFields}>
                <div className={styles.formGroup}>
                  <label htmlFor={`fullName-${index}`}>ФИО *</label>
                  <input
                    type="text"
                    id={`fullName-${index}`}
                    value={participant.fullName}
                    onChange={(e) => handleParticipantChange(index, 'fullName', e.target.value)}
                    required
                    placeholder="Иванов Иван Иванович"
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor={`phone-${index}`}>Телефон *</label>
                  <input
                    type="tel"
                    id={`phone-${index}`}
                    value={participant.phone}
                    onChange={(e) => handleParticipantChange(index, 'phone', e.target.value)}
                    required
                    placeholder="+7 (999) 123-45-67"
                    className={`${styles.input} ${phoneErrors[index] ? styles.inputError : ''}`}
                  />
                  {phoneErrors[index] && (
                    <span className={styles.errorMessage}>{phoneErrors[index]}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor={`age-${index}`}>Возраст</label>
                  <input
                    type="number"
                    id={`age-${index}`}
                    min="0"
                    max="150"
                    value={participant.age || ''}
                    onChange={(e) => handleParticipantChange(index, 'age', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Например, 25"
                    className={styles.input}
                  />
                </div>
              </div>
            </div>
          ))}

          <p className={styles.hint}>Доступно мест: {availableSeats - participants.length}</p>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="notes">Комментарий (необязательно)</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Дополнительная информация или пожелания..."
            className={styles.textarea}
          />
        </div>

        <div className={styles.priceInfo}>
          <div>
            <div className={styles.priceBreakdown}>
              <span>{event.price} ₽ × {participants.length} {participants.length === 1 ? 'участник' : 'участника'}</span>
            </div>
            {paymentMethod === PaymentMethod.SUBSCRIPTION && (
              <div className={styles.priceBreakdown}>
                <span>Скидка 10% при оплате через абонемент: -{(totalPrice * 0.1).toFixed(2)} ₽</span>
              </div>
            )}
            <div className={styles.priceTotal}>
              <span>Итого к оплате:</span>
              <span className={styles.price}>
                {paymentMethod === PaymentMethod.SUBSCRIPTION ? discountedPrice.toFixed(2) : totalPrice} ₽
              </span>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
            disabled={loading}
          >
            Отмена
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading || (isGroupSession && !canUseSubscription)}
          >
            {loading ? 'Отправка...' : 'Записаться'}
          </button>
        </div>
      </form>
    </div>
  );
}
