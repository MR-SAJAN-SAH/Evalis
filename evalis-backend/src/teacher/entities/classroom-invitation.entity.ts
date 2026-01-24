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

@Entity('classroom_invitations')
export class ClassroomInvitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  classroomId: string;

  @Column()
  teacherId: string;

  @Column()
  candidateEmail: string;

  @Column({ nullable: true })
  candidateName: string;

  @Column({ nullable: true })
  candidateId: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'accepted', 'rejected', 'expired'],
    default: 'pending',
  })
  status: 'pending' | 'accepted' | 'rejected' | 'expired';

  @Column({ nullable: true })
  invitationToken: string;

  @Column({ nullable: true })
  respondedAt: Date;

  @Column({ nullable: true })
  responseMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  expiresAt: Date;

  @ManyToOne(() => TeacherClassroom, (classroom) => classroom.invitations, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'classroomId' })
  classroom: TeacherClassroom;
}
