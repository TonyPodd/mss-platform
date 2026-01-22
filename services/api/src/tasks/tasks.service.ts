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

}
