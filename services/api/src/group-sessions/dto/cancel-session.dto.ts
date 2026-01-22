import { IsString, IsOptional } from 'class-validator';

export class CancelSessionDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
