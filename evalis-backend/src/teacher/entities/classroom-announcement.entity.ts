import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TeacherClassroom } from './teacher-classroom.entity';

export interface AnnouncementAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'document' | 'audio';
  mimeType: string;
  size: number; // in bytes
  uploadedAt: Date;
}

@Entity('classroom_announcements')
@Index(['classroomId', 'createdAt'])
@Index(['classroomId', 'status'])
export class ClassroomAnnouncement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  classroomId: string;

  @Column()
  teacherId: string;

  @Column()
  teacherName: string;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  contentHtml?: string; // Rich text HTML for advanced formatting

  @Column({ type: 'json', nullable: true })
  attachments?: AnnouncementAttachment[];

  @Column({ enum: ['published', 'draft', 'archived'], default: 'published' })
  status: 'published' | 'draft' | 'archived';

  @Column({ default: 0 })
  viewCount: number;

  @Column({ type: 'simple-array', nullable: true })
  viewedBy?: string[]; // Array of candidateIds who have viewed

  @Column({ type: 'json', nullable: true })
  metadata?: {
    isPinned?: boolean;
    pinnedAt?: Date;
    priority?: 'normal' | 'high' | 'urgent';
    tags?: string[];
    allowComments?: boolean;
    requiresAck?: boolean; // Acknowledgment required
    [key: string]: any;
  };

  @Column({ type: 'text', nullable: true })
  coverImage?: string; // Featured image URL

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  scheduledFor?: Date; // For scheduled announcements

  @ManyToOne(() => TeacherClassroom, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'classroomId' })
  classroom?: TeacherClassroom;
}
