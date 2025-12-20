import { IsString, IsNumber, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: 'Название товара' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Описание товара' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Краткое описание' })
  @IsString()
  shortDescription: string;

  @ApiProperty({ description: 'Цена товара' })
  @IsNumber()
  price: number;

  @ApiProperty({ description: 'Изображения товара', type: [String] })
  @IsArray()
  @IsString({ each: true })
  images: string[];

  @ApiProperty({ description: 'Категория товара' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Количество на складе' })
  @IsNumber()
  stockQuantity: number;

  @ApiPropertyOptional({ description: 'Доступен ли товар', default: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ description: 'ID мастера' })
  @IsOptional()
  @IsString()
  masterId?: string;
}
