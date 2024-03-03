import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { HydratedDocument, Model } from 'mongoose';
import { DeviceViewType } from '../api/models/output/device.output.model';

@Schema()
export class Device {
  _id: ObjectId;

  @Prop({ required: true })
  ip: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  lastActiveDate: string;

  @Prop({ required: true })
  deviceId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  expirationDate: number;

  static createInstance(
    ip: string,
    title: string,
    payloadToken: any, // TODO: как типизировать?
    userId: string,
    DeviceModel: DeviceModelType,
  ): DeviceDocument {
    return new DeviceModel({
      ip,
      title,
      lastActiveDate: new Date(payloadToken.iat * 1000).toISOString(),
      deviceId: payloadToken.deviceId,
      userId: userId,
      expirationDate: payloadToken.exp - payloadToken.iat,
    });
  }

  convertToViewModel(): DeviceViewType {
    return {
      deviceId: this.deviceId,
      title: this.title,
      ip: this.ip,
      lastActiveDate: this.lastActiveDate,
    };
  }
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

DeviceSchema.statics = {
  createInstance: Device.createInstance,
};
DeviceSchema.methods = {
  convertToViewModel: Device.prototype.convertToViewModel,
};

export type DeviceModelStaticMethodsType = {
  createInstance: (
    ip: string,
    title: string,
    payloadToken: any,
    userId: string,
    DeviceModel: DeviceModelType,
  ) => DeviceDocument;
};

export type DeviceDocument = HydratedDocument<Device>;

export type DeviceModelType = Model<DeviceDocument> &
  DeviceModelStaticMethodsType;
