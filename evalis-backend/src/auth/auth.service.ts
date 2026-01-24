import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Admin } from '../superadmin/entities/admin.entity';
import { Organization } from '../superadmin/entities/organization.entity';
import { SubscriptionPlan } from '../superadmin/entities/subscription-plan.entity';
import { SuperAdmin } from '../superadmin/entities/superadmin.entity';
import { User } from '../users/entities/user.entity';
import { UserProfile } from '../users/entities/user-profile.entity';
import {
  CreateAdminDto,
  SuperAdminLoginDto,
  SubscriptionPlanEnum,
} from '../superadmin/dto/superadmin.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(SuperAdmin)
    private superAdminRepository: Repository<SuperAdmin>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(SubscriptionPlan)
    private subscriptionPlanRepository: Repository<SubscriptionPlan>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>,
    private jwtService: JwtService,
    private dataSource: DataSource,
  ) {
    this.initializeSuperAdmin();
  }

  async initializeSuperAdmin() {
    const superAdminExists = await this.superAdminRepository.findOne({
      where: { email: 'sajansah205@gmail.com' },
    });

    if (!superAdminExists) {
      const hashedPassword = await bcrypt.hash('AdminEvalis@9898', 10);
      const superAdmin = this.superAdminRepository.create({
        email: 'sajansah205@gmail.com',
        password: hashedPassword,
        name: 'Super Admin',
        isActive: true,
      });
      await this.superAdminRepository.save(superAdmin);
      console.log('✅ SuperAdmin account created: sajansah205@gmail.com');
    }
  }

  async initializeSubscriptionPlans() {
    const existingPlans = await this.subscriptionPlanRepository.count();
    if (existingPlans === 0) {
      const plans = [
        {
          name: SubscriptionPlanEnum.FREE_TIER,
          pricePerYear: 0,
          description: 'Free tier with limited features',
          features: {
            basicReporting: true,
          },
        },
        {
          name: SubscriptionPlanEnum.GO,
          pricePerYear: 1000,
          description: 'Go subscription - 1000 INR per year',
          features: {
            advancedReporting: true,
            apiAccess: true,
          },
        },
        {
          name: SubscriptionPlanEnum.ADVANCED,
          pricePerYear: 5000,
          description: 'Advanced subscription - 5000 INR per year',
          features: {
            advancedReporting: true,
            apiAccess: true,
            customIntegrations: true,
            dedicatedSupport: true,
          },
        },
      ];

      for (const plan of plans) {
        await this.subscriptionPlanRepository.save(
          this.subscriptionPlanRepository.create(plan),
        );
      }
    }
  }

  async superAdminLogin(dto: SuperAdminLoginDto) {
    const superAdmin = await this.superAdminRepository.findOne({
      where: { email: dto.email },
    });

    if (!superAdmin) {
      throw new UnauthorizedException('Invalid superadmin credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, superAdmin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid superadmin credentials');
    }

    const payload = {
      sub: superAdmin.id,
      email: superAdmin.email,
      role: 'superadmin',
    };

    return {
      access_token: this.jwtService.sign(payload),
      role: 'superadmin',
      email: superAdmin.email,
      organizationName: '',
      subscriptionPlan: '',
      name: superAdmin.name,
      userId: superAdmin.id,
    };
  }

  async createAdmin(dto: CreateAdminDto) {
    // Check if admin with email already exists
    const existingAdmin = await this.adminRepository.findOne({
      where: { email: dto.email },
    });

    if (existingAdmin) {
      throw new BadRequestException('Admin with this email already exists');
    }

    // Check if organization already exists
    const orgNameUpper = dto.organizationName.toUpperCase();
    const existingOrg = await this.organizationRepository.findOne({
      where: { name: orgNameUpper },
    });

    if (existingOrg) {
      throw new BadRequestException(
        'Organization with this name already exists',
      );
    }

    // Get subscription plan
    const subscriptionPlan = await this.subscriptionPlanRepository.findOne({
      where: { name: dto.subscriptionPlan },
    });

    if (!subscriptionPlan) {
      throw new BadRequestException('Invalid subscription plan');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create organization database
    const databaseName = `evalis_${orgNameUpper.toLowerCase()}`;
    await this.createOrganizationDatabase(databaseName);

    // Create admin
    const admin = this.adminRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      subscriptionPlan,
    });

    const savedAdmin = await this.adminRepository.save(admin);

    // Create organization
    const organization = this.organizationRepository.create({
      name: orgNameUpper,
      databaseName,
      admin: savedAdmin,
    });

    await this.organizationRepository.save(organization);

    return {
      message: 'Admin created successfully',
      admin: {
        id: savedAdmin.id,
        name: savedAdmin.name,
        email: savedAdmin.email,
        organization: {
          name: organization.name,
          databaseName: organization.databaseName,
        },
        subscriptionPlan: subscriptionPlan.name,
      },
    };
  }

  async adminLogin(email: string, password: string, organizationName?: string) {
    // Find admin by email
    const admin = await this.adminRepository.findOne({
      where: { email },
      relations: ['subscriptionPlan', 'organization'],
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Get organization
    const organization = admin.organization;
    if (!organization) {
      throw new UnauthorizedException('Admin is not assigned to any organization');
    }

    // Generate JWT token
    const payload = {
      sub: admin.id,
      email: admin.email,
      role: 'admin',
      organizationId: organization.id,
      organizationName: organization.name,
    };

    return {
      access_token: this.jwtService.sign(payload),
      role: 'admin',
      email: admin.email,
      organizationName: organization.name || '',
      subscriptionPlan: admin.subscriptionPlan?.name || '',
      name: admin.name,
      userId: admin.id,
    };
  }

  private async createOrganizationDatabase(databaseName: string) {
    const connection = this.dataSource;

    try {
      await connection.query(`CREATE DATABASE "${databaseName}";`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        // Database already exists, skip
        return;
      }
      throw new BadRequestException(`Failed to create organization database`);
    }
  }

  async getAllAdmins() {
    const admins = await this.adminRepository.find({
      relations: ['subscriptionPlan', 'organization'],
    });

    return admins.map((admin) => ({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      subscriptionPlan: admin.subscriptionPlan?.name || 'Unknown',
      organization: admin.organization?.name || 'Not assigned',
      createdAt: admin.createdAt,
    }));
  }

  async getAllOrganizations() {
    const organizations = await this.organizationRepository.find({
      relations: ['admin'],
    });

    return organizations.map((org) => ({
      id: org.id,
      name: org.name,
      adminName: org.admin?.name || 'N/A',
      adminEmail: org.admin?.email || 'N/A',
      databaseName: org.databaseName,
      createdAt: org.createdAt,
    }));
  }

  async createUser(data: {
    name: string;
    email: string;
    password: string;
    role: string;
    organizationName: string;
  }) {
    const userExists = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (userExists) {
      throw new BadRequestException('User with this email already exists');
    }

    const organization = await this.organizationRepository.findOne({
      where: { name: data.organizationName.toUpperCase() },
    });

    if (!organization) {
      throw new BadRequestException('Organization not found');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = this.userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      organization: organization,
      organizationId: organization.id,
      isActive: true,
    });

    await this.userRepository.save(user);

    return {
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getUsersByOrganization(organizationName: string) {
    const organization = await this.organizationRepository.findOne({
      where: { name: organizationName.toUpperCase() },
    });

    if (!organization) {
      throw new BadRequestException('Organization not found');
    }

    const users = await this.userRepository.find({
      where: { organizationId: organization.id },
      order: { createdAt: 'DESC' },
    });

    return {
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.isActive ? 'Active' : 'Inactive',
        createdAt: user.createdAt.toISOString().split('T')[0],
      })),
    };
  }

  async userLogin(email: string, password: string) {
    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['organization'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organization.id,
      organizationName: user.organization.name,
    };

    return {
      access_token: this.jwtService.sign(payload),
      role: user.role,
      email: user.email,
      organizationName: user.organization.name,
      name: user.name,
      userId: user.id,
    };
  }

  async getUserProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // If profile doesn't exist, create an empty one
    let profile = user.profile;
    if (!profile) {
      profile = this.userProfileRepository.create({
        userId: userId,
      });
      await this.userProfileRepository.save(profile);
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      profile: profile,
    };
  }

  async updateUserProfile(userId: string, profileData: any) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    let profile = user.profile;
    if (!profile) {
      profile = this.userProfileRepository.create({
        userId: userId,
      });
    }

    // Update profile with new data
    Object.assign(profile, profileData);
    await this.userProfileRepository.save(profile);

    return {
      message: 'User profile updated successfully',
      profile: profile,
    };
  }

  async getUserById(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      profile: user.profile || null,
    };
  }
}
