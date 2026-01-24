import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TeacherClassroom } from './teacher-classroom.entity';
import { User } from '../../users/entities/user.entity';

@Entity('candidate_classrooms')
export class CandidateClassroom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  classroomId: string;

  @Column({ nullable: true })
  candidateId: string;

  @Column()
  candidateEmail: string;

  @Column({ enum: ['active', 'inactive', 'completed', 'archived'], default: 'active' })
  status: 'active' | 'inactive' | 'completed' | 'archived';

  @Column({ type: 'text', nullable: true })
  enrollmentNotes: string;

  @Column({ nullable: true })
  grade: number;

  @Column({ nullable: true })
  progress: number;

  @CreateDateColumn()
  enrolledAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => TeacherClassroom, (classroom) => classroom.candidateClassrooms, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'classroomId' })
  classroom: TeacherClassroom;

  @ManyToOne(() => User, {
    eager: false,
  })
  @JoinColumn({ name: 'candidateId' })
  candidate: User;
}
