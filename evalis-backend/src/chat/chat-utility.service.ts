import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatNotification } from './entities/chat-notification.entity';
import { UserOnlineStatus } from './entities/user-online-status.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ChatUtilityService {
  constructor(
    @InjectRepository(ChatNotification)
    private notificationRepository: Repository<ChatNotification>,
    @InjectRepository(UserOnlineStatus)
    private onlineStatusRepository: Repository<UserOnlineStatus>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getNotifications(userId: string, skip: number = 0, take: number = 20): Promise<ChatNotification[]> {
    return this.notificationRepository.find({
      where: { userId },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
  }

  async getUnreadNotificationsCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.notificationRepository.update(
      { id: notificationId },
      { isRead: true, readAt: new Date() },
    );
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
  }

  async setUserOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    try {
      let status = await this.onlineStatusRepository.findOne({ where: { userId } });

      if (!status) {
        status = this.onlineStatusRepository.create({
          userId,
          isOnline,
          lastSeenAt: new Date(),
        });
      } else {
        status.isOnline = isOnline;
        status.lastSeenAt = new Date();
      }

      await this.onlineStatusRepository.save(status);
    } catch (error) {
      // Silently ignore errors - UserOnlineStatus table may not exist
      console.debug('[Chat] Could not update user online status:', error.message);
    }
  }

  async setUserTypingStatus(userId: string, isTyping: boolean, chatId?: string): Promise<void> {
    let status = await this.onlineStatusRepository.findOne({ where: { userId } });

    if (!status) {
      status = this.onlineStatusRepository.create({
        userId,
        isTyping,
        typingInChatId: chatId || null,
      });
    } else {
      status.isTyping = isTyping;
      status.typingInChatId = chatId || null;
    }

    await this.onlineStatusRepository.save(status);
  }

  async getUserOnlineStatus(userId: string): Promise<UserOnlineStatus | null> {
    return this.onlineStatusRepository.findOne({
      where: { userId },
      relations: ['user'],
    });
  }

  async getOnlineUsers(organizationId: string): Promise<User[]> {
    const onlineStatuses = await this.onlineStatusRepository.find({
      where: { isOnline: true },
      relations: ['user'],
    });

    return onlineStatuses
      .filter((status) => status.user.organizationId === organizationId)
      .map((status) => status.user);
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await this.notificationRepository.delete({ id: notificationId });
  }

  async deleteAllNotifications(userId: string): Promise<void> {
    await this.notificationRepository.delete({ userId });
  }
}
