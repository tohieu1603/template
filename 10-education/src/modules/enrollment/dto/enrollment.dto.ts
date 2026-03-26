import { IsString, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class EnrollDto {
  @IsString()
  courseId: string;

  @IsOptional() @IsString()
  couponCode?: string;
}

export class EnrollmentQueryDto extends PaginationQueryDto {
  @IsOptional() @IsString()
  status?: string;

  @IsOptional() @IsString()
  courseId?: string;

  @IsOptional() @IsString()
  studentId?: string;
}
