import { IsString, IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SubjectOptionDto {
  @IsString()
  title: string;

  @IsString()
  description: string;
}

export class CreateSubjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubjectOptionDto)
  options: SubjectOptionDto[];

  @IsString()
  @IsNotEmpty()
  organizationId: string;
}
