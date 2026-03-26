import { IsString, IsOptional, IsNumber, Min, IsUUID, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class ProcessPaymentDto {
  @IsUUID()
  orderId: string;

  @IsIn(['cash', 'card', 'momo', 'vnpay'])
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

  @IsOptional()
  @IsString()
  reason?: string;
}

export class PaymentQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsUUID()
  orderId?: string;
}
