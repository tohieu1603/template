import { IsString, IsOptional, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateReviewDto {
  @IsString()
  courseId: string;

  @IsString()
  enrollmentId: string;

  @Type(() => Number) @IsNumber() @Min(1) @Max(5)
  rating: number;

  @IsOptional() @IsString()
  comment?: string;
}

export class UpdateReviewDto {
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) @Max(5)
  rating?: number;

  @IsOptional() @IsString()
  comment?: string;
}

export class AdminReplyDto {
  @IsString()
  adminReply: string;
}

export class ReviewQueryDto extends PaginationQueryDto {
  @IsOptional() @IsString()
  courseId?: string;

  @IsOptional() @IsBoolean()
  isVisible?: boolean;
}
