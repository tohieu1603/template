import { IsEmail, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class SubscribeNewsletterDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  name?: string;
}

export class UnsubscribeNewsletterDto {
  @IsEmail()
  email: string;
}

export class NewsletterQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  isSubscribed?: string;
}
