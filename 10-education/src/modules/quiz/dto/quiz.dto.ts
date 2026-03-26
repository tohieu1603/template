import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuizDto {
  @IsString()
  lessonId: string;

  @IsString()
  title: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @Type(() => Number) @IsNumber()
  passingScore?: number;

  @IsOptional() @Type(() => Number) @IsNumber()
  timeLimitMinutes?: number;

  @IsOptional() @Type(() => Number) @IsNumber()
  maxAttempts?: number;
}

export class UpdateQuizDto {
  @IsOptional() @IsString()
  title?: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @Type(() => Number) @IsNumber()
  passingScore?: number;

  @IsOptional() @Type(() => Number) @IsNumber()
  timeLimitMinutes?: number;

  @IsOptional() @Type(() => Number) @IsNumber()
  maxAttempts?: number;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}

export class QuizOptionDto {
  @IsString()
  text: string;

  @IsBoolean()
  isCorrect: boolean;
}

export class CreateQuestionDto {
  @IsString()
  question: string;

  @IsOptional() @IsIn(['single_choice', 'multiple_choice', 'true_false', 'short_answer'])
  questionType?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizOptionDto)
  options: QuizOptionDto[];

  @IsOptional() @IsString()
  explanation?: string;

  @IsOptional() @Type(() => Number) @IsNumber()
  points?: number;

  @IsOptional() @Type(() => Number) @IsNumber()
  sortOrder?: number;
}

export class UpdateQuestionDto {
  @IsOptional() @IsString()
  question?: string;

  @IsOptional() @IsIn(['single_choice', 'multiple_choice', 'true_false', 'short_answer'])
  questionType?: string;

  @IsOptional() @IsArray()
  options?: QuizOptionDto[];

  @IsOptional() @IsString()
  explanation?: string;

  @IsOptional() @Type(() => Number) @IsNumber()
  points?: number;

  @IsOptional() @Type(() => Number) @IsNumber()
  sortOrder?: number;
}

export class SubmitAnswerDto {
  @IsString()
  questionId: string;

  answer: unknown;
}

export class SubmitQuizDto {
  @IsArray()
  answers: SubmitAnswerDto[];
}
