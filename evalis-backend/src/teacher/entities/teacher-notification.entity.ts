import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('teacher_notifications')
export class TeacherNotification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  teacherId: string;

  @Column()
  subjectId: string;

  @Column()
  subjectName: string;

  @Column()
  candidateEmail: string;

  @Column({ type: 'enum', enum: ['accepted', 'rejected', 'pending'], default: 'pending' })
  type: 'accepted' | 'rejected' | 'pending';

  @Column({ type: 'text' })
  message: string;

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
