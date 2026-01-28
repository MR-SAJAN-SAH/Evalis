import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DirectChatService } from './direct-chat.service';
import { GroupChatService } from './group-chat.service';
import { ChatUtilityService } from './chat-utility.service';
import { CreateChatMessageDto } from './dto/chat-message.dto';

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ChatGateway');
  private userSockets = new Map<string, string>(); // userId -> socketId

  constructor(
    private jwtService: JwtService,
    private directChatService: DirectChatService,
    private groupChatService: GroupChatService,
    private chatUtilityService: ChatUtilityService,
  ) {}

  async handleConnection(socket: Socket) {
    try {
      const token = socket.handshake.auth.token;
      const decoded = this.jwtService.verify(token);
      const userId = decoded.sub;

      this.userSockets.set(userId, socket.id);
      await this.chatUtilityService.setUserOnlineStatus(userId, true);

      socket.data.userId = userId;
      socket.data.organizationId = decoded.organizationId;

      // Join user's own room for direct notifications
      socket.join(`user:${userId}`);

      // Broadcast user online status
      this.server.emit('user:online', { userId, status: 'online' });

      this.logger.log(`User ${userId} connected with socket ${socket.id}`);
    } catch (error) {
      this.logger.error('Connection error:', error);
      socket.disconnect();
    }
  }

  async handleDisconnect(socket: Socket) {
    const userId = socket.data.userId;
    if (userId) {
      this.userSockets.delete(userId);
      await this.chatUtilityService.setUserOnlineStatus(userId, false);

      // Broadcast user offline status
      this.server.emit('user:offline', { userId, status: 'offline' });

      this.logger.log(`User ${userId} disconnected`);
    }
  }

  // DIRECT CHAT EVENTS
  @SubscribeMessage('direct:send-message')
  async handleDirectMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { chatId: string; content: string; messageType?: string },
  ) {
    const userId = socket.data.userId;
    const organizationId = socket.data.organizationId;

    try {
      const message = await this.directChatService.sendDirectMessage(data.chatId, userId, {
        content: data.content,
        messageType: data.messageType || 'text',
      });

      // Send to both users in the chat
      if (message) {
        this.server.to(`chat:${data.chatId}`).emit('direct:message-received', message);
      }
    } catch (error: any) {
      socket.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('direct:join-chat')
  async handleJoinDirectChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    socket.join(`chat:${data.chatId}`);
    socket.emit('direct:joined', { chatId: data.chatId });
  }

  @SubscribeMessage('direct:leave-chat')
  async handleLeaveDirectChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    socket.leave(`chat:${data.chatId}`);
    socket.emit('direct:left', { chatId: data.chatId });
  }

  @SubscribeMessage('direct:typing')
  async handleDirectTyping(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { chatId: string; isTyping: boolean },
  ) {
    const userId = socket.data.userId;
    await this.chatUtilityService.setUserTypingStatus(userId, data.isTyping, data.chatId);

    // Broadcast typing status to chat room
    this.server.to(`chat:${data.chatId}`).emit('direct:user-typing', {
      userId,
      chatId: data.chatId,
      isTyping: data.isTyping,
    });
  }

  // GROUP CHAT EVENTS
  @SubscribeMessage('group:send-message')
  async handleGroupMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { groupId: string; content: string; messageType?: string },
  ) {
    const userId = socket.data.userId;

    try {
      const message = await this.groupChatService.sendGroupMessage(
        data.groupId,
        userId,
        data.content,
        data.messageType || 'text',
      );

      // Send to all group members
      this.server.to(`group:${data.groupId}`).emit('group:message-received', message);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('group:join-group')
  async handleJoinGroup(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { groupId: string },
  ) {
    socket.join(`group:${data.groupId}`);
    const userId = socket.data.userId;

    // Broadcast user joined
    this.server.to(`group:${data.groupId}`).emit('group:user-joined', {
      userId,
      groupId: data.groupId,
    });

    socket.emit('group:joined', { groupId: data.groupId });
  }

  @SubscribeMessage('group:leave-group')
  async handleLeaveGroup(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { groupId: string },
  ) {
    socket.leave(`group:${data.groupId}`);
    const userId = socket.data.userId;

    this.server.to(`group:${data.groupId}`).emit('group:user-left', {
      userId,
      groupId: data.groupId,
    });

    socket.emit('group:left', { groupId: data.groupId });
  }

  @SubscribeMessage('group:typing')
  async handleGroupTyping(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { groupId: string; isTyping: boolean },
  ) {
    const userId = socket.data.userId;
    await this.chatUtilityService.setUserTypingStatus(userId, data.isTyping, data.groupId);

    // Broadcast typing status to group
    this.server.to(`group:${data.groupId}`).emit('group:user-typing', {
      userId,
      groupId: data.groupId,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('group:member-invited')
  async handleMemberInvited(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { groupId: string; userId: string },
  ) {
    // Send notification to invited user
    const userSocket = this.userSockets.get(data.userId);
    if (userSocket) {
      this.server.to(`user:${data.userId}`).emit('notification:group-invitation', {
        groupId: data.groupId,
        invitedByUserId: socket.data.userId,
      });
    }
  }

  // NOTIFICATION EVENTS
  @SubscribeMessage('notification:mark-read')
  async handleMarkNotificationRead(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { notificationId: string },
  ) {
    const userId = socket.data.userId;
    try {
      await this.chatUtilityService.markNotificationAsRead(data.notificationId);
      socket.emit('notification:marked-read', { notificationId: data.notificationId });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('message:read-receipt')
  async handleReadReceipt(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { messageId: string; chatId: string },
  ) {
    const userId = socket.data.userId;

    // Broadcast read receipt to chat
    this.server.to(`chat:${data.chatId}`).emit('message:read-receipt', {
      messageId: data.messageId,
      readByUserId: userId,
    });
  }

  // Utility method to emit to user's personal room
  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  // Get list of online users
  getOnlineUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }
}
