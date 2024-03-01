import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeviceDBType } from '../../domain/devices.db.types';
import { DeviceViewType } from '../../api/models/output/device.output.model';
import { Device, DeviceModelType } from '../../domain/device.schema';

@Injectable()
export class DevicesQueryRepository {
  constructor(
    @InjectModel(Device.name)
    private deviceModel: DeviceModelType,
  ) {}

  async getAllDevicesByUserId(userId: string): Promise<DeviceViewType[]> {
    return this.deviceModel.find({ userId });
  }

  async getDeviceById(deviceId: string): Promise<DeviceDBType | null> {
    return this.deviceModel.findOne({ deviceId });
  }
}
