import { IsString, IsUUID } from 'class-validator';

export class CreateDirectChatDto {
  @IsUUID()
  userId: string;
}

export class DirectChatResponseDto {
  id: string;
  user1Id: string;
  user2Id: string;
  organizationId: string;
  lastMessageTime: Date;
  createdAt: Date;
  otherUser?: {
    id: string;
    name: string;
    email: string;
  };
}
