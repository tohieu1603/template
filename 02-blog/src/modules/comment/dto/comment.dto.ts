import { IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateCommentDto {
  @IsUUID()
  postId: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsString()
  content: string;
}

export class UpdateCommentDto {
  @IsString()
  content: string;
}

export class AdminCommentDto {
  @IsOptional()
  @IsBoolean()
  isApproved?: boolean;
}

export class CommentQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  postId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  approved?: string;
}
