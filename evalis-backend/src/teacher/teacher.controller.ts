import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  // UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { InviteCandidatesDto } from './dto/invite-candidates.dto';
// import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'; // TODO: Implement JWT authentication

@Controller('api/teacher')
// @UseGuards(JwtAuthGuard) // TODO: Implement JWT authentication
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  // Subject Management
  @Post('subjects')
  async createSubject(
    @Request() req,
    @Body() createSubjectDto: CreateSubjectDto,
  ) {
    return this.teacherService.createSubject(req.user.id, createSubjectDto);
  }

  @Get('subjects')
  async getTeacherSubjects(@Request() req) {
    return this.teacherService.getTeacherSubjects(req.user.id);
  }

  @Get('subjects/:subjectId')
  async getSubjectDetail(
    @Request() req,
    @Param('subjectId') subjectId: string,
  ) {
    return this.teacherService.getSubjectDetail(req.user.id, subjectId);
  }

  @Put('subjects/:subjectId')
  async updateSubject(
    @Request() req,
    @Param('subjectId') subjectId: string,
    @Body() updateSubjectDto: UpdateSubjectDto,
  ) {
    return this.teacherService.updateSubject(
      req.user.id,
      subjectId,
      updateSubjectDto,
    );
  }

  @Delete('subjects/:subjectId')
  async deleteSubject(
    @Request() req,
    @Param('subjectId') subjectId: string,
  ) {
    return this.teacherService.deleteSubject(req.user.id, subjectId);
  }

  // Invitations
  @Post('subjects/:subjectId/invite')
  async inviteCandidates(
    @Request() req,
    @Param('subjectId') subjectId: string,
    @Body() inviteCandidatesDto: InviteCandidatesDto,
  ) {
    return this.teacherService.inviteCandidates(
      req.user.id,
      subjectId,
      inviteCandidatesDto,
    );
  }

  @Get('invitations')
  async getInvitations(@Request() req) {
    return this.teacherService.getInvitations(req.user.id);
  }

  @Get('notifications')
  async getNotifications(@Request() req) {
    return this.teacherService.getNotifications(req.user.id);
  }

  @Put('notifications/:notificationId/read')
  async markNotificationAsRead(
    @Request() req,
    @Param('notificationId') notificationId: string,
  ) {
    return this.teacherService.markNotificationAsRead(notificationId);
  }
}
