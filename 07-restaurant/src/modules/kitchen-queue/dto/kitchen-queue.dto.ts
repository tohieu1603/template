import { IsString, IsOptional, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class UpdateKitchenQueueDto {
  @IsOptional()
  @IsIn(['grill', 'wok', 'salad', 'dessert', 'bar'])
  station?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10)
  priority?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class KitchenQueueQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  station?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
