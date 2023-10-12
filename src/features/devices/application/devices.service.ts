import { ObjectId } from 'mongodb';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DevicesQueryRepository } from '../infrastructure/query.repository/devices.query.repository';
import { DevicesRepository } from '../infrastructure/repository/devices.repository';
import { InjectModel } from '@nestjs/mongoose';
import { JwtQueryRepository } from '../../jwt/jwt.query.repository';
import {
  createResponseObject,
  ResponseObject,
} from '../../../infrastructure/utils/createResponseObject';
import { Device, DeviceModelType } from '../domain/device.schema';
import { HTTP_STATUS_CODE } from '../../../infrastructure/helpers/enums/http-status';

@Injectable()
export class DevicesService {
  constructor(
    @InjectModel(Device.name)
    private deviceModel: DeviceModelType,
    protected jwtQueryRepository: JwtQueryRepository,
    protected devicesQueryRepository: DevicesQueryRepository,
    protected deviceRepository: DevicesRepository,
  ) {}

  async createNewDevice(
    ip: string,
    title: string,
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const payloadToken = this.jwtQueryRepository.getPayloadToken(refreshToken);
    if (!payloadToken) {
      throw new UnauthorizedException();
    }
    const device = await this.deviceModel.createInstance(
      ip,
      title,
      payloadToken,
      userId,
      this.deviceModel,
    );

    await this.deviceRepository.save(device);
    return;
  }

  async deleteDevicesExcludeCurrent(
    refreshToken: string,
  ): Promise<void | false> {
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

  async deleteDeviceById(
    deviceId: string,
    userId: string,
  ): Promise<ResponseObject> {
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

  async deleteDeviceByRefreshToken(refreshToken: string): Promise<boolean> {
    const payloadToken = this.jwtQueryRepository.getPayloadToken(refreshToken);
    if (!payloadToken) {
      throw new Error('Refresh is invalid');
    }

    return await this.deviceRepository.deleteDeviceById(payloadToken.deviceId);
  }
}
