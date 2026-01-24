import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateClassroomDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsOptional()
  organizationId?: string;

  @IsArray()
  @IsOptional()
  sections?: string[];

  @IsOptional()
  metadata?: {
    semester?: string;
    academicYear?: string;
    room?: string;
    meetingLink?: string;
    [key: string]: any;
  };
}

export class UpdateClassroomDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsArray()
  @IsOptional()
  sections?: string[];

  @IsOptional()
  metadata?: {
    semester?: string;
    academicYear?: string;
    room?: string;
    meetingLink?: string;
    [key: string]: any;
  };
}

export class InviteCandidatesToClassroomDto {
  @IsArray()
  @IsString({ each: true })
  emails: string[];

  @IsString()
  @IsOptional()
  message?: string;

  @IsString()
  @IsOptional()
  expiryDays?: string;
}

export class RespondToClassroomInvitationDto {
  @IsString()
  @IsNotEmpty()
  status: 'accepted' | 'rejected';

  @IsString()
  @IsOptional()
  message?: string;
}
