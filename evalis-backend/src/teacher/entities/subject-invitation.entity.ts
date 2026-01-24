import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TeacherSubject } from './teacher-subject.entity';

@Entity('subject_invitations')
export class SubjectInvitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  subjectId: string;

  @Column()
  teacherId: string;

  @Column()
  candidateEmail: string;

  @Column({ nullable: true })
  candidateName: string;

  @Column({ nullable: true })
  candidateId: string;

  @Column({ type: 'enum', enum: ['pending', 'accepted', 'rejected'], default: 'pending' })
  status: 'pending' | 'accepted' | 'rejected';

  @Column({ nullable: true })
  invitationToken: string;

  @Column({ nullable: true })
  respondedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => TeacherSubject, (subject) => subject.invitations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subjectId' })
  subject: TeacherSubject;
}
