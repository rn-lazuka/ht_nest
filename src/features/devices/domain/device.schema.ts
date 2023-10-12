import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';

import { HydratedDocument, Model } from 'mongoose';

//node cron

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
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

DeviceSchema.statics = {
  createInstance: Device.createInstance,
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
