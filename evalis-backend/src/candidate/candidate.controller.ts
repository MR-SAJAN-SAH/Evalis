import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  // UseGuards,
  Request,
} from '@nestjs/common';
import { CandidateService } from './candidate.service';
// import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'; // TODO: Implement JWT authentication

@Controller('api/candidate')
// @UseGuards(JwtAuthGuard) // TODO: Implement JWT authentication
export class CandidateController {
  constructor(private readonly candidateService: CandidateService) {}

  @Get('invitations/pending')
  async getPendingInvitations(@Request() req) {
    return this.candidateService.getPendingInvitations(req.user.email);
  }

  @Post('invitations/:invitationId/respond')
  async respondToInvitation(
    @Request() req,
    @Param('invitationId') invitationId: string,
    @Body() { status }: { status: 'accepted' | 'rejected' },
  ) {
    return this.candidateService.respondToInvitation(
      invitationId,
      status,
      req.user.id,
      req.user.email,
    );
  }

  @Get('subjects')
  async getCandidateSubjects(@Request() req) {
    return this.candidateService.getCandidateSubjects(req.user.id);
  }

  @Get('notifications')
  async getNotifications(@Request() req) {
    return this.candidateService.getNotifications(req.user.id);
  }

  @Put('notifications/:notificationId/read')
  async markNotificationAsRead(
    @Request() req,
    @Param('notificationId') notificationId: string,
  ) {
    return this.candidateService.markNotificationAsRead(notificationId);
  }
}
