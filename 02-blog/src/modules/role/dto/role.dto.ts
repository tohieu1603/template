import { IsString, IsOptional, IsBoolean, IsArray, IsUUID, MinLength } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateRoleDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  displayName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class AssignPermissionsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds: string[];
}

export class CreatePermissionDto {
  @IsString()
  name: string;  // e.g. 'posts.create'

  @IsString()
  displayName: string;

  @IsString()
  groupName: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class RoleQueryDto extends PaginationQueryDto {}
