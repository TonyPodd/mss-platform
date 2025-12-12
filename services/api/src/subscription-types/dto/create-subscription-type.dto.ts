import { IsString, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';

export class CreateSubscriptionTypeDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  amount: number; // Сумма пополнения баланса (в рублях)

  @IsNumber()
  @Min(0)
  price: number; // Стоимость (сколько нужно заплатить)

  @IsOptional()
  @IsNumber()
  @Min(1)
  durationDays?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
