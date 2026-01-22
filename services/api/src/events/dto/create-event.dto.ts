import { IsString, IsEnum, IsDateString, IsNumber, IsOptional, IsArray, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventType, Difficulty } from '@prisma/client';

export class CreateEventDto {
  @ApiProperty({ description: 'Название события' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Описание события' })
  @IsString()
  description: string;

  @ApiProperty({ enum: EventType, description: 'Тип события' })
  @IsEnum(EventType)
  type: EventType;

  @ApiProperty({ description: 'Дата и время начала' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'Дата и время окончания' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ description: 'Максимальное количество участников' })
  @IsNumber()
  @Min(1)
  maxParticipants: number;

  @ApiProperty({ description: 'Цена' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: 'URL изображения' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Изображения результатов', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  resultImages?: string[];

  @ApiPropertyOptional({ description: 'Список материалов', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  materials?: string[];

  @ApiPropertyOptional({ enum: Difficulty, description: 'Уровень сложности' })
  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @ApiProperty({ description: 'ID мастера' })
  @IsString()
  masterId: string;
}
