import { IsString, IsOptional, IsIn } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreatePaymentDto {
  @IsString()
  enrollmentId: string;

  @IsString()
  courseId: string;

  @IsIn(['bank_transfer', 'momo', 'vnpay', 'card'])
  method: string;

  @IsOptional() @IsString()
  couponCode?: string;
}

export class UpdatePaymentStatusDto {
  @IsIn(['pending', 'paid', 'failed', 'refunded'])
  status: string;

  @IsOptional() @IsString()
  gatewayTransactionId?: string;
}

export class PaymentQueryDto extends PaginationQueryDto {
  @IsOptional() @IsString()
  status?: string;

  @IsOptional() @IsString()
  studentId?: string;

  @IsOptional() @IsString()
  courseId?: string;
}
