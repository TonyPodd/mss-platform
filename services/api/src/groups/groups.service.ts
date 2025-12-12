import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { TasksService } from '../tasks/tasks.service';

@Injectable()
export class GroupsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => TasksService))
    private tasksService: TasksService,
  ) {}

  async create(createGroupDto: CreateGroupDto) {
    const { schedule, ...rest } = createGroupDto;

    const group = await this.prisma.regularGroup.create({
      data: {
        ...rest,
        schedule: schedule as any, // Prisma Json type
      },
      include: {
        master: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Автоматически генерируем занятия на 6 месяцев вперед
    if (group.isActive && schedule) {
      try {
        await this.tasksService.generateSessionsForGroup(group.id);
      } catch (error) {
        console.error('Ошибка при автоматической генерации занятий:', error);
        // Не прерываем создание направления
      }
    }

    return group;
  }

  async findAll() {
    return this.prisma.regularGroup.findMany({
      include: {
        master: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findActive() {
    return this.prisma.regularGroup.findMany({
      where: { isActive: true },
      include: {
        master: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const group = await this.prisma.regularGroup.findUnique({
      where: { id },
      include: {
        master: {
          select: {
            id: true,
            name: true,
            bio: true,
            avatarUrl: true,
            specializations: true,
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Направление не найдено');
    }

    return group;
  }

  async update(id: string, updateGroupDto: UpdateGroupDto) {
    try {
      const { schedule, ...rest } = updateGroupDto;
      const data: any = { ...rest };

      if (schedule) {
        data.schedule = schedule as any; // Prisma Json type
      }

      return await this.prisma.regularGroup.update({
        where: { id },
        data,
        include: {
          master: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      });
    } catch (error) {
      throw new NotFoundException('Направление не найдено');
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.regularGroup.delete({
        where: { id },
      });
      return { message: 'Направление успешно удалено' };
    } catch (error) {
      throw new NotFoundException('Направление не найдено');
    }
  }

  async toggleActive(id: string) {
    const group = await this.findOne(id);
    return this.prisma.regularGroup.update({
      where: { id },
      data: { isActive: !group.isActive },
    });
  }
}
