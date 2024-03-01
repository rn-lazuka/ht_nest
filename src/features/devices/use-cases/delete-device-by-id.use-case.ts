import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesRepository } from '../infrastructure/repository/devices.repository';
import {
  createResponseObject,
  ResponseObject,
} from '../../../infrastructure/utils/createResponseObject';
import { HTTP_STATUS_CODE } from '../../../infrastructure/helpers/enums/http-status';
import { DevicesQueryRepository } from '../infrastructure/query.repository/devices.query.repository';

export class DeleteDeviceByIdCommand {
  constructor(
    public deviceId: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeleteDeviceByIdCommand)
export class DeleteDeviceByIdUseCase
  implements ICommandHandler<DeleteDeviceByIdCommand>
{
  constructor(
    protected devicesQueryRepository: DevicesQueryRepository,
    protected deviceRepository: DevicesRepository,
  ) {}

  async execute(command: DeleteDeviceByIdCommand): Promise<ResponseObject> {
    const { deviceId, userId } = command;
    const device = await this.devicesQueryRepository.getDeviceById(deviceId);

    if (!device)
      return createResponseObject(
        HTTP_STATUS_CODE.NOT_FOUND_404,
        'The device is not found',
      );
    if (device.userId !== userId)
      return createResponseObject(
        HTTP_STATUS_CODE.FORBIDDEN_403,
        "You can't delete not your own device",
      );

    const result = await this.deviceRepository.deleteDeviceById(deviceId);
    if (!result) {
      throw new Error('The device is not found');
    }

    return createResponseObject(
      HTTP_STATUS_CODE.NO_CONTENT_204,
      'Successfully deleted',
    );
  }
}
