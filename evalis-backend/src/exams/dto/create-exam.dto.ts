import { IsString, IsNumber, IsBoolean, IsEnum, IsOptional, Min, Max } from 'class-validator';
import { ExamType, ExamLevel } from '../entities/exam.entity';

export class CreateExamDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  subject: string;

  @IsString()
  category: string;

  @IsEnum(ExamLevel)
  level: ExamLevel;

  @IsEnum(ExamType)
  examType: ExamType;

  @IsNumber()
  @Min(1)
  durationMinutes: number;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsNumber()
  @Min(0)
  passingScore: number;

  @IsBoolean()
  negativeMarking: boolean;

  @IsNumber()
  @Min(0)
  @Max(100)
  negativeMarkPercentage: number;

  @IsBoolean()
  randomizeQuestions: boolean;

  @IsBoolean()
  randomizeOptions: boolean;

  @IsBoolean()
  allowBackNavigation: boolean;

  @IsBoolean()
  showResultsImmediately: boolean;

  @IsBoolean()
  requireWebcam: boolean;

  @IsBoolean()
  fullScreenRequired: boolean;

  @IsBoolean()
  preventTabSwitch: boolean;

  @IsNumber()
  @Min(10)
  autoSaveInterval: number;
}
