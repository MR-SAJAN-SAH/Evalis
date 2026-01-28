import { Controller, Get, Put, Param, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(@Request() req: any) {
    const userId = req.user.id;
    return this.notificationsService.getNotifications(userId);
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req: any) {
    const userId = req.user.id;
    return this.notificationsService.getUnreadCount(userId);
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Put('mark-all-read')
  async markAllAsRead(@Request() req: any) {
    const userId = req.user.id;
    return this.notificationsService.markAllAsRead(userId);
  }

  @Put(':id/unread')
  async markAsUnread(@Param('id') id: string) {
    return this.notificationsService.markAsUnread(id);
  }

  @Get('recent')
  async getRecentNotifications(@Request() req: any) {
    const userId = req.user.id;
    return this.notificationsService.getRecentNotifications(userId, 10);
  }
}
