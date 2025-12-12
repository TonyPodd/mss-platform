import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { GroupSessionsService } from '../group-sessions/group-sessions.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private prisma: PrismaService,
    private groupSessionsService: GroupSessionsService,
  ) {}

  /**
   * Автоматическая генерация занятий для всех активных направлений
   * Запускается каждый день в 00:00
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generateGroupSessions() {
    this.logger.log('Начало автоматической генерации занятий для направлений');

    try {
      // Получаем все активные направления
      const activeGroups = await this.prisma.regularGroup.findMany({
        where: {
          isActive: true,
        },
      });

      if (activeGroups.length === 0) {
        this.logger.log('Нет активных направлений для генерации занятий');
        return;
      }

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 6); // Генерируем на 6 месяцев вперед

      let totalGenerated = 0;

      // Для каждого направления генерируем занятия
      for (const group of activeGroups) {
        try {
          const schedule = group.schedule as any;

          // Проверяем что расписание корректное
          if (!schedule || !schedule.daysOfWeek || !schedule.time) {
            this.logger.warn(
              `Направление "${group.name}" имеет некорректное расписание, пропускаем`,
            );
            continue;
          }

          const sessions = await this.groupSessionsService.generateSessions({
            groupId: group.id,
            startDate,
            endDate,
          });

          totalGenerated += sessions.length;
          this.logger.log(
            `Сгенерировано ${sessions.length} занятий для "${group.name}"`,
          );
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(
            `Ошибка при генерации занятий для "${group.name}": ${errorMessage}`,
          );
        }
      }

      this.logger.log(
        `Автоматическая генерация завершена. Всего создано ${totalGenerated} занятий для ${activeGroups.length} направлений`,
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Критическая ошибка при автоматической генерации занятий: ${errorMessage}`,
      );
    }
  }

  /**
   * Проверка и обновление статусов истекших абонементов
   * Запускается каждый день в 01:00
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async updateExpiredSubscriptions() {
    this.logger.log('Начало проверки истекших абонементов');

    try {
      // Найти все активные абонементы с истекшим сроком
      const expiredSubscriptions = await this.prisma.subscription.findMany({
        where: {
          status: 'ACTIVE',
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      if (expiredSubscriptions.length === 0) {
        this.logger.log('Нет истекших абонементов');
        return;
      }

      // Обновить статус всех истекших абонементов
      await this.prisma.subscription.updateMany({
        where: {
          status: 'ACTIVE',
          expiresAt: {
            lt: new Date(),
          },
        },
        data: {
          status: 'EXPIRED',
        },
      });

      this.logger.log(
        `Обновлено ${expiredSubscriptions.length} истекших абонементов`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Ошибка при обновлении истекших абонементов: ${errorMessage}`,
      );
    }
  }

  /**
   * Генерация занятий для конкретного направления
   * Используется при создании нового направления
   */
  async generateSessionsForGroup(groupId: string) {
    this.logger.log(`Генерация занятий для нового направления: ${groupId}`);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 6);

    try {
      const sessions = await this.groupSessionsService.generateSessions({
        groupId,
        startDate,
        endDate,
      });

      this.logger.log(
        `Создано ${sessions.length} занятий для направления ${groupId}`,
      );
      return sessions;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Ошибка при генерации занятий для направления ${groupId}: ${errorMessage}`,
      );
      throw error;
    }
  }

  /**
   * Автоматическое создание записей на занятия для зачисленных пользователей
   * Запускается каждый день в 02:00
   * Создает записи на занятия, которые начнутся через 3 дня
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async createBookingsForUpcomingSessions() {
    this.logger.log('Начало создания записей на предстоящие занятия направлений');

    try {
      // Находим все занятия, которые начнутся через 3 дня
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 3);
      targetDate.setHours(0, 0, 0, 0);

      const endOfTargetDate = new Date(targetDate);
      endOfTargetDate.setHours(23, 59, 59, 999);

      const upcomingSessions = await this.prisma.groupSession.findMany({
        where: {
          date: {
            gte: targetDate,
            lte: endOfTargetDate,
          },
          status: 'SCHEDULED',
        },
        include: {
          group: true,
        },
      });

      if (upcomingSessions.length === 0) {
        this.logger.log('Нет предстоящих занятий для создания записей');
        return;
      }

      let totalBookingsCreated = 0;
      let totalErrors = 0;

      // Для каждого занятия создаем записи для зачисленных пользователей
      for (const session of upcomingSessions) {
        try {
          // Находим всех активных зачисленных пользователей для этого направления
          const activeEnrollments = await this.prisma.groupEnrollment.findMany({
            where: {
              groupId: session.groupId,
              status: 'ACTIVE',
            },
            include: {
              user: true,
              subscription: true,
            },
          });

          for (const enrollment of activeEnrollments) {
            try {
              // Проверяем, есть ли уже запись на это занятие
              const existingBooking = await this.prisma.booking.findFirst({
                where: {
                  userId: enrollment.userId,
                  groupSessionId: session.id,
                },
              });

              if (existingBooking) {
                continue; // Запись уже существует
              }

              // Проверяем баланс абонемента
              if (!enrollment.subscription || enrollment.subscription.status !== 'ACTIVE') {
                this.logger.warn(
                  `У пользователя ${enrollment.user.email} нет активного абонемента для занятия ${session.id}`,
                );
                continue;
              }

              const price = session.group.price;
              const discountedPrice = price * 0.9; // Скидка 10% для направлений

              if (enrollment.subscription.remainingBalance < discountedPrice) {
                this.logger.warn(
                  `Недостаточно средств на абонементе пользователя ${enrollment.user.email} для занятия ${session.id}. Требуется: ${discountedPrice}, доступно: ${enrollment.subscription.remainingBalance}`,
                );
                continue;
              }

              // Создаем запись (но деньги пока не списываем)
              const participants = enrollment.participants as any[];
              await this.prisma.booking.create({
                data: {
                  userId: enrollment.userId,
                  groupSessionId: session.id,
                  subscriptionId: enrollment.subscriptionId,
                  participantsCount: participants.length,
                  totalPrice: discountedPrice,
                  paymentMethod: 'SUBSCRIPTION',
                  participants: enrollment.participants,
                  contactEmail: enrollment.contactEmail,
                  notes: 'Автоматическая запись на занятие направления',
                  status: 'PENDING',
                },
              });

              totalBookingsCreated++;
            } catch (error) {
              totalErrors++;
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              this.logger.error(
                `Ошибка при создании записи для пользователя ${enrollment.userId} на занятие ${session.id}: ${errorMessage}`,
              );
            }
          }
        } catch (error) {
          totalErrors++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(
            `Ошибка при обработке занятия ${session.id}: ${errorMessage}`,
          );
        }
      }

      this.logger.log(
        `Создание записей завершено. Обработано занятий: ${upcomingSessions.length}, создано записей: ${totalBookingsCreated}, ошибок: ${totalErrors}`,
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Критическая ошибка при создании записей на занятия: ${errorMessage}`,
      );
    }
  }

  /**
   * Списание средств за предстоящие занятия
   * Запускается каждый день в 03:00
   * Списывает деньги за занятия, которые начнутся завтра
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async chargeForUpcomingSessions() {
    this.logger.log('Начало списания средств за предстоящие занятия');

    try {
      // Находим все занятия, которые начнутся завтра
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const endOfTomorrow = new Date(tomorrow);
      endOfTomorrow.setHours(23, 59, 59, 999);

      // Находим все записи на эти занятия со статусом PENDING
      const pendingBookings = await this.prisma.booking.findMany({
        where: {
          status: 'PENDING',
          paymentMethod: 'SUBSCRIPTION',
          groupSessionId: {
            not: null,
          },
          groupSession: {
            date: {
              gte: tomorrow,
              lte: endOfTomorrow,
            },
            status: 'SCHEDULED',
          },
        },
        include: {
          subscription: true,
          user: true,
          groupSession: {
            include: {
              group: true,
            },
          },
        },
      });

      if (pendingBookings.length === 0) {
        this.logger.log('Нет записей для списания средств');
        return;
      }

      let totalCharged = 0;
      let totalCancelled = 0;
      let totalErrors = 0;

      for (const booking of pendingBookings) {
        try {
          // Проверяем баланс абонемента
          if (!booking.subscription || booking.subscription.status !== 'ACTIVE') {
            this.logger.warn(
              `Абонемент пользователя ${booking.user?.email} неактивен. Отменяем запись ${booking.id}`,
            );
            await this.prisma.booking.update({
              where: { id: booking.id },
              data: { status: 'CANCELLED', notes: 'Отменено: неактивный абонемент' },
            });
            totalCancelled++;
            continue;
          }

          if (booking.subscription.remainingBalance < booking.totalPrice) {
            this.logger.warn(
              `Недостаточно средств у пользователя ${booking.user?.email}. Отменяем запись ${booking.id}`,
            );
            await this.prisma.booking.update({
              where: { id: booking.id },
              data: { status: 'CANCELLED', notes: 'Отменено: недостаточно средств' },
            });
            totalCancelled++;
            continue;
          }

          // Списываем средства с абонемента
          await this.prisma.subscription.update({
            where: { id: booking.subscriptionId! },
            data: {
              remainingBalance: {
                decrement: booking.totalPrice,
              },
            },
          });

          // Обновляем статус записи на CONFIRMED
          await this.prisma.booking.update({
            where: { id: booking.id },
            data: { status: 'CONFIRMED' },
          });

          // Проверяем, нужно ли обновить статус абонемента
          const updatedSubscription = await this.prisma.subscription.findUnique({
            where: { id: booking.subscriptionId! },
          });

          if (updatedSubscription && updatedSubscription.remainingBalance <= 0) {
            await this.prisma.subscription.update({
              where: { id: booking.subscriptionId! },
              data: { status: 'DEPLETED' },
            });
          }

          totalCharged++;
        } catch (error) {
          totalErrors++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(
            `Ошибка при списании средств для записи ${booking.id}: ${errorMessage}`,
          );
        }
      }

      this.logger.log(
        `Списание средств завершено. Обработано записей: ${pendingBookings.length}, списано: ${totalCharged}, отменено: ${totalCancelled}, ошибок: ${totalErrors}`,
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Критическая ошибка при списании средств: ${errorMessage}`,
      );
    }
  }
}
