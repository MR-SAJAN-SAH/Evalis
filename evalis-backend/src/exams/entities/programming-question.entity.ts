import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Exam } from './exam.entity';

export enum ProgrammingLanguage {
  PYTHON = 'PYTHON',
  JAVASCRIPT = 'JAVASCRIPT',
  CPP = 'CPP',
  JAVA = 'JAVA',
  GO = 'GO',
}

@Entity('programming_questions')
export class ProgrammingQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  problemStatement: string;

  @Column({ type: 'text' })
  inputFormat: string;

  @Column({ type: 'text' })
  outputFormat: string;

  @Column({ type: 'text' })
  constraints: string;

  @Column({ type: 'text' })
  examples: string;

  @Column({ type: 'text', nullable: true })
  edgeCases: string;

  @Column({ type: 'simple-array' })
  supportedLanguages: string[];

  @Column({ type: 'simple-json', nullable: true })
  functionSignatures: Record<string, string>;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  maxMarks: number;

  @Column()
  difficulty: string;

  @Column()
  timeLimitSeconds: number;

  @Column()
  memoryLimitMB: number;

  @Column({ default: 0 })
  displayOrder: number;

  @ManyToOne(() => Exam, (exam) => exam.programmingQuestions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'examId' })
  exam: Exam;

  @Column()
  examId: string;
}
