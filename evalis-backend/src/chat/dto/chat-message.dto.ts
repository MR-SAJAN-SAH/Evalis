import { IsString, IsOptional, IsUUID, IsArray } from 'class-validator';

export class CreateChatMessageDto {
  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  messageType?: string; // text, file, image, voice

  @IsString()
  @IsOptional()
  fileUrl?: string;

  @IsString()
  @IsOptional()
  fileName?: string;

  @IsString()
  @IsOptional()
  mimeType?: string;
}

export class UpdateChatMessageDto {
  @IsString()
  content: string;
}

export class ChatMessageResponseDto {
  id: string;
  chatId: string;
  chatGroupId: string;
  senderId: string;
  content: string;
  messageType: string;
  fileUrl: string;
  fileName: string;
  readByUserIds: string[];
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  sender?: {
    id: string;
    name: string;
  };
}
