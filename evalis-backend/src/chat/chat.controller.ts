import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DirectChatService } from './direct-chat.service';
import { GroupChatService } from './group-chat.service';
import { ChatUtilityService } from './chat-utility.service';
import { UsersService } from '../users/users.service';
import { CreateDirectChatDto } from './dto/chat.dto';
import { CreateChatGroupDto, UpdateChatGroupDto, InviteMembersDto } from './dto/chat-group.dto';
import { CreateChatMessageDto, UpdateChatMessageDto } from './dto/chat-message.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private directChatService: DirectChatService,
    private groupChatService: GroupChatService,
    private chatUtilityService: ChatUtilityService,
    private usersService: UsersService,
  ) {}

  // ========== DIRECT CHAT ENDPOINTS ==========

  @Get('direct-chats')
  async getDirectChats(@Request() req) {
    const userId = req.user.sub;
    const organizationId = req.user.organizationId;
    return this.directChatService.getDirectChats(userId, organizationId);
  }

  @Post('direct-chats/create')
  async createDirectChat(@Request() req, @Body() dto: CreateDirectChatDto) {
    const userId = req.user.sub;
    const organizationId = req.user.organizationId;
    return this.directChatService.getOrCreateDirectChat(userId, dto.userId, organizationId);
  }

  @Get('direct-chats/:chatId/messages')
  async getDirectChatMessages(
    @Request() req,
    @Param('chatId') chatId: string,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 50,
  ) {
    const userId = req.user.sub;
    return this.directChatService.getDirectChatMessages(chatId, userId, skip, take);
  }

  @Post('direct-chats/:chatId/messages')
  async sendDirectMessage(
    @Request() req,
    @Param('chatId') chatId: string,
    @Body() dto: CreateChatMessageDto,
  ) {
    const userId = req.user.sub;
    return this.directChatService.sendDirectMessage(chatId, userId, dto);
  }

  @Put('messages/:messageId')
  async editMessage(@Request() req, @Param('messageId') messageId: string, @Body() dto: UpdateChatMessageDto) {
    const userId = req.user.sub;
    return this.directChatService.editMessage(messageId, userId, dto);
  }

  @Delete('messages/:messageId')
  async deleteMessage(@Request() req, @Param('messageId') messageId: string) {
    const userId = req.user.sub;
    await this.directChatService.deleteMessage(messageId, userId);
    return { message: 'Message deleted successfully' };
  }

  @Post('direct-chats/:chatId/mark-read')
  async markChatAsRead(@Request() req, @Param('chatId') chatId: string) {
    const userId = req.user.sub;
    await this.directChatService.markAsRead(chatId, userId);
    return { message: 'Chat marked as read' };
  }

  @Post('direct-chats/:chatId/archive')
  async archiveChat(@Request() req, @Param('chatId') chatId: string) {
    const userId = req.user.sub;
    await this.directChatService.archiveChat(chatId, userId);
    return { message: 'Chat archived' };
  }

  @Post('direct-chats/:chatId/block/:blockUserId')
  async blockUser(
    @Request() req,
    @Param('chatId') chatId: string,
    @Param('blockUserId') blockUserId: string,
  ) {
    const userId = req.user.sub;
    await this.directChatService.blockUser(chatId, userId, blockUserId);
    return { message: 'User blocked' };
  }

  @Get('direct-chats/:chatId/search')
  async searchDirectChatMessages(
    @Request() req,
    @Param('chatId') chatId: string,
    @Query('q') searchQuery: string,
  ) {
    const userId = req.user.sub;
    return this.directChatService.searchChatMessages(chatId, userId, searchQuery);
  }

  @Get('organization-users')
  async getOrganizationUsers(@Request() req) {
    try {
      const organizationId = req.user.organizationId;
      const currentUserId = req.user.sub;
      console.log('🔍 [CHAT] GET /organization-users - orgId:', organizationId, 'userId:', currentUserId);
      
      let users = await this.usersService.getOrganizationUsersForChat(organizationId);
      console.log('📊 [CHAT] Found', users.length, 'active users in organization');
      
      // If no active users found, include inactive users as well
      if (users.length === 0) {
        console.log('⚠️ [CHAT] No active users found, fetching all users including inactive...');
        users = await this.usersService.getOrganizationUsersForChatIncludingInactive(organizationId);
        console.log('📊 [CHAT] Found', users.length, 'total users including inactive');
      }
      
      // Filter out the current user from the list
      const result = users
        .filter((user) => user.id !== currentUserId)
        .map((user) => ({
          id: user.id,
          name: user.name || user.email,
          email: user.email,
          role: user.role || 'User',
          isActive: user.isActive,
        }));
      console.log('✅ [CHAT] Returning', result.length, 'users (excluding current)');
      return result;
    } catch (error) {
      console.error('❌ [CHAT] Error in getOrganizationUsers:', error);
      throw error;
    }
  }

  // ========== GROUP CHAT ENDPOINTS ==========

  @Get('groups')
  async getChatGroups(@Request() req) {
    const userId = req.user.sub;
    const organizationId = req.user.organizationId;
    return this.groupChatService.getChatGroups(userId, organizationId);
  }

  @Post('groups/create')
  async createChatGroup(@Request() req, @Body() dto: CreateChatGroupDto) {
    const userId = req.user.sub;
    const organizationId = req.user.organizationId;
    return this.groupChatService.createChatGroup(userId, organizationId, dto);
  }

  @Get('groups/:groupId')
  async getChatGroupDetails(@Request() req, @Param('groupId') groupId: string) {
    const userId = req.user.sub;
    return this.groupChatService.getChatGroupDetails(groupId, userId);
  }

  @Get('groups/:groupId/messages')
  async getGroupMessages(
    @Request() req,
    @Param('groupId') groupId: string,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 50,
  ) {
    const userId = req.user.sub;
    return this.groupChatService.getGroupMessages(groupId, userId, skip, take);
  }

  @Post('groups/:groupId/messages')
  async sendGroupMessage(
    @Request() req,
    @Param('groupId') groupId: string,
    @Body() dto: CreateChatMessageDto,
  ) {
    const userId = req.user.sub;
    return this.groupChatService.sendGroupMessage(groupId, userId, dto.content, dto.messageType);
  }

  @Put('groups/:groupId')
  async updateGroupInfo(@Request() req, @Param('groupId') groupId: string, @Body() dto: UpdateChatGroupDto) {
    const userId = req.user.sub;
    return this.groupChatService.updateGroupInfo(groupId, userId, dto);
  }

  @Post('groups/:groupId/invite')
  async inviteMembers(
    @Request() req,
    @Param('groupId') groupId: string,
    @Body() dto: InviteMembersDto,
  ) {
    const userId = req.user.sub;
    const organizationId = req.user.organizationId;

    const results: any[] = [];
    for (const memberId of dto.memberIds) {
      try {
        const member = await this.groupChatService.inviteMember(groupId, userId, memberId, organizationId);
        results.push(member);
      } catch (error: any) {
        results.push({ error: error.message, memberId });
      }
    }

    return { results };
  }

  @Post('groups/:groupId/invitations/:membershipId/accept')
  async acceptGroupInvitation(
    @Request() req,
    @Param('groupId') groupId: string,
    @Param('membershipId') membershipId: string,
  ) {
    const userId = req.user.sub;
    await this.groupChatService.acceptGroupInvitation(groupId, userId);
    return { message: 'Invitation accepted' };
  }

  @Post('groups/:groupId/invitations/:membershipId/reject')
  async rejectGroupInvitation(
    @Request() req,
    @Param('groupId') groupId: string,
    @Param('membershipId') membershipId: string,
  ) {
    const userId = req.user.sub;
    await this.groupChatService.rejectGroupInvitation(groupId, userId);
    return { message: 'Invitation rejected' };
  }

  @Delete('groups/:groupId/members/:memberId')
  async removeMember(
    @Request() req,
    @Param('groupId') groupId: string,
    @Param('memberId') memberId: string,
  ) {
    const userId = req.user.sub;
    await this.groupChatService.removeMember(groupId, userId, memberId);
    return { message: 'Member removed from group' };
  }

  @Post('groups/:groupId/mute')
  async muteGroup(@Request() req, @Param('groupId') groupId: string) {
    const userId = req.user.sub;
    await this.groupChatService.muteGroup(groupId, userId);
    return { message: 'Group muted' };
  }

  @Post('groups/:groupId/unmute')
  async unmuteGroup(@Request() req, @Param('groupId') groupId: string) {
    const userId = req.user.sub;
    await this.groupChatService.unmuteGroup(groupId, userId);
    return { message: 'Group unmuted' };
  }

  @Get('groups/:groupId/search')
  async searchGroupMessages(
    @Request() req,
    @Param('groupId') groupId: string,
    @Query('q') searchQuery: string,
  ) {
    const userId = req.user.sub;
    return this.groupChatService.searchGroupMessages(groupId, userId, searchQuery);
  }

  // ========== NOTIFICATION ENDPOINTS ==========

  @Get('notifications')
  async getNotifications(
    @Request() req,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 20,
  ) {
    const userId = req.user.sub;
    return this.chatUtilityService.getNotifications(userId, skip, take);
  }

  @Get('notifications/unread-count')
  async getUnreadNotificationsCount(@Request() req) {
    const userId = req.user.sub;
    const count = await this.chatUtilityService.getUnreadNotificationsCount(userId);
    return { unreadCount: count };
  }

  @Put('notifications/:notificationId/mark-read')
  async markNotificationAsRead(@Param('notificationId') notificationId: string) {
    await this.chatUtilityService.markNotificationAsRead(notificationId);
    return { message: 'Notification marked as read' };
  }

  @Put('notifications/mark-all-read')
  async markAllNotificationsAsRead(@Request() req) {
    const userId = req.user.sub;
    await this.chatUtilityService.markAllNotificationsAsRead(userId);
    return { message: 'All notifications marked as read' };
  }

  @Delete('notifications/:notificationId')
  async deleteNotification(@Param('notificationId') notificationId: string) {
    await this.chatUtilityService.deleteNotification(notificationId);
    return { message: 'Notification deleted' };
  }

  @Delete('notifications/clear-all')
  async deleteAllNotifications(@Request() req) {
    const userId = req.user.sub;
    await this.chatUtilityService.deleteAllNotifications(userId);
    return { message: 'All notifications cleared' };
  }
}
