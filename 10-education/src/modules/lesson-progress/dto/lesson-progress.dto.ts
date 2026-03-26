import { IsString, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateLessonProgressDto {
  @IsOptional() @IsString()
  status?: string;

  @IsOptional() @Type(() => Number) @IsNumber()
  watchTimeSeconds?: number;
}

export class MarkCompleteDto {
  @IsString()
  lessonId: string;

  @IsString()
  enrollmentId: string;
}
