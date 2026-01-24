import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  Query,
  HttpException,
  HttpStatus,
  Res,
  BadRequestException,
  SetMetadata,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AnnouncementService } from './services/announcement.service';
import { FileUploadService } from './services/file-upload.service';
import type { Express } from 'express';
import {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  AnnouncementFilterDto,
} from './dtos/announcement.dto';

@Controller('teacher/announcements')
@UseGuards(JwtAuthGuard)
export class AnnouncementController {
  constructor(
    private announcementService: AnnouncementService,
    private fileUploadService: FileUploadService,
  ) {}

  @Get('debug/classrooms')
  async getTeacherClassroomsDebug(@Request() req) {
    try {
      const teacherId = req.user?.id;
      console.log(`🔍 [Debug] Fetching classrooms for teacher: ${teacherId}`);
      
      const classrooms = await this.announcementService.getTeacherClassrooms(teacherId);
      console.log(`📚 [Debug] Found ${classrooms.length} classrooms:`, classrooms.map(c => ({ id: c.id, name: c.name, teacherId: c.teacherId })));
      
      return {
        success: true,
        data: classrooms,
        message: `Found ${classrooms.length} classrooms`,
      };
    } catch (error) {
      console.error(`❌ [Debug] Error:`, error.message);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('create')
  async createAnnouncement(
    @Request() req,
    @Body() createAnnouncementDto: CreateAnnouncementDto,
  ) {
    try {
      console.log(`🔔 [Controller] Creating announcement for classroom: ${createAnnouncementDto.classroomId}`);
      console.log(`👤 [Controller] User: ${JSON.stringify(req.user)}`);

      const teacherId = req.user?.id || 'test-teacher-id';
      const teacherName = req.user?.email || 'Teacher';

      console.log(`🎯 [Controller] Teacher ID: ${teacherId}`);
      console.log(`📋 [Controller] Announcement title: ${createAnnouncementDto.title}`);
      console.log(`📎 [Controller] Attachments: ${createAnnouncementDto.attachments?.length || 0}`);

      const announcement = await this.announcementService.createAnnouncement(
        teacherId,
        teacherName,
        createAnnouncementDto,
      );

      console.log(`✅ [Controller] Announcement created successfully`);

      return {
        success: true,
        data: announcement,
        message: 'Announcement created successfully',
      };
    } catch (error) {
      console.error(`❌ [Controller] Error creating announcement:`, error.message);
      // Respect the status code from the exception if it's an HttpException
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('classroom/:classroomId')
  async getAnnouncementsByClassroom(
    @Param('classroomId') classroomId: string,
    @Query() filter: AnnouncementFilterDto,
    @Request() req,
  ) {
    try {
      console.log(`📥 [Controller] Fetching announcements for classroom: ${classroomId}`);

      const candidateId = req.user?.id;
      const announcements = await this.announcementService.getAnnouncementsByClassroom(
        classroomId,
        candidateId,
        filter,
      );

      return {
        success: true,
        data: announcements,
        message: `Retrieved ${announcements.length} announcements`,
      };
    } catch (error) {
      console.error(`❌ [Controller] Error fetching announcements:`, error.message);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('student/classroom/:classroomId')
  async getStudentAnnouncementsForClassroom(
    @Param('classroomId') classroomId: string,
    @Query() filter: AnnouncementFilterDto,
    @Request() req,
  ) {
    try {
      console.log(`📥 [Controller] Fetching student announcements for classroom: ${classroomId}`);

      const candidateId = req.user?.id;
      if (!candidateId) {
        throw new BadRequestException('User ID not found in session. Please login again.');
      }

      const announcements = await this.announcementService.getStudentAnnouncementsForClassroom(
        classroomId,
        candidateId,
        filter,
      );

      return {
        success: true,
        data: announcements,
        message: `Retrieved ${announcements.length} announcements`,
      };
    } catch (error) {
      console.error(`❌ [Controller] Error fetching announcements:`, error.message);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':announcementId')
  async getAnnouncement(
    @Param('announcementId') announcementId: string,
    @Request() req,
  ) {
    try {
      const candidateId = req.user?.id;
      if (!candidateId) {
        throw new BadRequestException('User ID not found in session. Please login again.');
      }

      const announcement = await this.announcementService.getAnnouncementForStudent(
        announcementId,
        candidateId,
      );

      return {
        success: true,
        data: announcement,
        message: 'Announcement retrieved successfully',
      };
    } catch (error) {
      console.error(`❌ [Controller] Error fetching announcement:`, error.message);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':announcementId')
  async updateAnnouncement(
    @Param('announcementId') announcementId: string,
    @Body() updateAnnouncementDto: UpdateAnnouncementDto,
    @Request() req,
  ) {
    try {
      console.log(`📝 [Controller] Updating announcement: ${announcementId}`);

      const teacherId = req.user?.id || 'test-teacher-id';
      const announcement = await this.announcementService.updateAnnouncement(
        announcementId,
        teacherId,
        updateAnnouncementDto,
      );

      return {
        success: true,
        data: announcement,
        message: 'Announcement updated successfully',
      };
    } catch (error) {
      console.error(`❌ [Controller] Error updating announcement:`, error.message);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':announcementId')
  async deleteAnnouncement(
    @Param('announcementId') announcementId: string,
    @Request() req,
  ) {
    try {
      console.log(`🗑️ [Controller] Deleting announcement: ${announcementId}`);

      const teacherId = req.user?.id || 'test-teacher-id';
      await this.announcementService.deleteAnnouncement(announcementId, teacherId);

      return {
        success: true,
        message: 'Announcement deleted successfully',
      };
    } catch (error) {
      console.error(`❌ [Controller] Error deleting announcement:`, error.message);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':announcementId/pin')
  async togglePin(
    @Param('announcementId') announcementId: string,
    @Request() req,
  ) {
    try {
      console.log(`📌 [Controller] Toggling pin for announcement: ${announcementId}`);

      const teacherId = req.user?.id || 'test-teacher-id';
      const announcement = await this.announcementService.togglePinAnnouncement(
        announcementId,
        teacherId,
      );

      return {
        success: true,
        data: announcement,
        message: 'Announcement pin toggled successfully',
      };
    } catch (error) {
      console.error(`❌ [Controller] Error toggling pin:`, error.message);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':announcementId/archive')
  async archiveAnnouncement(
    @Param('announcementId') announcementId: string,
    @Request() req,
  ) {
    try {
      const teacherId = req.user?.id || 'test-teacher-id';
      const announcement = await this.announcementService.archiveAnnouncement(
        announcementId,
        teacherId,
      );

      return {
        success: true,
        data: announcement,
        message: 'Announcement archived successfully',
      };
    } catch (error) {
      console.error(`❌ [Controller] Error archiving announcement:`, error.message);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':announcementId/like')
  async likeAnnouncement(
    @Param('announcementId') announcementId: string,
    @Request() req,
  ) {
    try {
      const userId = req.user?.id || 'test-user-id';
      const announcement = await this.announcementService.likeAnnouncement(
        announcementId,
        userId,
      );

      return {
        success: true,
        data: announcement,
        message: 'Announcement liked successfully',
      };
    } catch (error) {
      console.error(`❌ [Controller] Error liking announcement:`, error.message);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':announcementId/comment')
  async addComment(
    @Param('announcementId') announcementId: string,
    @Body('comment') comment: string,
    @Request() req,
  ) {
    try {
      const userId = req.user?.id || 'test-user-id';
      const userName = req.user?.name || 'Anonymous';
      const announcement = await this.announcementService.addComment(
        announcementId,
        userId,
        userName,
        comment,
      );

      return {
        success: true,
        data: announcement,
        message: 'Comment added successfully',
      };
    } catch (error) {
      console.error(`❌ [Controller] Error adding comment:`, error.message);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('upload/:classroomId')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  }))
  async uploadFile(
    @UploadedFile() file: any,
    @Param('classroomId') classroomId: string,
    @Request() req,
  ) {
    try {
      console.log(`📤 [Controller] Uploading file to classroom: ${classroomId}`);
      console.log(`📦 [Controller] File received:`, {
        originalname: file?.originalname,
        size: file?.size,
        mimetype: file?.mimetype,
        fieldname: file?.fieldname,
      });

      if (!file) {
        console.error('❌ No file provided in request');
        throw new BadRequestException('No file provided');
      }

      const attachment = await this.fileUploadService.uploadFile(file, classroomId);

      console.log(`✅ [Controller] File uploaded successfully: ${attachment.name}`);

      return {
        success: true,
        data: attachment,
        message: 'File uploaded successfully',
      };
    } catch (error) {
      console.error(`❌ [Controller] Error uploading file:`, error.message);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('files/:classroomId/:filename')
  @SetMetadata('isPublic', true)
  async getFile(
    @Param('classroomId') classroomId: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    try {
      const file = await this.fileUploadService.getFile(classroomId, filename);
      const mimeType = this.fileUploadService.getFileMimeType(filename);

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.send(file);
    } catch (error) {
      console.error(`❌ [Controller] Error serving file:`, error.message);
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get('classroom/:classroomId/students')
  async getClassroomStudents(
    @Param('classroomId') classroomId: string,
    @Request() req,
  ) {
    try {
      const students = await this.announcementService.getClassroomStudents(classroomId);

      return {
        success: true,
        data: students,
        message: `Retrieved ${students.length} students`,
      };
    } catch (error) {
      console.error(`❌ [Controller] Error fetching students:`, error.message);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
