import { IsString, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateTechnologyDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  iconUrl?: string;
}

export class UpdateTechnologyDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  iconUrl?: string;
}

export class TechnologyQueryDto extends PaginationQueryDto {}
