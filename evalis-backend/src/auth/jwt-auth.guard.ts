import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context) {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      console.log('🔓 [JwtAuthGuard] Route marked as public, skipping JWT validation');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    console.log('🔐 [JwtAuthGuard] Checking JWT for request:', {
      method: request.method,
      url: request.url,
      hasAuthHeader: !!authHeader,
      authHeaderPrefix: authHeader?.substring(0, 15),
    });

    try {
      return super.canActivate(context);
    } catch (err: any) {
      console.error('❌ [JwtAuthGuard] JWT validation failed:', {
        error: err.message,
        name: err.name,
        statusCode: err.statusCode,
      });
      throw err;
    }
  }
}
