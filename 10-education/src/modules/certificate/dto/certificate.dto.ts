import { IsString } from 'class-validator';

export class GenerateCertificateDto {
  @IsString()
  enrollmentId: string;
}
