import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService as NestJwtService } from '@nestjs/jwt/dist/jwt.service';
import { AccessRefreshTokens } from '../jwt.types.service';
import { JwtQueryRepository } from '../jwt.query.repository';
import { DevicesRepository } from '../../devices/infrastructure/repository/devices.repository';
import { CheckIsTokenValidCommand } from './check-is-token-valid.use-case';
import { RefreshTokenModelType } from '../../auth/domain/refreshToken.schema';
import { AuthRepository } from '../../auth/infrastructure/repository/auth.repository';

export class ChangeTokenByRefreshTokenCommand {
  constructor(
    public userId: string,
    public cookieRefreshToken: string,
  ) {}
}

@CommandHandler(ChangeTokenByRefreshTokenCommand)
export class ChangeTokenByRefreshTokenUseCase
  implements ICommandHandler<ChangeTokenByRefreshTokenCommand>
{
  constructor(
    protected jwtServiceNest: NestJwtService,
    protected jwtQueryRepository: JwtQueryRepository,
    protected devicesRepository: DevicesRepository,
    protected commandBus: CommandBus,
    private refreshTokenModel: RefreshTokenModelType,
    private authRepository: AuthRepository,
  ) {}

  async execute(
    command: ChangeTokenByRefreshTokenCommand,
  ): Promise<AccessRefreshTokens> {
    const { userId, cookieRefreshToken } = command;
    const isTokenValid = await this.commandBus.execute(
      new CheckIsTokenValidCommand(cookieRefreshToken),
    );

    if (!isTokenValid) {
      throw new Error('Refresh token is invalid.');
    }

    const deactivatedRefreshToken = this.refreshTokenModel.createInstance(
      { refreshToken: cookieRefreshToken },
      this.refreshTokenModel,
    );
    await this.authRepository.save(deactivatedRefreshToken);

    const accessToken = this.jwtServiceNest.sign(
      { userId },
      {
        secret: process.env.PRIVATE_KEY_ACCESS_TOKEN,
        expiresIn: process.env.EXPIRATION_TIME_ACCESS_TOKEN,
      },
    );
    const refreshToken = this.jwtServiceNest.sign(
      { userId, deviceId: isTokenValid.deviceId },
      {
        secret: process.env.PRIVATE_KEY_REFRESH_TOKEN,
        expiresIn: process.env.EXPIRATION_TIME_REFRESH_TOKEN,
      },
    );

    const payloadNewRefresh =
      this.jwtQueryRepository.getPayloadToken(refreshToken);
    if (!payloadNewRefresh?.iat) {
      throw new Error('Refresh token is invalid.');
    }

    const device = await this.devicesRepository.getDeviceInstance(
      isTokenValid.deviceId,
    );
    if (!device) throw new Error('DeviceId in refresh token is invalid.');

    device.lastActiveDate = new Date(
      payloadNewRefresh.iat * 1000,
    ).toISOString();

    await this.devicesRepository.save(device);

    return {
      accessToken,
      refreshToken,
    };
  }
}
