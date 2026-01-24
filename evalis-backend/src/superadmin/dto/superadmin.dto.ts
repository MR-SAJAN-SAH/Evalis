import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';

export enum SubscriptionPlanEnum {
  FREE_TIER = 'Free Tier',
  GO = 'Go',
  ADVANCED = 'Advanced',
}

export class CreateAdminDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  organizationName: string;

  @IsEnum(SubscriptionPlanEnum)
  subscriptionPlan: SubscriptionPlanEnum;
}

export class SuperAdminLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class AdminLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  organizationName?: string;
}
