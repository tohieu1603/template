import { IsString, IsEmail, IsOptional, IsBoolean } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  fullName: string;

  @IsOptional() @IsString()
  phone?: string;
}

export class UpdateUserDto {
  @IsOptional() @IsString()
  fullName?: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsString()
  avatarUrl?: string;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}

export class UserQueryDto extends PaginationQueryDto {
  @IsOptional() @IsString()
  status?: string;
}
