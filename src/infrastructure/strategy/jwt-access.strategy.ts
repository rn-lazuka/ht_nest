import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersQueryRepository } from '../../features/users/infrastructure/query.repository/users.query.repository';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(protected usersQueryRepository: UsersQueryRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const user = this.usersQueryRepository.getUserByUserId(payload.userId);
    if (!user) throw new UnauthorizedException();

    return { id: payload.userId };
  }
}
