import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CandidateNotification, NotificationType } from './entities/candidate-notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(CandidateNotification)
    private notificationsRepository: Repository<CandidateNotification>,
  ) {}

  async getNotifications(candidateId: string) {
    return this.notificationsRepository.find({
      where: { candidateId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async getRecentNotifications(candidateId: string, limit: number = 10) {
    return this.notificationsRepository.find({
      where: { candidateId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getUnreadCount(candidateId: string) {
    const count = await this.notificationsRepository.count({
      where: { candidateId, read: false },
    });
    return { unreadCount: count };
  }

  async markAsRead(notificationId: string) {
    await this.notificationsRepository.update(
      { id: notificationId },
      { read: true },
    );
    return { success: true };
  }

  async markAsUnread(notificationId: string) {
    await this.notificationsRepository.update(
      { id: notificationId },
      { read: false },
    );
    return { success: true };
  }

  async markAllAsRead(candidateId: string) {
    await this.notificationsRepository.update(
      { candidateId, read: false },
      { read: true },
    );
    return { success: true };
  }

  async createNotification(
    candidateId: string,
    type: NotificationType,
    title: string,
    message: string,
    examId?: string,
    examName?: string,
    actionUrl?: string,
  ) {
    const notification = this.notificationsRepository.create({
      candidateId,
      type,
      title,
      message,
      examId,
      examName,
      actionUrl,
      read: false,
    });

    return this.notificationsRepository.save(notification);
  }

  async deleteOldNotifications(daysOld: number = 30) {
    const date = new Date();
    date.setDate(date.getDate() - daysOld);

    return this.notificationsRepository.delete({
      createdAt: { $lt: date } as any,
    });
  }
}
