import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { JwtPayload } from '../type/jwt-payload.type';
import { UserService } from '../../user/user.service';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        RefreshTokenStrategy.fromCookieExtractor,
      ]),
      secretOrKey: process.env.REFRESH_KEY,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  private static fromCookieExtractor(req: Request): string | null {
    console.log(req.cookies);
    if (req.cookies && req.cookies.refreshToken) {
      return req.cookies.refreshToken;
    }
    return null;
  }

  async validate(req: Request, payload: JwtPayload) {
    const user = await this.userService.findOne(payload.sub);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = user;
    return rest;
  }
}
