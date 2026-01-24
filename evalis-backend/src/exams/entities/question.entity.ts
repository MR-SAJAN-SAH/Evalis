import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Exam } from './exam.entity';

export enum QuestionType {
  MCQ = 'MCQ',
  DESCRIPTIVE = 'DESCRIPTIVE',
  TRUE_FALSE = 'TRUE_FALSE',
  FILL_BLANKS = 'FILL_BLANKS',
}

export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  questionText: string;

  @Column({ type: 'enum', enum: QuestionType, default: QuestionType.MCQ })
  questionType: QuestionType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  marks: number;

  @Column({ type: 'enum', enum: DifficultyLevel, default: DifficultyLevel.MEDIUM })
  difficultyLevel: DifficultyLevel;

  @Column()
  optionA: string;

  @Column()
  optionB: string;

  @Column({ nullable: true })
  optionC: string;

  @Column({ nullable: true })
  optionD: string;

  @Column()
  correctAnswer: string;

  @Column({ type: 'text', nullable: true })
  correctAnswerExplanation: string;

  @Column({ default: false })
  hasImage: boolean;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  imageAltText: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ default: 0 })
  displayOrder: number;

  @ManyToOne(() => Exam, (exam) => exam.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'examId' })
  exam: Exam;

  @Column()
  examId: string;
}
