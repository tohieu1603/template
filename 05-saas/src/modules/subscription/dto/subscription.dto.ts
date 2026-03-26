import { IsUUID, IsOptional, IsIn, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateSubscriptionDto {
  @IsUUID()
  planId: string;

  @IsOptional()
  @IsIn(['monthly', 'yearly'])
  billingCycle?: string;
}

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsUUID()
  planId?: string;

  @IsOptional()
  @IsIn(['monthly', 'yearly'])
  billingCycle?: string;
}

export class SubscriptionQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  status?: string;
}
