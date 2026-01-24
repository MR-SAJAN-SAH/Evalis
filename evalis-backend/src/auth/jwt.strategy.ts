import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret_key',
    });
  }

  async validate(payload: any) {
    // payload contains the decoded JWT token
    // The token will have: sub (id), email, role, organizationId (optional)
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token: missing user id');
    }

    // Return the user object that will be attached to request.user
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      organizationId: payload.organizationId,
      organizationName: payload.organizationName,
    };
  }
}
