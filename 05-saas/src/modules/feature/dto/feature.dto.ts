import { IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateFeatureDto {
  @IsString()
  key: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}

export class UpdateFeatureDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}

export class SetOrgFeatureDto {
  @IsUUID()
  featureId: string;

  @IsBoolean()
  isEnabled: boolean;
}

export class FeatureQueryDto extends PaginationQueryDto {}
