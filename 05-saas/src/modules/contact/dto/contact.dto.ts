import { IsEmail, IsString, IsOptional, IsIn } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateContactDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsString()
  message: string;
}

export class UpdateContactDto {
  @IsIn(['new', 'read', 'replied', 'archived'])
  status: string;
}

export class ContactQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  status?: string;
}
