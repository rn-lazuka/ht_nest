import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { CommandBus } from '@nestjs/cqrs';
import { GetUserIdByAccessTokenCommand } from '../../features/jwt/use-cases/getUserIdByAccessToken.use-case';

@Injectable()
export class JwtAccessNotStrictGuard extends AuthGuard('jwt') {
  constructor(protected commandBus: CommandBus) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
    if (!accessToken) return true;

    const userId = await this.commandBus.execute(
      new GetUserIdByAccessTokenCommand(accessToken),
    );
    if (!userId) throw new UnauthorizedException();

    request.userId = userId;
    return true;
  }
}
