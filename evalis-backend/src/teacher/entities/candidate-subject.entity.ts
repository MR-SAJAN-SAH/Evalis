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

@Entity('candidate_subjects')
export class CandidateSubject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  subjectId: string;

  @Column()
  candidateId: string;

  @Column()
  candidateEmail: string;

  @Column({ type: 'enum', enum: ['active', 'inactive', 'completed'], default: 'active' })
  status: 'active' | 'inactive' | 'completed';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => TeacherSubject, (subject) => subject.candidateSubjects, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subjectId' })
  subject: TeacherSubject;
}
