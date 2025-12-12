import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateSessionsDto } from './dto/generate-sessions.dto';
import { CancelSessionDto } from './dto/cancel-session.dto';
import { SessionStatus } from '@prisma/client';

@Injectable()
export class GroupSessionsService {
  constructor(private prisma: PrismaService) {}

  async generateSessions(dto: GenerateSessionsDto) {
    const group = await this.prisma.regularGroup.findUnique({
      where: { id: dto.groupId },
    });

    if (!group) {
      throw new NotFoundException('Направление не найдено');
    }

    const schedule = group.schedule as any;
    if (!schedule || !schedule.daysOfWeek || !schedule.time) {
      throw new BadRequestException('Некорректное расписание направления');
    }

    const sessions = [];
    const currentDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();

      if (schedule.daysOfWeek.includes(dayOfWeek)) {
        const [hours, minutes] = schedule.time.split(':').map(Number);
        const sessionDate = new Date(currentDate);
        sessionDate.setHours(hours, minutes, 0, 0);

        // Проверяем, что занятие ещё не создано
        const existingSession = await this.prisma.groupSession.findFirst({
          where: {
            groupId: dto.groupId,
            date: sessionDate,
          },
        });

        if (!existingSession) {
          const session = await this.prisma.groupSession.create({
            data: {
              groupId: dto.groupId,
              date: sessionDate,
              duration: schedule.duration,
              status: SessionStatus.SCHEDULED,
            },
          });
          sessions.push(session);
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return sessions;
  }

  async getUpcomingSessions(groupId: string) {
    return this.prisma.groupSession.findMany({
      where: {
        groupId,
        date: {
          gte: new Date(),
        },
        status: {
          not: SessionStatus.CANCELLED,
        },
      },
      orderBy: {
        date: 'asc',
      },
      include: {
        group: {
          include: {
            master: true,
          },
        },
        bookings: true,
      },
    });
  }

  async getSessionById(id: string) {
    const session = await this.prisma.groupSession.findUnique({
      where: { id },
      include: {
        group: {
          include: {
            master: true,
          },
        },
        bookings: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Занятие не найдено');
    }

    return session;
  }

  async getAllSessions(startDate?: Date, endDate?: Date) {
    const where: any = {};

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    return this.prisma.groupSession.findMany({
      where,
      orderBy: {
        date: 'asc',
      },
      include: {
        group: {
          include: {
            master: true,
          },
        },
        bookings: true,
      },
    });
  }

  async cancelSession(id: string, dto: CancelSessionDto) {
    const session = await this.prisma.groupSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException('Занятие не найдено');
    }

    if (session.status === SessionStatus.COMPLETED) {
      throw new BadRequestException('Нельзя отменить завершённое занятие');
    }

    return this.prisma.groupSession.update({
      where: { id },
      data: {
        status: SessionStatus.CANCELLED,
        notes: dto.notes,
      },
    });
  }

  async deleteSession(id: string) {
    const session = await this.prisma.groupSession.findUnique({
      where: { id },
      include: {
        bookings: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Занятие не найдено');
    }

    if (session.bookings.length > 0) {
      throw new BadRequestException(
        'Нельзя удалить занятие с существующими записями. Отмените занятие вместо удаления.',
      );
    }

    return this.prisma.groupSession.delete({
      where: { id },
    });
  }
}
