import { Controller, Post, Get, Body, Param, Put, HttpCode, HttpStatus, BadRequestException, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CreateAdminDto,
  SuperAdminLoginDto,
  AdminLoginDto,
} from '../superadmin/dto/superadmin.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('superadmin/login')
  @HttpCode(HttpStatus.OK)
  async superAdminLogin(@Body() dto: SuperAdminLoginDto) {
    return this.authService.superAdminLogin(dto);
  }

  @Post('superadmin/create-admin')
  @HttpCode(HttpStatus.CREATED)
  async createAdmin(@Body() dto: CreateAdminDto) {
    return this.authService.createAdmin(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async adminLogin(@Body() dto: AdminLoginDto) {
    if (!dto.email || !dto.password) {
      throw new BadRequestException('Email and password are required');
    }
    return this.authService.adminLogin(dto.email, dto.password, dto.organizationName);
  }

  @Post('create-user')
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() body: any) {
    const { name, email, password, role, organizationName } = body;
    
    if (!name || !email || !password || !role || !organizationName) {
      throw new BadRequestException('All fields are required');
    }

    return this.authService.createUser({
      name,
      email,
      password,
      role,
      organizationName,
    });
  }

  @Post('user-login')
  @HttpCode(HttpStatus.OK)
  async userLogin(@Body() body: any) {
    const { email, password } = body;
    
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    return this.authService.userLogin(email, password);
  }

  @Get('users')
  async getUsers(@Query('organizationName') organizationName: string) {
    return this.authService.getUsersByOrganization(organizationName);
  }

  @Get('user/:userId')
  async getUserProfile(@Param('userId') userId: string) {
    return this.authService.getUserProfile(userId);
  }

  @Put('user/:userId/profile')
  @HttpCode(HttpStatus.OK)
  async updateUserProfile(@Param('userId') userId: string, @Body() profileData: any) {
    return this.authService.updateUserProfile(userId, profileData);
  }

  @Get('superadmin/admins')
  async getAllAdmins() {
    return this.authService.getAllAdmins();
  }

  @Get('superadmin/organizations')
  async getAllOrganizations() {
    return this.authService.getAllOrganizations();
  }
}
