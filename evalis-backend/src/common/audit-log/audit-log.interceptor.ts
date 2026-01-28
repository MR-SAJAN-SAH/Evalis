import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private auditLogService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const method = request.method;
    const path = request.path;
    const user = request.user;
    const organizationId = request.user?.organizationId;

    // Skip logging for certain endpoints
    if (this.shouldSkipLogging(path, method)) {
      return next.handle();
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap((res) => {
        const statusCode = response.statusCode;
        const duration = Date.now() - startTime;

        // Only log state-changing operations and important reads
        if (this.shouldLogRequest(method, path, statusCode)) {
          this.createAuditLog(
            organizationId,
            user?.id,
            method,
            path,
            'success',
            statusCode,
            duration,
            request.body,
          );
        }
      }),
      catchError((error) => {
        const statusCode = error.status || 500;
        const duration = Date.now() - startTime;

        if (this.shouldLogRequest(method, path, statusCode)) {
          this.createAuditLog(
            organizationId,
            user?.id,
            method,
            path,
            'failure',
            statusCode,
            duration,
            request.body,
            error.message,
          );
        }

        throw error;
      }),
    );
  }

  private shouldSkipLogging(path: string, method: string): boolean {
    const skipPaths = ['/health', '/metrics', '/swagger', '/api-docs', '/audit-logs'];
    const skipPatterns = skipPaths.some((p) => path.includes(p));

    // Only log state-changing operations
    const isReadOnly = method === 'GET';
    if (isReadOnly && !path.includes('audit')) {
      return true;
    }

    return skipPatterns;
  }

  private shouldLogRequest(
    method: string,
    path: string,
    statusCode: number,
  ): boolean {
    // Log all state-changing operations (POST, PUT, DELETE, PATCH)
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      return true;
    }

    // Log audit-related reads
    if (path.includes('audit')) {
      return true;
    }

    return false;
  }

  private async createAuditLog(
    organizationId: string,
    userId: string,
    method: string,
    path: string,
    status: 'success' | 'failure',
    statusCode: number,
    duration: number,
    body?: any,
    error?: string,
  ) {
    try {
      const { action, entityType, entityName } = this.parseRequest(method, path, body);

      await this.auditLogService.createLog({
        organizationId,
        userId,
        action,
        entityType,
        entityName,
        status,
        details: `${method} ${path} - Status: ${statusCode} - Duration: ${duration}ms${
          error ? ` - Error: ${error}` : ''
        }`,
        ipAddress: this.getClientIp(),
        userAgent: this.getUserAgent(),
      } as any);
    } catch (err) {
      console.error('Failed to create audit log:', err);
    }
  }

  private parseRequest(
    method: string,
    path: string,
    body?: any,
  ): { action: string; entityType: string; entityName?: string } {
    const actionMap: { [key: string]: string } = {
      POST: 'Created',
      PUT: 'Updated',
      DELETE: 'Deleted',
      PATCH: 'Modified',
      GET: 'Viewed',
    };

    const action = actionMap[method] || method;

    // Extract entity type from path
    const pathParts = path.split('/').filter((p) => p);
    const entityType = this.extractEntityType(pathParts);
    const entityName = body?.name || body?.title || body?.email || `-`;

    return { action: `${action} ${entityType}`, entityType, entityName };
  }

  private extractEntityType(pathParts: string[]): string {
    const typeMap: { [key: string]: string } = {
      exams: 'Exam',
      users: 'User',
      roles: 'Role',
      permissions: 'Permission',
      'chat-groups': 'ChatGroup',
      notifications: 'Notification',
      papers: 'Paper',
      submissions: 'ExamSubmission',
      evaluations: 'Evaluation',
      settings: 'Settings',
    };

    for (const part of pathParts) {
      if (typeMap[part]) {
        return typeMap[part];
      }
    }

    return 'Unknown';
  }

  private getClientIp(): string {
    return '127.0.0.1'; // In production, extract from request headers
  }

  private getUserAgent(): string {
    return 'API'; // In production, extract from request headers
  }
}
