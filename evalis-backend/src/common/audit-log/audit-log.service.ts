import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { AuditLog } from './audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async createLog(data: Partial<AuditLog>): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create(data);
    return this.auditLogRepository.save(auditLog);
  }

  async getOrganizationLogs(
    organizationId: string,
    limit: number = 100,
    offset: number = 0,
  ): Promise<{ data: AuditLog[]; total: number }> {
    const [data, total] = await this.auditLogRepository.findAndCount({
      where: { organizationId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
      relations: ['user', 'organization'],
    });

    return { data, total };
  }

  async getLogsByEntityType(
    organizationId: string,
    entityType: string,
    limit: number = 50,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { organizationId, entityType },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['user', 'organization'],
    });
  }

  async getLogsByStatus(
    organizationId: string,
    status: 'success' | 'failure' | 'warning',
    limit: number = 50,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { organizationId, status },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['user', 'organization'],
    });
  }

  async searchLogs(
    organizationId: string,
    searchTerm: string,
    limit: number = 50,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository
      .createQueryBuilder('log')
      .where('log.organizationId = :organizationId', { organizationId })
      .andWhere(
        'log.action ILIKE :search OR log.entityName ILIKE :search OR log.details ILIKE :search',
        { search: `%${searchTerm}%` },
      )
      .orderBy('log.createdAt', 'DESC')
      .take(limit)
      .getMany();
  }

  async deleteOldLogs(organizationId: string, daysOld: number = 90): Promise<void> {
    const date = new Date();
    date.setDate(date.getDate() - daysOld);

    await this.auditLogRepository.delete({
      organizationId,
      createdAt: LessThan(date),
    });
  }
}
