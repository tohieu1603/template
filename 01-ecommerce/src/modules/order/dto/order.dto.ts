import { IsString, IsOptional, IsUUID, IsArray, ValidateNested, IsNumber, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class OrderItemDto {
  @IsUUID()
  variantId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsString()
  shippingName: string;

  @IsString()
  shippingPhone: string;

  @IsString()
  shippingAddress: string;

  @IsString()
  paymentMethod: string;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsUUID()
  shippingMethodId?: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(['pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled', 'refunded'])
  status: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  cancelReason?: string;
}

export class OrderQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}
