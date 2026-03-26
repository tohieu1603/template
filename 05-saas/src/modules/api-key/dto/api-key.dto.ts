import { IsString, IsOptional, IsArray, IsDateString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateApiKeyDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsArray()
  scopes?: string[];

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class ApiKeyQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  isActive?: string;
}
