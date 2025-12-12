import { IsString, IsNumber, IsBoolean, IsOptional, Min, IsObject, IsArray, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class GroupScheduleDto {
  @IsArray()
  @IsInt({ each: true })
  daysOfWeek: number[]; // 0=Воскресенье, 1=Понедельник, ...6=Суббота

  @IsString()
  time: string; // HH:MM формат

  @IsNumber()
  @Min(15)
  duration: number; // Продолжительность в минутах
}

export class CreateGroupDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  shortDescription: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsObject()
  @Type(() => GroupScheduleDto)
  schedule: GroupScheduleDto;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(1)
  maxParticipants: number;

  @IsString()
  masterId: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
