import { IsEmail, IsString, IsOptional, IsIn } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateInvitationDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsIn(['admin', 'member', 'viewer'])
  role?: string;
}

export class AcceptInvitationDto {
  @IsString()
  token: string;
}

export class InvitationQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  status?: string;
}
