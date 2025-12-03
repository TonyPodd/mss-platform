import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новость' })
  @ApiResponse({ status: 201, description: 'Новость успешно создана' })
  create(@Body() createNewsDto: CreateNewsDto) {
    return this.newsService.create(createNewsDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все новости' })
  findAll() {
    return this.newsService.findAll();
  }

  @Get('published')
  @ApiOperation({ summary: 'Получить опубликованные новости' })
  findPublished() {
    return this.newsService.findPublished();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить новость по ID' })
  @ApiResponse({ status: 200, description: 'Новость найдена' })
  @ApiResponse({ status: 404, description: 'Новость не найдена' })
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить новость' })
  @ApiResponse({ status: 200, description: 'Новость обновлена' })
  @ApiResponse({ status: 404, description: 'Новость не найдена' })
  update(@Param('id') id: string, @Body() updateNewsDto: UpdateNewsDto) {
    return this.newsService.update(id, updateNewsDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить новость' })
  @ApiResponse({ status: 200, description: 'Новость удалена' })
  @ApiResponse({ status: 404, description: 'Новость не найдена' })
  remove(@Param('id') id: string) {
    return this.newsService.remove(id);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Опубликовать новость' })
  publish(@Param('id') id: string) {
    return this.newsService.publish(id);
  }

  @Post(':id/unpublish')
  @ApiOperation({ summary: 'Снять новость с публикации' })
  unpublish(@Param('id') id: string) {
    return this.newsService.unpublish(id);
  }
}
