import { IsString, IsEmail, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class ParticipantDto {
  @IsString()
  fullName: string;

  @IsString()
  phone: string;

  @IsOptional()
  age?: number;
}

export class CreateEnrollmentDto {
  @IsString()
  groupId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParticipantDto)
  participants: ParticipantDto[];

  @IsEmail()
  contactEmail: string;

  @IsOptional()
  @IsString()
  subscriptionId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
