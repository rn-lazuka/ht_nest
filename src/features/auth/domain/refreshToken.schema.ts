import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { HydratedDocument, Model } from 'mongoose';
import { CreateRefreshTokenModel } from '../api/models/input/refreshToken.input.mpdel';

@Schema()
export class RefreshToken {
  _id: ObjectId;

  @Prop({ required: true })
  refreshToken: string;

  static createInstance(
    refreshTokenDTO: CreateRefreshTokenModel,
    RefreshTokenModel: RefreshTokenModelType,
  ): RefreshTokenDocument {
    return new RefreshTokenModel(refreshTokenDTO);
  }
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

RefreshTokenSchema.statics = {
  createInstance: RefreshToken.createInstance,
};

type RefreshTokenModelStaticMethodsType = {
  createInstance: (
    refreshTokenDTO: CreateRefreshTokenModel,
    RefreshTokenModel: RefreshTokenModelType,
  ) => RefreshTokenDocument;
};
export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

export type RefreshTokenModelType = Model<RefreshTokenDocument> &
  RefreshTokenModelStaticMethodsType;
