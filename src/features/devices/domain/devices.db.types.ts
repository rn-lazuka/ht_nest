import { ObjectId } from 'mongodb';

export type DeviceDBType = {
  _id: ObjectId;
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
  userId: string;
  expirationDate: number;
};
