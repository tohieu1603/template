import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateInstructorDto {
  @IsString()
  userId: string;

  @IsString()
  name: string;

  @IsOptional() @IsString()
  bio?: string;

  @IsOptional() @IsString()
  shortBio?: string;

  @IsOptional() @IsString()
  avatarUrl?: string;

  @IsOptional() @IsArray()
  expertise?: string[];

  @IsOptional() @IsString()
  website?: string;

  @IsOptional() @IsString()
  socialLinkedin?: string;

  @IsOptional() @IsString()
  socialYoutube?: string;
}

export class UpdateInstructorDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsString()
  bio?: string;

  @IsOptional() @IsString()
  shortBio?: string;

  @IsOptional() @IsString()
  avatarUrl?: string;

  @IsOptional() @IsArray()
  expertise?: string[];

  @IsOptional() @IsString()
  website?: string;

  @IsOptional() @IsString()
  socialLinkedin?: string;

  @IsOptional() @IsString()
  socialYoutube?: string;

  @IsOptional() @IsBoolean()
  isVerified?: boolean;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}

export class InstructorQueryDto extends PaginationQueryDto {
  @IsOptional() @IsString()
  isVerified?: string;
}
