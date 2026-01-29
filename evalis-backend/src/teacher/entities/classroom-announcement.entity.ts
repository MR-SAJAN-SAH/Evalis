export type AnnouncementAttachment = {
  id: string;
  name: string;
  url: string;
  type?: string;
  mimeType?: string;
  size?: number;
  uploadedAt?: Date | string;
};

export class ClassroomAnnouncement {
  id: string;
  classroomId?: string;
  teacherId?: string;
  teacherName?: string;
  title?: string;
  content?: string;
  contentHtml?: string;
  attachments?: AnnouncementAttachment[];
  status?: 'published' | 'draft' | 'archived';
  coverImage?: string;
  scheduledFor?: Date | string;
  metadata?: any;
  viewedBy?: string[];
  viewCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export default ClassroomAnnouncement;
