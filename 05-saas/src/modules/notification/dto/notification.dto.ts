import { IsString, IsOptional, IsUUID, IsBoolean } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateNotificationDto {
  @IsUUID()
  userId: string;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  actionUrl?: string;
}

export class NotificationQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  isRead?: string;
}
