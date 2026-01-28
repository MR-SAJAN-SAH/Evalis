import { IsString, IsOptional, IsUUID, IsArray } from 'class-validator';

export class CreateChatGroupDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  memberIds: string[]; // Initial members to invite

  @IsString()
  @IsOptional()
  profilePicture?: string;
}

export class UpdateChatGroupDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  profilePicture?: string;
}

export class InviteMembersDto {
  @IsArray()
  @IsUUID('4', { each: true })
  memberIds: string[];
}

export class ChatGroupResponseDto {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  organizationId: string;
  profilePicture: string;
  memberCount: number;
  lastMessageTime: Date;
  createdAt: Date;
  members?: {
    id: string;
    userId: string;
    invitationStatus: string;
    user?: {
      id: string;
      name: string;
      email: string;
    };
  }[];
}
