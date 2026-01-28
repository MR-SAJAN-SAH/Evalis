import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AuditLogService } from './audit-log.service';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  async getOrganizationLogs(
    @Request() req: any,
    @Query('limit') limit: string = '100',
    @Query('offset') offset: string = '0',
  ) {
    const organizationId = req.user.organizationId;
    return this.auditLogService.getOrganizationLogs(
      organizationId,
      parseInt(limit),
      parseInt(offset),
    );
  }

  @Get('by-type')
  async getLogsByEntityType(
    @Request() req: any,
    @Query('entityType') entityType: string,
    @Query('limit') limit: string = '50',
  ) {
    const organizationId = req.user.organizationId;
    return this.auditLogService.getLogsByEntityType(
      organizationId,
      entityType,
      parseInt(limit),
    );
  }

  @Get('by-status')
  async getLogsByStatus(
    @Request() req: any,
    @Query('status') status: 'success' | 'failure' | 'warning',
    @Query('limit') limit: string = '50',
  ) {
    const organizationId = req.user.organizationId;
    return this.auditLogService.getLogsByStatus(
      organizationId,
      status,
      parseInt(limit),
    );
  }

  @Get('search')
  async searchLogs(
    @Request() req: any,
    @Query('q') searchTerm: string,
    @Query('limit') limit: string = '50',
  ) {
    const organizationId = req.user.organizationId;
    return this.auditLogService.searchLogs(organizationId, searchTerm, parseInt(limit));
  }
}
