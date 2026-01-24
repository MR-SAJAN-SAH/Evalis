import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { ClassroomInvitation } from './classroom-invitation.entity';
import { CandidateClassroom } from './candidate-classroom.entity';
import { ClassroomSection } from './classroom-section.interface';

export type { ClassroomSection };

@Entity('teacher_classrooms')
export class TeacherClassroom {
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

  @Column()
  subject: string;

  @Column({ type: 'json', nullable: true })
  sections: ClassroomSection[];

  @Column({ default: 0 })
  studentCount: number;

  @Column({ default: 'active', enum: ['active', 'archived', 'inactive'] })
  status: string;

  @Column({ type: 'text', nullable: true })
  coverImageUrl: string;

  @Column({ type: 'text', nullable: true })
  classCode: string;

  @Column({ type: 'json', default: {} })
  metadata: {
    semester?: string;
    academicYear?: string;
    room?: string;
    meetingLink?: string;
    [key: string]: any;
  };

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

  @OneToMany(() => ClassroomInvitation, (inv) => inv.classroom, {
    cascade: true,
    eager: false,
  })
  invitations: ClassroomInvitation[];

  @OneToMany(() => CandidateClassroom, (cc) => cc.classroom, {
    cascade: true,
    eager: false,
  })
  candidateClassrooms: CandidateClassroom[];
}
