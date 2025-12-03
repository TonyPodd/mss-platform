import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  async create(createNewsDto: CreateNewsDto) {
    const data: any = { ...createNewsDto };

    // Если публикуется сразу, установить publishedAt
    if (createNewsDto.isPublished) {
      data.publishedAt = new Date();
    }

    return this.prisma.news.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.news.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findPublished() {
    return this.prisma.news.findMany({
      where: {
        isPublished: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const news = await this.prisma.news.findUnique({
      where: { id },
    });

    if (!news) {
      throw new NotFoundException(`News with ID ${id} not found`);
    }

    return news;
  }

  async update(id: string, updateNewsDto: UpdateNewsDto) {
    await this.findOne(id); // проверка существования

    const data: any = { ...updateNewsDto };

    // Если публикуется впервые, установить publishedAt
    if (updateNewsDto.isPublished && !data.publishedAt) {
      const currentNews = await this.findOne(id);
      if (!currentNews.publishedAt) {
        data.publishedAt = new Date();
      }
    }

    return this.prisma.news.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // проверка существования

    return this.prisma.news.delete({
      where: { id },
    });
  }

  async publish(id: string) {
    const news = await this.findOne(id);

    return this.prisma.news.update({
      where: { id },
      data: {
        isPublished: true,
        publishedAt: news.publishedAt || new Date(),
      },
    });
  }

  async unpublish(id: string) {
    await this.findOne(id);

    return this.prisma.news.update({
      where: { id },
      data: {
        isPublished: false,
      },
    });
  }
}
