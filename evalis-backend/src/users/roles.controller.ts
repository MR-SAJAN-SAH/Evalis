import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesService } from './roles.service';

@Controller('api/roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
  constructor(private rolesService: RolesService) {}

  /**
   * Get all roles for the organization
   */
  @Get()
  async getAllRoles(@Request() req: any) {
    const organizationId = req.user.organizationId;
    return this.rolesService.getAllRoles(organizationId);
  }

  /**
   * Get all available permissions grouped by module
   */
  @Get('permissions')
  async getPermissions() {
    return this.rolesService.getPermissionsByModule();
  }

  /**
   * Get specific role with its permissions
   */
  @Get(':id')
  async getRole(@Param('id') roleId: string) {
    const role = await this.rolesService.getRolePermissions(roleId);
    return role;
  }

  /**
   * Create custom role
   */
  @Post()
  async createRole(
    @Request() req: any,
    @Body()
    body: {
      name: string;
      description: string;
      permissionIds: string[];
    },
  ) {
    const organizationId = req.user.organizationId;
    return this.rolesService.createCustomRole(organizationId, body);
  }

  /**
   * Update custom role
   */
  @Put(':id')
  async updateRole(
    @Param('id') roleId: string,
    @Body()
    body: {
      name?: string;
      description?: string;
      permissionIds?: string[];
    },
  ) {
    return this.rolesService.updateRole(roleId, body);
  }

  /**
   * Delete custom role
   */
  @Delete(':id')
  async deleteRole(@Param('id') roleId: string, @Request() req: any) {
    const organizationId = req.user.organizationId;
    await this.rolesService.deleteRole(roleId, organizationId);
    return { success: true };
  }

  /**
   * Get users assigned to a role
   */
  @Get(':id/users')
  async getUsersByRole(@Param('id') roleId: string) {
    return this.rolesService.getUsersByRole(roleId);
  }

  /**
   * Assign role to user
   */
  @Post('assign/:userId/:roleId')
  async assignRoleToUser(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.rolesService.assignRoleToUser(userId, roleId);
  }
}
