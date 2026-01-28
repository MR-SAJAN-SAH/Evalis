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

@Entity('exam_access')
export class ExamAccess {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Exam, (exam) => exam.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'examId' })
  exam: Exam;

  @Column()
  examId: string;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  // Store the filter criteria used during publish for reference
  @Column({ type: 'json', nullable: true })
  filterCriteria: {
    school?: string;
    department?: string;
    admissionBatch?: string;
    currentSemester?: string;
  };

  @Column({ default: true })
  hasAccessToExam: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
