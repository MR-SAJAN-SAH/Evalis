import { IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SubjectOptionDto {
  @IsString()
  title: string;

  @IsString()
  description: string;
}

export class UpdateSubjectDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SubjectOptionDto)
  options?: SubjectOptionDto[];
}
