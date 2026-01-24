import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  HttpException,
  HttpStatus,
  BadRequestException,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  SetMetadata,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import type { Multer } from 'multer';
import { ClassroomService } from './classroom.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateClassroomDto,
  UpdateClassroomDto,
  InviteCandidatesToClassroomDto,
  RespondToClassroomInvitationDto,
} from './dto/classroom.dto';

@Controller('classrooms')
@UseGuards(JwtAuthGuard)
export class ClassroomController {
  constructor(private readonly classroomService: ClassroomService) {}

  // Teacher Routes
  @Post()
  async createClassroom(
    @Request() req,
    @Body() createClassroomDto: CreateClassroomDto,
  ) {
    try {
      const teacherId = req.user?.id || 'test-teacher-id'; // Will use JWT in production
      const organizationId = req.user?.organizationId || 'default-org';

      const classroom = await this.classroomService.createClassroom(
        teacherId,
        organizationId,
        createClassroomDto,
      );

      return {
        success: true,
        data: classroom,
        message: 'Classroom created successfully',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/teacher/list')
  async getTeacherClassrooms(@Request() req) {
    try {
      const teacherId = req.user?.id || 'test-teacher-id';
      const classrooms = await this.classroomService.getTeacherClassrooms(teacherId);

      return {
        success: true,
        data: classrooms,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':classroomId')
  async getClassroomDetail(
    @Request() req,
    @Param('classroomId') classroomId: string,
  ) {
    try {
      const teacherId = req.user?.id || 'test-teacher-id';
      const classroom = await this.classroomService.getClassroomDetail(
        teacherId,
        classroomId,
      );

      return {
        success: true,
        data: classroom,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }

  @Put(':classroomId')
  async updateClassroom(
    @Request() req,
    @Param('classroomId') classroomId: string,
    @Body() updateClassroomDto: UpdateClassroomDto,
  ) {
    try {
      const teacherId = req.user?.id || 'test-teacher-id';
      const classroom = await this.classroomService.updateClassroom(
        teacherId,
        classroomId,
        updateClassroomDto,
      );

      return {
        success: true,
        data: classroom,
        message: 'Classroom updated successfully',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':classroomId')
  async deleteClassroom(
    @Request() req,
    @Param('classroomId') classroomId: string,
  ) {
    try {
      const teacherId = req.user?.id || 'test-teacher-id';
      await this.classroomService.deleteClassroom(teacherId, classroomId);

      return {
        success: true,
        message: 'Classroom deleted successfully',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Invitation Routes
  @Post(':classroomId/invite')
  async inviteCandidates(
    @Request() req,
    @Param('classroomId') classroomId: string,
    @Body() inviteDto: InviteCandidatesToClassroomDto,
  ) {
    try {
      if (!inviteDto.emails || inviteDto.emails.length === 0) {
        throw new BadRequestException('No emails provided');
      }

      const teacherId = req.user?.id || 'test-teacher-id';
      const invitations = await this.classroomService.inviteCandidates(
        teacherId,
        classroomId,
        inviteDto,
      );

      return {
        success: true,
        data: invitations,
        message: `Successfully invited ${invitations.length} candidate(s)`,
      };
    } catch (error) {
      console.error('Error inviting candidates:', error.message);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to send invitations',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':classroomId/invitations')
  async getClassroomInvitations(
    @Request() req,
    @Param('classroomId') classroomId: string,
  ) {
    try {
      const teacherId = req.user?.id || 'test-teacher-id';
      const invitations = await this.classroomService.getClassroomInvitations(
        teacherId,
        classroomId,
      );

      return {
        success: true,
        data: invitations,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':classroomId/enrollments')
  async getClassroomEnrollments(
    @Request() req,
    @Param('classroomId') classroomId: string,
  ) {
    try {
      const teacherId = req.user?.id || 'test-teacher-id';
      const enrollments = await this.classroomService.getClassroomEnrollments(
        teacherId,
        classroomId,
      );

      return {
        success: true,
        data: enrollments,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}

// Candidate Routes Controller
@Controller('candidate/classrooms')
export class CandidateClassroomController {
  constructor(private readonly classroomService: ClassroomService) {}

  @Get('pending-invitations')
  async getPendingInvitations(@Request() req, @Query('email') email?: string) {
    try {
      const candidateEmail = email || req.user?.email || req.body?.email;
      if (!candidateEmail) {
        throw new Error('Candidate email is required');
      }
      
      const invitations = await this.classroomService.getPendingInvitations(
        candidateEmail,
      );

      return {
        success: true,
        data: invitations,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('invitations/:invitationId/respond')
  @UseGuards(JwtAuthGuard)
  async respondToInvitation(
    @Request() req,
    @Param('invitationId') invitationId: string,
    @Body() respondDto: RespondToClassroomInvitationDto,
  ) {
    try {
      const candidateId = req.user?.id;
      const candidateEmail = req.user?.email;

      if (!candidateId) {
        throw new BadRequestException('User ID not found in session. Please login again.');
      }

      if (!candidateEmail) {
        throw new BadRequestException('User email not found in session. Please login again.');
      }

      console.log(`🔔 [CandidateController] Responding to invitation:`, {
        invitationId,
        candidateId,
        candidateEmail,
        status: respondDto.status,
      });

      if (!invitationId) {
        throw new Error('Invitation ID is required');
      }

      if (!respondDto.status) {
        throw new Error('Status is required');
      }

      const invitation = await this.classroomService.respondToInvitation(
        invitationId,
        candidateId,
        candidateEmail,
        respondDto.status,
      );

      console.log(`✅ [CandidateController] Invitation response successful:`, invitation);

      return {
        success: true,
        data: invitation,
        message: `Invitation ${respondDto.status} successfully`,
      };
    } catch (error) {
      console.error(`❌ [CandidateController] Error responding to invitation:`, error.message, error.stack);
      throw new HttpException(error.message || 'Failed to respond to invitation', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('list')
  @UseGuards(JwtAuthGuard)
  async getCandidateClassrooms(@Request() req) {
    try {
      const candidateId = req.user?.id;

      if (!candidateId) {
        throw new BadRequestException('User ID not found in session. Please login again.');
      }

      const classrooms = await this.classroomService.getCandidateClassrooms(
        candidateId,
      );

      return {
        success: true,
        data: classrooms,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Material Upload
  @Post(':classroomId/materials/upload')
  @UseInterceptors(FileInterceptor('file', {
    dest: './uploads/materials',
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  }))
  async uploadMaterial(
    @Param('classroomId') classroomId: string,
    @UploadedFile() file: any,
    @Request() req,
  ) {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      const fileData = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        url: `/api/classrooms/${classroomId}/materials/download/${file.filename}`,
        uploadedAt: new Date(),
      };

      return {
        success: true,
        data: fileData,
        message: 'File uploaded successfully',
      };
    } catch (error) {
      console.error('Error uploading material:', error.message);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Download Material
  @Get(':classroomId/materials/download/:filename')
  @SetMetadata('isPublic', true)
  async downloadMaterial(
    @Param('classroomId') classroomId: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    try {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join('./uploads/materials', filename);

      if (!fs.existsSync(filePath)) {
        throw new HttpException('File not found', HttpStatus.NOT_FOUND);
      }

      const file = fs.readFileSync(filePath);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.send(file);
    } catch (error) {
      console.error('Error downloading material:', error.message);
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
