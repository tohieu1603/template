import { IsString, IsOptional, IsIn, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePaymentMethodDto {
  @IsIn(['card', 'bank_transfer'])
  type: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  lastFour?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  expMonth?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  expYear?: number;

  @IsOptional()
  @IsString()
  externalId?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
