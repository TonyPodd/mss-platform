import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MastersService } from './masters.service';
import { CreateMasterDto } from './dto/create-master.dto';
import { UpdateMasterDto } from './dto/update-master.dto';

@ApiTags('Masters')
@Controller('masters')
export class MastersController {
  constructor(private readonly mastersService: MastersService) {}

  @Post()
  @ApiOperation({ summary: 'Создать нового мастера' })
  @ApiResponse({ status: 201, description: 'Мастер успешно создан' })
  create(@Body() createMasterDto: CreateMasterDto) {
    return this.mastersService.create(createMasterDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список всех мастеров' })
  findAll() {
    return this.mastersService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Получить список активных мастеров' })
  findActive() {
    return this.mastersService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить мастера по ID' })
  @ApiResponse({ status: 200, description: 'Мастер найден' })
  @ApiResponse({ status: 404, description: 'Мастер не найден' })
  findOne(@Param('id') id: string) {
    return this.mastersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить информацию о мастере' })
  @ApiResponse({ status: 200, description: 'Мастер обновлен' })
  @ApiResponse({ status: 404, description: 'Мастер не найден' })
  update(@Param('id') id: string, @Body() updateMasterDto: UpdateMasterDto) {
    return this.mastersService.update(id, updateMasterDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить мастера' })
  @ApiResponse({ status: 200, description: 'Мастер удален' })
  @ApiResponse({ status: 404, description: 'Мастер не найден' })
  remove(@Param('id') id: string) {
    return this.mastersService.remove(id);
  }
}
