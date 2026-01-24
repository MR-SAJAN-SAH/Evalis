import { IsString, IsNumber, IsArray, IsOptional, IsObject, Min } from 'class-validator';

export class CreateProgrammingQuestionDto {
  @IsString()
  problemStatement: string;

  @IsString()
  inputFormat: string;

  @IsString()
  outputFormat: string;

  @IsString()
  constraints: string;

  @IsString()
  examples: string;

  @IsOptional()
  @IsString()
  edgeCases?: string;

  @IsArray()
  supportedLanguages: string[];

  @IsOptional()
  @IsObject()
  functionSignatures?: Record<string, string>;

  @IsNumber()
  @Min(0.5)
  maxMarks: number;

  @IsString()
  difficulty: string;

  @IsNumber()
  @Min(1)
  timeLimitSeconds: number;

  @IsNumber()
  @Min(1)
  memoryLimitMB: number;
}
