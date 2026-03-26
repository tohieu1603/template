import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateRoleDto {
  @IsString()
  name: string;

  @IsString()
  displayName: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsBoolean()
  isDefault?: boolean;
}

export class UpdateRoleDto {
  @IsOptional() @IsString()
  displayName?: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsBoolean()
  isDefault?: boolean;
}

export class AssignPermissionsDto {
  @IsArray()
  permissionIds: string[];
}

export class AssignRoleDto {
  @IsString()
  roleId: string;
}

export class RoleQueryDto extends PaginationQueryDto {}
