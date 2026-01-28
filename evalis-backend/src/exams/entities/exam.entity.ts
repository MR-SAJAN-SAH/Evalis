import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Question } from './question.entity';
import { ProgrammingQuestion } from './programming-question.entity';

export enum ExamType {
  MCQ = 'MCQ',
  PROGRAMMING = 'PROGRAMMING',
}

export enum ExamStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  CLOSED = 'CLOSED',
}

export enum ExamLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

@Entity('exams')
export class Exam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  subject: string;

  @Column()
  category: string;

  @Column({ type: 'enum', enum: ExamLevel })
  level: ExamLevel;

  @Column({ type: 'enum', enum: ExamType })
  examType: ExamType;

  // Timing
  @Column()
  durationMinutes: number;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  // Scoring
  @Column({ default: 0 })
  totalQuestions: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalMarks: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  passingScore: number;

  @Column({ default: false })
  negativeMarking: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  negativeMarkPercentage: number;

  // Display Options
  @Column({ default: false })
  randomizeQuestions: boolean;

  @Column({ default: false })
  randomizeOptions: boolean;

  @Column({ default: true })
  allowBackNavigation: boolean;

  @Column({ default: false })
  showResultsImmediately: boolean;

  // Proctoring
  @Column({ default: false })
  requireWebcam: boolean;

  @Column({ default: false })
  fullScreenRequired: boolean;

  @Column({ default: false })
  preventTabSwitch: boolean;

  @Column({ default: 30 })
  autoSaveInterval: number;

  // Status and Metadata
  @Column({ type: 'enum', enum: ExamStatus, default: ExamStatus.DRAFT })
  status: ExamStatus;

  @Column({ default: 0, nullable: true })
  publishedCandidateCount: number;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  @Column()
  createdBy: string;

  @Column()
  organizationId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Question, (question) => question.exam, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  questions: Question[];

  @OneToMany(
    () => ProgrammingQuestion,
    (programmingQuestion) => programmingQuestion.exam,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  programmingQuestions: ProgrammingQuestion[];
}
