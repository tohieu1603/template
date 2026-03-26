import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class MediaQueryDto extends PaginationQueryDto {
  @IsOptional() @IsString()
  folder?: string;

  @IsOptional() @IsString()
  mimeType?: string;
}

export class UpdateMediaDto {
  @IsOptional() @IsString()
  altText?: string;

  @IsOptional() @IsString()
  folder?: string;
}
