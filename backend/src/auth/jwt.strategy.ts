// src/auth/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy }            from '@nestjs/passport';
import { ExtractJwt, Strategy }        from 'passport-jwt';
import type { Request }                from 'express';
import { UsersService }                from '../users/users.service';

export interface JwtPayload {
  sub: string;
  email?: string;
  role?: string;
  mustChangePassword?: boolean;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  name: string;
  surname: string;
  rzaNumber: string;
  mustChangePassword: boolean;
  isActive: boolean;
}

function cookieExtractor(req: Request): string | null {
  const token = req?.cookies?.['jwt-session'];
  return typeof token === 'string' ? token : null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly usersService: UsersService) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET must be defined in env');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      secretOrKey: secret,
      ignoreExpiration: false,
    });
  }

  /** 
   * Called after Passport verifies signature & expiration. 
   * We re-fetch the user to guarantee we have the latest fields. 
   */
  async validate(payload: JwtPayload): Promise<AuthUser> {
    console.log('🛂 JWT payload:', payload);

    // 1️⃣ Ensure we have a user ID
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload: missing subject (sub)');
    }

    // 2️⃣ Re-fetch user to get up-to-date flags
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // 3️⃣ Return only the fields your app needs downstream
    return {
      id:                user.id,
      email:             user.email,
      role:              user.role,
      name:              user.name,
      surname:           user.surname,
      rzaNumber:         user.rzaNumber,        // match your entity
      mustChangePassword: user.mustChangePassword,
      isActive:          user.isActive,
    };
  }
}
