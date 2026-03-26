import { IsString, IsOptional, IsUUID, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreatePaymentDto {
  @IsUUID()
  bookingId: string;

  @IsString()
  method: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  gatewayTransactionId?: string;
}

export class RefundPaymentDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  refundAmount: number;
}

export class PaymentQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  bookingId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  method?: string;
}
