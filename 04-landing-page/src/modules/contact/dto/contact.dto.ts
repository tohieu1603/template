import { IsString, IsEmail, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateContactDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  subject: string;

  @IsString()
  message: string;
}

export class ContactQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  isRead?: string;
}
