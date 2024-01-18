import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { UsersService } from '../../features/users/application/usersService';

@Injectable()
export class JwtAccessNotStrictGuard extends AuthGuard('jwt') {
  constructor(protected usersService: UsersService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

    if (!accessToken) return true;

    const userId = await this.usersService.getUserIdByAccessToken(accessToken);
    debugger;
    if (!userId) throw new UnauthorizedException();

    request.userId = userId;
    return true;
  }
}
