import { Injectable } from '@nestjs/common';
import { JwtQueryRepository } from './jwt.query.repository';
import { AccessRefreshTokens } from './jwt.types.service';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { DevicesRepository } from '../devices/infrastructure/repository/devices.repository';

@Injectable()
export class JwtService {
  constructor(
    protected jwtServiceNest: NestJwtService,
    protected jwtQueryRepository: JwtQueryRepository,
    protected devicesRepository: DevicesRepository,
  ) {}

  async changeTokensByRefreshToken(
    userId: string,
    cookieRefreshToken: string,
  ): Promise<AccessRefreshTokens> {
    const payloadToken =
      this.jwtQueryRepository.getPayloadToken(cookieRefreshToken);
    if (!payloadToken) {
      throw new Error('Refresh token is invalid.');
    }

    const accessToken = this.jwtServiceNest.sign(
      { userId },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.EXPIRATION_TIME_ACCESS_TOKEN,
      },
    );
    const refreshToken = this.jwtServiceNest.sign(
      { userId, deviceId: payloadToken.deviceId },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.EXPIRATION_TIME_REFRESH_TOKEN,
      },
    );

    const payloadNewRefresh =
      this.jwtQueryRepository.getPayloadToken(refreshToken);
    if (!payloadNewRefresh?.iat) {
      throw new Error('Refresh token is invalid.');
    }

    const device = await this.devicesRepository.getDeviceInstance(
      payloadToken.deviceId,
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
