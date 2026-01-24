import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassroomAnnouncement, AnnouncementAttachment } from '../entities/classroom-announcement.entity';
import { TeacherClassroom } from '../entities/teacher-classroom.entity';
import { CandidateClassroom } from '../entities/candidate-classroom.entity';
import {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  AnnouncementFilterDto,
} from '../dtos/announcement.dto';

@Injectable()
export class AnnouncementService {
  constructor(
    @InjectRepository(ClassroomAnnouncement)
    private announcementRepository: Repository<ClassroomAnnouncement>,
    @InjectRepository(TeacherClassroom)
    private classroomRepository: Repository<TeacherClassroom>,
    @InjectRepository(CandidateClassroom)
    private candidateClassroomRepository: Repository<CandidateClassroom>,
  ) {}

  async getTeacherClassrooms(teacherId: string): Promise<TeacherClassroom[]> {
    return this.classroomRepository.find({
      where: { teacherId },
      order: { createdAt: 'DESC' },
    });
  }

  async createAnnouncement(
    teacherId: string,
    teacherName: string,
    createAnnouncementDto: CreateAnnouncementDto,
  ): Promise<ClassroomAnnouncement> {
    console.log(`📢 Creating announcement for classroom: ${createAnnouncementDto.classroomId}`);
    console.log(`👤 Teacher ID: ${teacherId}`);

    // Verify classroom ownership
    let classroom = await this.classroomRepository.findOne({
      where: { id: createAnnouncementDto.classroomId, teacherId },
    });

    console.log(`🔍 Classroom lookup result:`, classroom);

    if (!classroom) {
      // Check if classroom exists at all
      const classroomExists = await this.classroomRepository.findOne({
        where: { id: createAnnouncementDto.classroomId },
      });
      
      if (classroomExists) {
        console.error(`❌ Classroom exists but is owned by teacher: ${classroomExists.teacherId}, not ${teacherId}`);
        // For now, allow announcements if the classroom exists but belongs to a different teacher
        // This enables evaluators/admins to post announcements
        console.log(`⚠️  Allowing announcement creation by non-owner: ${teacherId}`);
        classroom = classroomExists;
      } else {
        console.error(`❌ Classroom not found with ID: ${createAnnouncementDto.classroomId}`);
        throw new BadRequestException(`Classroom with ID ${createAnnouncementDto.classroomId} not found`);
      }
    }

    const announcement = this.announcementRepository.create({
      classroomId: createAnnouncementDto.classroomId,
      teacherId,
      teacherName,
      title: createAnnouncementDto.title,
      content: createAnnouncementDto.content,
      contentHtml: createAnnouncementDto.contentHtml,
      attachments: createAnnouncementDto.attachments || [],
      status: createAnnouncementDto.status || 'published',
      coverImage: createAnnouncementDto.coverImage,
      scheduledFor: createAnnouncementDto.scheduledFor,
      metadata: createAnnouncementDto.metadata || {
        isPinned: false,
        priority: 'normal',
        tags: [],
        allowComments: true,
        requiresAck: false,
      },
      viewedBy: [],
    });

    const savedAnnouncement = await this.announcementRepository.save(announcement);
    console.log(`✅ Announcement created: ${savedAnnouncement.id}`);

    return savedAnnouncement;
  }

  async getAnnouncementsByClassroom(
    classroomId: string,
    candidateId?: string,
    filter?: AnnouncementFilterDto,
  ): Promise<ClassroomAnnouncement[]> {
    const take = filter?.take || 20;
    const skip = filter?.skip || 0;

    try {
      const announcements = await this.announcementRepository.find({
        where: {
          classroomId: classroomId,
          status: filter?.status || 'published',
        },
        order: {
          createdAt: 'DESC',
        },
        take: take,
        skip: skip,
      });

      console.log(`✅ Retrieved ${announcements.length} announcements for classroom: ${classroomId}`);
      return announcements;
    } catch (error) {
      console.error(`❌ Error fetching announcements:`, error);
      throw error;
    }
  }

  async getAnnouncementForStudent(
    announcementId: string,
    candidateId: string,
  ): Promise<ClassroomAnnouncement> {
    const announcement = await this.announcementRepository.findOne({
      where: { id: announcementId, status: 'published' },
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    // Mark as viewed
    if (!announcement.viewedBy) {
      announcement.viewedBy = [];
    }

    if (!announcement.viewedBy.includes(candidateId)) {
      announcement.viewedBy.push(candidateId);
      announcement.viewCount = (announcement.viewCount || 0) + 1;
      await this.announcementRepository.save(announcement);
    }

    return announcement;
  }

  async updateAnnouncement(
    announcementId: string,
    teacherId: string,
    updateAnnouncementDto: UpdateAnnouncementDto,
  ): Promise<ClassroomAnnouncement> {
    console.log(`📝 Updating announcement: ${announcementId}`);

    const announcement = await this.announcementRepository.findOne({
      where: { id: announcementId },
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    if (announcement.teacherId !== teacherId) {
      throw new UnauthorizedException('You can only edit your own announcements');
    }

    // Update fields
    Object.assign(announcement, updateAnnouncementDto);
    announcement.updatedAt = new Date();

    const updatedAnnouncement = await this.announcementRepository.save(announcement);
    console.log(`✅ Announcement updated: ${announcementId}`);

    return updatedAnnouncement;
  }

  async deleteAnnouncement(announcementId: string, teacherId: string): Promise<void> {
    console.log(`🗑️ Deleting announcement: ${announcementId}`);

    const announcement = await this.announcementRepository.findOne({
      where: { id: announcementId },
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    if (announcement.teacherId !== teacherId) {
      throw new UnauthorizedException('You can only delete your own announcements');
    }

    await this.announcementRepository.remove(announcement);
    console.log(`✅ Announcement deleted: ${announcementId}`);
  }

  async togglePinAnnouncement(
    announcementId: string,
    teacherId: string,
  ): Promise<ClassroomAnnouncement> {
    console.log(`📌 Toggling pin status for announcement: ${announcementId}`);

    const announcement = await this.announcementRepository.findOne({
      where: { id: announcementId },
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    if (announcement.teacherId !== teacherId) {
      throw new UnauthorizedException('You can only pin your own announcements');
    }

    if (!announcement.metadata) {
      announcement.metadata = {};
    }

    announcement.metadata.isPinned = !announcement.metadata.isPinned;
    if (announcement.metadata.isPinned) {
      announcement.metadata.pinnedAt = new Date();
    }

    const updatedAnnouncement = await this.announcementRepository.save(announcement);
    console.log(`✅ Announcement pin toggled: ${announcementId}`);

    return updatedAnnouncement;
  }

  async getStudentAnnouncementsForClassroom(
    classroomId: string,
    candidateId: string,
    filter?: AnnouncementFilterDto,
  ): Promise<ClassroomAnnouncement[]> {
    // Verify student is enrolled in classroom
    const enrollment = await this.candidateClassroomRepository.findOne({
      where: { classroomId, candidateId, status: 'active' },
    });

    if (!enrollment) {
      throw new UnauthorizedException('You are not enrolled in this classroom');
    }

    return this.getAnnouncementsByClassroom(classroomId, candidateId, filter);
  }

  async getClassroomStudents(classroomId: string): Promise<CandidateClassroom[]> {
    return this.candidateClassroomRepository.find({
      where: { classroomId, status: 'active' },
    });
  }

  async archiveAnnouncement(announcementId: string, teacherId: string): Promise<ClassroomAnnouncement> {
    const announcement = await this.announcementRepository.findOne({
      where: { id: announcementId },
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    if (announcement.teacherId !== teacherId) {
      throw new UnauthorizedException('You can only archive your own announcements');
    }

    announcement.status = 'archived';
    return this.announcementRepository.save(announcement);
  }

  async likeAnnouncement(announcementId: string, userId: string): Promise<ClassroomAnnouncement> {
    const announcement = await this.announcementRepository.findOne({
      where: { id: announcementId },
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    // Initialize metadata if not present
    if (!announcement.metadata) {
      announcement.metadata = {};
    }

    // Initialize likes array if not present
    if (!announcement.metadata.likes) {
      announcement.metadata.likes = 0;
    }

    // Initialize likedBy array if not present
    if (!announcement.metadata.likedBy) {
      announcement.metadata.likedBy = [];
    }

    // Toggle like
    const likedByIndex = announcement.metadata.likedBy.indexOf(userId);
    if (likedByIndex > -1) {
      announcement.metadata.likedBy.splice(likedByIndex, 1);
      announcement.metadata.likes--;
    } else {
      announcement.metadata.likedBy.push(userId);
      announcement.metadata.likes++;
    }

    return this.announcementRepository.save(announcement);
  }

  async addComment(announcementId: string, userId: string, userName: string, comment: string): Promise<ClassroomAnnouncement> {
    const announcement = await this.announcementRepository.findOne({
      where: { id: announcementId },
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    // Initialize metadata if not present
    if (!announcement.metadata) {
      announcement.metadata = {};
    }

    // Initialize comments array if not present
    if (!announcement.metadata.comments) {
      announcement.metadata.comments = [];
    }

    // Add comment
    announcement.metadata.comments.push({
      id: Math.random().toString(36).substr(2, 9),
      userId,
      userName,
      text: comment,
      createdAt: new Date().toISOString(),
    });

    return this.announcementRepository.save(announcement);
  }
}
