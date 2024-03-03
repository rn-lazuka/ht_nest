import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtPayload } from 'jsonwebtoken';
import { JwtQueryRepository } from '../jwt.query.repository';
import { UsersQueryRepository } from '../../users/users.query-repository';
import { AuthRepository } from '../../auth/infrastructure/repository/auth.repository';

export class CheckIsTokenValidCommand {
  constructor(public refreshToken: string) {}
}

@CommandHandler(CheckIsTokenValidCommand)
export class CheckIsTokenValidUseCase
  implements ICommandHandler<CheckIsTokenValidCommand>
{
  constructor(
    protected jwtQueryRepository: JwtQueryRepository,
    protected usersQueryRepository: UsersQueryRepository,
    protected authRepository: AuthRepository,
  ) {}

  async execute(command: CheckIsTokenValidCommand): Promise<JwtPayload | null> {
    const { refreshToken } = command;
    const jwtPayload = this.jwtQueryRepository.getPayloadToken(refreshToken);
    const user = await this.usersQueryRepository.getUserById(
      jwtPayload?.userId,
    );
    const isTokenActive =
      await this.authRepository.isRefreshTokenActive(refreshToken);
    if (!user || !isTokenActive) return null;
    return jwtPayload;
  }
}
