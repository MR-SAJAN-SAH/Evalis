import { IsString, IsOptional, IsArray } from 'class-validator';

export class PublishExamDto {
  @IsOptional()
  @IsString()
  school?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  admissionBatch?: string;

  @IsOptional()
  @IsString()
  currentSemester?: string;

  // If all filters are empty, exam is published to all candidates
  // If any filter is provided, only users matching those criteria get access
}
