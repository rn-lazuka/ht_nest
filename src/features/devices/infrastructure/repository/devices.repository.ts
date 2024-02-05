import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  Device,
  DeviceDocument,
  DeviceModelType,
} from '../../domain/device.schema';

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectModel(Device.name)
    private deviceModel: DeviceModelType,
  ) {}

  async save(device: DeviceDocument): Promise<void> {
    await device.save();
    return;
  }

  async getDeviceInstance(deviceId: string): Promise<null | DeviceDocument> {
    const device = await this.deviceModel.findOne({ deviceId });
    return device;
  }

  async deleteDevicesExcludeCurrent(deviceId: string): Promise<boolean> {
    const result = await this.deviceModel.deleteMany({
      deviceId: { $ne: deviceId },
    });
    return result.deletedCount > 0;
  }

  async deleteDeviceById(deviceId: string): Promise<boolean> {
    const result = await this.deviceModel.findByIdAndDelete(deviceId);
    return !!result;
  }
}
