import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMasterDto {
  @ApiProperty({ description: 'Имя мастера' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Биография' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: 'URL аватара' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'Ссылка на VK' })
  @IsOptional()
  @IsString()
  vkLink?: string;

  @ApiPropertyOptional({ description: 'Ссылка на Instagram' })
  @IsOptional()
  @IsString()
  instagramLink?: string;

  @ApiPropertyOptional({ description: 'Ссылка на Telegram' })
  @IsOptional()
  @IsString()
  telegramLink?: string;

  @ApiProperty({ description: 'Специализации', type: [String] })
  @IsArray()
  @IsString({ each: true })
  specializations: string[];

  @ApiPropertyOptional({ description: 'Активен ли мастер', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
