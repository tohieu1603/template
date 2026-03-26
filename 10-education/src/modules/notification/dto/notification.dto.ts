import { IsString, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateNotificationDto {
  @IsString()
  userId: string;

  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsOptional() @IsString()
  type?: string;

  @IsOptional() @IsString()
  link?: string;
}

export class NotificationQueryDto extends PaginationQueryDto {
  @IsOptional() @IsString()
  isRead?: string;
}
