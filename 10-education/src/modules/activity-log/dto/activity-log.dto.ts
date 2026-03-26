import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class ActivityLogQueryDto extends PaginationQueryDto {
  @IsOptional() @IsString()
  userId?: string;

  @IsOptional() @IsString()
  action?: string;

  @IsOptional() @IsString()
  entityType?: string;
}
