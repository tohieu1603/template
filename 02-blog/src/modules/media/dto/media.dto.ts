import { IsString, IsOptional, IsArray } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class UpdateMediaDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  altText?: string;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsString()
  folder?: string;

  @IsOptional()
  @IsArray()
  usedIn?: any[];

  @IsOptional()
  @IsArray()
  assignments?: any[];
}

export class MediaQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  folder?: string;
}
