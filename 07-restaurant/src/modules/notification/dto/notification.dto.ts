import { IsString, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateNotificationDto {
  @IsUUID()
  userId: string;

  @IsString()
  type: string;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  data?: Record<string, any>;
}

export class NotificationQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  type?: string;
}
