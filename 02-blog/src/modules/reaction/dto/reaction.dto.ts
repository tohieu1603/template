import { IsString, IsIn } from 'class-validator';

export class UpsertReactionDto {
  @IsString()
  @IsIn(['like', 'love', 'insightful', 'funny', 'sad'])
  type: string;
}
