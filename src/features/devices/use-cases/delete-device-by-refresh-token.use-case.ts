import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtQueryRepository } from '../../jwt/jwt.query.repository';
import { DevicesRepository } from '../infrastructure/repository/devices.repository';

export class DeleteDeviceByRefreshTokenCommand {
  constructor(public refreshToken: string) {}
}

@CommandHandler(DeleteDeviceByRefreshTokenCommand)
export class DeleteDeviceByRefreshTokenUseCase
  implements ICommandHandler<DeleteDeviceByRefreshTokenCommand>
{
  constructor(
    protected jwtQueryRepository: JwtQueryRepository,
    protected deviceRepository: DevicesRepository,
  ) {}

  async execute(command: DeleteDeviceByRefreshTokenCommand): Promise<boolean> {
    const { refreshToken } = command;
    const payloadToken = this.jwtQueryRepository.getPayloadToken(refreshToken);
    if (!payloadToken) {
      throw new Error('Refresh is invalid');
    }

    return await this.deviceRepository.deleteDeviceById(payloadToken.deviceId);
  }
}
