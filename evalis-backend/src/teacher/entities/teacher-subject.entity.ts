import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { SubjectInvitation } from './subject-invitation.entity';
import { CandidateSubject } from './candidate-subject.entity';

export interface SubjectOption {
  id: string;
  title: string;
  description: string;
}

@Entity('teacher_subjects')
export class TeacherSubject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  teacherId: string;

  @Column()
  organizationId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json', default: [] })
  options: SubjectOption[];

  @Column({ default: 0 })
  totalInvites: number;

  @Column({ default: 0 })
  acceptedCount: number;

  @Column({ default: 0 })
  pendingCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(
    () => SubjectInvitation,
    (invitation) => invitation.subject,
    { cascade: true },
  )
  invitations: SubjectInvitation[];

  @OneToMany(
    () => CandidateSubject,
    (candidateSubject) => candidateSubject.subject,
    { cascade: true },
  )
  candidateSubjects: CandidateSubject[];
}
