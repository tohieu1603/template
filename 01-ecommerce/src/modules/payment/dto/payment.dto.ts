import { IsString, IsUUID, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class ProcessPaymentDto {
  @IsUUID()
  orderId: string;

  @IsString()
  method: string;

  @IsOptional()
  @IsString()
  gatewayTransactionId?: string;

  @IsOptional()
  gatewayResponse?: Record<string, any>;
}

export class RefundPaymentDto {
  @IsPositive()
  @IsNumber()
  refundAmount: number;

  @IsOptional()
  @IsString()
  refundReason?: string;
}

export class PaymentQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  method?: string;
}
