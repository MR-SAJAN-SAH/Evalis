import { IsString, IsOptional, IsArray, IsEnum, IsBoolean, IsDateString } from 'class-validator';
import { AnnouncementAttachment } from '../entities/classroom-announcement.entity';

export class CreateAnnouncementDto {
  @IsString()
  classroomId: string;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  contentHtml?: string;

  @IsOptional()
  @IsArray()
  attachments?: AnnouncementAttachment[];

  @IsOptional()
  @IsEnum(['published', 'draft'])
  status?: 'published' | 'draft';

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsDateString()
  scheduledFor?: Date;

  @IsOptional()
  metadata?: {
    isPinned?: boolean;
    priority?: 'normal' | 'high' | 'urgent';
    tags?: string[];
    allowComments?: boolean;
    requiresAck?: boolean;
  };
}

export class UpdateAnnouncementDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  contentHtml?: string;

  @IsOptional()
  @IsArray()
  attachments?: AnnouncementAttachment[];

  @IsOptional()
  @IsEnum(['published', 'draft', 'archived'])
  status?: 'published' | 'draft' | 'archived';

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsDateString()
  scheduledFor?: Date;

  @IsOptional()
  metadata?: {
    isPinned?: boolean;
    priority?: 'normal' | 'high' | 'urgent';
    tags?: string[];
    allowComments?: boolean;
    requiresAck?: boolean;
  };
}

export class AnnouncementFilterDto {
  @IsOptional()
  @IsString()
  classroomId?: string;

  @IsOptional()
  @IsEnum(['published', 'draft', 'archived'])
  status?: 'published' | 'draft' | 'archived';

  @IsOptional()
  @IsBoolean()
  pinnedOnly?: boolean;

  @IsOptional()
  take?: number;

  @IsOptional()
  skip?: number;
}

export class MarkAnnouncementViewedDto {
  @IsString()
  announcementId: string;

  @IsString()
  candidateId: string;
}
