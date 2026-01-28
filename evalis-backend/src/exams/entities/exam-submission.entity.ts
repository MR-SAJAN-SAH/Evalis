import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Exam } from './exam.entity';
import { User } from '../../users/entities/user.entity';

export enum SubmissionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
}

@Entity('exam_submissions')
export class ExamSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  examId: string;

  @ManyToOne(() => Exam, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'examId' })
  exam: Exam;

  @Column()
  candidateId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'candidateId' })
  candidate: User;

  @Column({ type: 'json' })
  answers: Record<string, string | string[] | null>; // questionId -> answer mapping (string for single, string[] for multiple)

  @Column({ nullable: true })
  evaluatorEmail: string;

  @Column({ default: false })
  isRandomlyAssigned: boolean;

  @Column({ nullable: true })
  evaluatedBy: string; // ID of evaluator who evaluated this

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  score: number;

  @Column({ type: 'text', nullable: true })
  evaluationComments: string;

  @Column({ type: 'simple-array', nullable: true })
  commentTypes: string[]; // Array of comment types: 'conceptual_error' | 'incomplete_answer' | 'calculation_mistake' | 'irrelevant_content'

  @Column({ type: 'json', nullable: true })
  detailedEvaluation: Record<string, any>; // questionId -> {marks, commentTypes[], customComment}

  @Column({ type: 'varchar', default: 'pending' })
  evaluationStatus: string; // 'pending' | 'in-progress' | 'completed'

  @Column({ type: 'boolean', default: true })
  isLive: boolean; // True while exam is being taken, false after submission

  @Column({ type: 'text', nullable: true })
  screenCapture: string; // Base64 encoded latest screenshot for live proctoring

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalMarks: number;

  @CreateDateColumn()
  submittedAt: Date;

  @UpdateDateColumn()
  evaluatedAt: Date;
}
