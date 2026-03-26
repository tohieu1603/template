import { IsString, IsOptional, IsIn, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class AddMemberDto {
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsIn(['admin', 'member', 'viewer'])
  role?: string;
}

export class UpdateMemberRoleDto {
  @IsIn(['owner', 'admin', 'member', 'viewer'])
  role: string;
}

export class MemberQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  role?: string;
}
