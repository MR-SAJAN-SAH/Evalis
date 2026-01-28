import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { User } from './entities/user.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Get all roles for an organization with user counts
   */
  async getAllRoles(organizationId: string): Promise<any[]> {
    const roles = await this.roleRepository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.permissions', 'permissions')
      .where('role.organizationId = :organizationId OR role.isSystem = :isSystem', {
        organizationId,
        isSystem: true,
      })
      .orderBy('role.isSystem', 'DESC')
      .addOrderBy('role.name', 'ASC')
      .getMany();

    // Count users per role
    const rolesWithCounts = await Promise.all(
      roles.map(async (role) => {
        const userCount = await this.userRepository.count({
          where: { roleId: role.id },
        });
        return {
          ...role,
          userCount,
        };
      }),
    );

    return rolesWithCounts;
  }

  /**
   * Get all permissions grouped by module
   */
  async getPermissionsByModule(): Promise<any> {
    const permissions = await this.permissionRepository.find();

    const groupedByModule = permissions.reduce((acc, perm) => {
      if (!acc[perm.module]) {
        acc[perm.module] = [];
      }
      acc[perm.module].push(perm);
      return acc;
    }, {} as Record<string, Permission[]>);

    return groupedByModule;
  }

  /**
   * Create system roles (called on organization creation)
   */
  async createSystemRoles(organizationId: string): Promise<void> {
    const systemRoleNames = [
      { name: 'SUPERADMIN', description: 'Super administrator with full access' },
      { name: 'ADMIN', description: 'Organization administrator' },
      { name: 'TEACHER', description: 'Teacher/Instructor' },
      { name: 'EVALUATOR', description: 'Evaluator/Reviewer' },
      { name: 'PROCTOR', description: 'Exam proctor/invigilator' },
      { name: 'CANDIDATE', description: 'Student/Candidate' },
    ];

    for (const roleData of systemRoleNames) {
      const exists = await this.roleRepository.findOne({
        where: { name: roleData.name, isSystem: true },
      });

      if (!exists) {
        const role = new Role();
        role.name = roleData.name;
        role.description = roleData.description;
        role.isSystem = true;
        await this.roleRepository.save(role);
      }
    }
  }

  /**
   * Create custom role
   */
  async createCustomRole(
    organizationId: string,
    data: { name: string; description: string; permissionIds: string[] },
  ): Promise<Role> {
    if (!data.name || data.name.trim() === '') {
      throw new BadRequestException('Role name is required');
    }

    const exists = await this.roleRepository.findOne({
      where: { name: data.name, organizationId },
    });

    if (exists) {
      throw new BadRequestException('Role with this name already exists');
    }

    const permissions = await this.permissionRepository.findByIds(
      data.permissionIds || [],
    );

    const role = this.roleRepository.create({
      name: data.name,
      description: data.description,
      isSystem: false,
      organizationId,
      permissions,
    });

    return this.roleRepository.save(role);
  }

  /**
   * Update custom role
   */
  async updateRole(
    roleId: string,
    data: { name?: string; description?: string; permissionIds?: string[] },
  ): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystem) {
      throw new BadRequestException('Cannot edit system roles');
    }

    if (data.name && data.name.trim() !== '') {
      role.name = data.name;
    }

    if (data.description !== undefined) {
      role.description = data.description;
    }

    if (data.permissionIds) {
      const permissions = await this.permissionRepository.findByIds(
        data.permissionIds,
      );
      role.permissions = permissions;
    }

    return this.roleRepository.save(role);
  }

  /**
   * Delete custom role
   */
  async deleteRole(roleId: string, organizationId: string): Promise<void> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId, organizationId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystem) {
      throw new BadRequestException('Cannot delete system roles');
    }

    // Check if role has users assigned
    const userCount = await this.userRepository.count({
      where: { roleId },
    });

    if (userCount > 0) {
      throw new BadRequestException(
        `Cannot delete role with ${userCount} assigned users`,
      );
    }

    await this.roleRepository.remove(role);
  }

  /**
   * Get users for a specific role
   */
  async getUsersByRole(roleId: string): Promise<User[]> {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('user.roleId = :roleId', { roleId })
      .getMany();
  }

  /**
   * Assign role to user
   */
  async assignRoleToUser(userId: string, roleId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    user.roleId = roleId;
    return this.userRepository.save(user);
  }

  /**
   * Get permissions for a role
   */
  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role.permissions;
  }

  /**
   * Create all default permissions
   */
  async initializePermissions(): Promise<void> {
    const permissions = [
      // Dashboard
      { module: 'Dashboard', action: 'View', name: 'dashboard.view' },

      // Users
      { module: 'Users', action: 'View', name: 'users.view' },
      { module: 'Users', action: 'Create', name: 'users.create' },
      { module: 'Users', action: 'Edit', name: 'users.edit' },
      { module: 'Users', action: 'Delete', name: 'users.delete' },
      { module: 'Users', action: 'Assign Role', name: 'users.assign_role' },
      { module: 'Users', action: 'Export', name: 'users.export' },

      // Exams
      { module: 'Exams', action: 'View', name: 'exams.view' },
      { module: 'Exams', action: 'Create', name: 'exams.create' },
      { module: 'Exams', action: 'Edit', name: 'exams.edit' },
      { module: 'Exams', action: 'Delete', name: 'exams.delete' },
      { module: 'Exams', action: 'Schedule', name: 'exams.schedule' },
      { module: 'Exams', action: 'Manage Questions', name: 'exams.manage_questions' },

      // Evaluation
      { module: 'Evaluation', action: 'View', name: 'evaluation.view' },
      { module: 'Evaluation', action: 'Evaluate', name: 'evaluation.evaluate' },
      { module: 'Evaluation', action: 'Approve', name: 'evaluation.approve' },
      { module: 'Evaluation', action: 'Configure AI', name: 'evaluation.configure_ai' },

      // Analytics
      { module: 'Analytics', action: 'View', name: 'analytics.view' },
      { module: 'Analytics', action: 'Export', name: 'analytics.export' },
      { module: 'Analytics', action: 'Configure', name: 'analytics.configure' },

      // Proctoring
      { module: 'Proctoring', action: 'Monitor', name: 'proctoring.monitor' },
      { module: 'Proctoring', action: 'Flag Session', name: 'proctoring.flag' },
      { module: 'Proctoring', action: 'Configure', name: 'proctoring.configure' },

      // Settings
      { module: 'Settings', action: 'View', name: 'settings.view' },
      { module: 'Settings', action: 'Edit', name: 'settings.edit' },
      { module: 'Settings', action: 'Manage API', name: 'settings.manage_api' },
      { module: 'Settings', action: 'Backup', name: 'settings.backup' },

      // Audit
      { module: 'Audit', action: 'View Logs', name: 'audit.view_logs' },
      { module: 'Audit', action: 'View Activity', name: 'audit.view_activity' },
      { module: 'Audit', action: 'View Security', name: 'audit.view_security' },
    ];

    for (const permData of permissions) {
      const exists = await this.permissionRepository.findOne({
        where: { name: permData.name },
      });

      if (!exists) {
        const permission = this.permissionRepository.create(permData);
        await this.permissionRepository.save(permission);
      }
    }
  }
}
