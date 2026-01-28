import { IsString, IsNumber, IsBoolean, IsEnum, IsOptional, IsArray, Min } from 'class-validator';
import { QuestionType, DifficultyLevel } from '../entities/question.entity';

export class CreateQuestionDto {
  @IsString()
  questionText: string;

  @IsEnum(QuestionType)
  questionType: QuestionType;

  @IsNumber()
  @Min(0.5)
  marks: number;

  @IsEnum(DifficultyLevel)
  difficultyLevel: DifficultyLevel;

  @IsString()
  optionA: string;

  @IsString()
  optionB: string;

  @IsOptional()
  @IsString()
  optionC?: string;

  @IsOptional()
  @IsString()
  optionD?: string;

  @IsString()
  correctAnswer: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  correctAnswers?: string[]; // Array of correct answers for multi-select questions

  @IsOptional()
  @IsBoolean()
  allowMultipleCorrect?: boolean; // Flag to indicate if multiple answers are allowed

  @IsOptional()
  @IsString()
  correctAnswerExplanation?: string;

  @IsBoolean()
  hasImage: boolean;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  imageAltText?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];
}
