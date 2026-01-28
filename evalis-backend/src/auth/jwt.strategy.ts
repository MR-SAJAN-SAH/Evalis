import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const secret = process.env.JWT_SECRET || 'your_jwt_secret_key';
    console.log('🔐 [JwtStrategy] Initializing with secret:', {
      secretLength: secret.length,
      secretPrefix: secret.substring(0, 10) + '...',
    });

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    // payload contains the decoded JWT token
    // The token will have: sub (id), email, role, organizationId (optional)
    console.log('🔐 [JwtStrategy] Validating token payload:', {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      organizationId: payload.organizationId,
      iat: payload.iat,
      exp: payload.exp,
      expDateMs: new Date(payload.exp * 1000).toISOString(),
    });
    
    if (!payload.sub) {
      console.error('❌ [JwtStrategy] Invalid token: missing user id');
      throw new UnauthorizedException('Invalid token: missing user id');
    }

    // Return the user object that will be attached to request.user
    const user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      organizationId: payload.organizationId,
      organizationName: payload.organizationName,
    };
    
    console.log('✅ [JwtStrategy] Token validated successfully, returning user:', user);
    return user;
  }
}
