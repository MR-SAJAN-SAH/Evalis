import { IsString, IsOptional } from 'class-validator';

export class ChatNotificationResponseDto {
  id: string;
  userId: string;
  notificationType: string;
  relatedId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  sender?: {
    id: string;
    name: string;
  };
}
