import { IsString, IsOptional, IsNumber, Min, Max, IsUUID, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateSkillDto {
  @IsUUID()
  profileId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsIn(['frontend', 'backend', 'design', 'devops', 'soft_skill'])
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  level?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  yearsExperience?: number;

  @IsOptional()
  @IsString()
  iconUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sortOrder?: number;
}

export class UpdateSkillDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(['frontend', 'backend', 'design', 'devops', 'soft_skill'])
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  level?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  yearsExperience?: number;

  @IsOptional()
  @IsString()
  iconUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sortOrder?: number;
}

export class SkillQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  profileId?: string;

  @IsOptional()
  @IsString()
  category?: string;
}
