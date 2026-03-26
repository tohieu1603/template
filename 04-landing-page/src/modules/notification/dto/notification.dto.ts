import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateNotificationDto {
  @IsString()
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
  @IsBoolean()
  isRead?: boolean;
}
