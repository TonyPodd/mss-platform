import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNewsDto {
  @ApiProperty({ description: 'Заголовок новости' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Содержание новости' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'URL изображения' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Опубликована ли новость', default: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
