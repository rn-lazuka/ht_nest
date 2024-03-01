import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtQueryRepository } from '../../jwt/jwt.query.repository';
import { DevicesRepository } from '../infrastructure/repository/devices.repository';

export class DeleteDevicesExcludeCurrentCommand {
  constructor(public refreshToken: string) {}
}

@CommandHandler(DeleteDevicesExcludeCurrentCommand)
export class DeleteDevicesExcludeCurrentUseCase
  implements ICommandHandler<DeleteDevicesExcludeCurrentCommand>
{
  constructor(
    protected jwtQueryRepository: JwtQueryRepository,
    protected deviceRepository: DevicesRepository,
  ) {}

  async execute(
    command: DeleteDevicesExcludeCurrentCommand,
  ): Promise<void | false> {
    const { refreshToken } = command;
    const payloadToken = this.jwtQueryRepository.getPayloadToken(refreshToken);
    if (!payloadToken) {
      throw new Error('Refresh is invalid');
    }

    const result = await this.deviceRepository.deleteDevicesExcludeCurrent(
      payloadToken.deviceId,
    );
    if (!result) {
      throw new Error('Deletion failed');
    }

    return;
  }
}
