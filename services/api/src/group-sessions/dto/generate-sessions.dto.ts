import { IsString, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class GenerateSessionsDto {
  @IsString()
  groupId: string;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;
}
