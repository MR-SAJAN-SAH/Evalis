import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  EXAM_SCHEDULED = 'exam_scheduled',
  RESULT_READY = 'result_ready',
  EXAM_CLOSING_SOON = 'exam_closing_soon',
  EXAM_REMINDER = 'exam_reminder',
  SYSTEM = 'system',
}

@Entity('candidate_notifications')
export class CandidateNotification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  candidateId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  candidate: User;

  @Column({ type: 'enum', enum: NotificationType, default: NotificationType.SYSTEM })
  type: NotificationType;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ nullable: true })
  examId?: string;

  @Column({ nullable: true })
  examName?: string;

  @Column({ default: false })
  read: boolean;

  @Column({ nullable: true })
  actionUrl?: string; // URL to navigate to when clicked

  @CreateDateColumn()
  createdAt: Date;
}
