import { IsString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateRedirectDto {
  @IsString()
  fromPath: string;

  @IsString()
  toPath: string;

  @IsOptional()
  @IsInt()
  @Min(300)
  statusCode?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateRedirectDto {
  @IsOptional()
  @IsString()
  fromPath?: string;

  @IsOptional()
  @IsString()
  toPath?: string;

  @IsOptional()
  @IsInt()
  @Min(300)
  statusCode?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class RedirectQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  isActive?: string;
}
