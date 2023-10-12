import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { v4 as uuid } from 'uuid';
import { HydratedDocument, Model } from 'mongoose';
import { UserViewType } from './models/output/user.output.model';
import { CreateUserModel } from './models/input/user.input.model';

@Schema()
export class EmailConfirmation {
  @Prop({ required: true, default: uuid() })
  confirmationCode: string;

  @Prop({ type: Date, required: true, default: Date.now })
  expirationDate: Date;

  @Prop({ type: Boolean, required: true, default: false })
  isConfirmed: boolean;
}

export const EmailConfirmationSchema =
  SchemaFactory.createForClass(EmailConfirmation);

@Schema()
export class PasswordRecovery {
  @Prop({ required: true, default: uuid() })
  confirmationCode: string;

  @Prop({ type: Date, required: true, default: Date.now })
  expirationDate: Date;
}

export const PasswordRecoverySchema =
  SchemaFactory.createForClass(PasswordRecovery);

@Schema()
export class User {
  _id: ObjectId;

  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true, default: new Date().toISOString() })
  createdAt: string;

  @Prop({ required: true, default: 'someHash' })
  passwordHash: string;

  @Prop({ type: EmailConfirmationSchema, required: false })
  emailConfirmation: EmailConfirmation;

  @Prop({ type: PasswordRecoverySchema, required: false })
  passwordRecovery: PasswordRecovery;

  convertToViewModel(): UserViewType {
    return {
      id: this._id.toString(),
      login: this.login,
      email: this.email,
      createdAt: this.createdAt,
    };
  }

  static createInstance(
    userDTO: CreateUserModel,
    UserModel: UserModelType,
  ): UserDocument {
    return new UserModel(userDTO);
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.statics = {
  createInstance: User.createInstance,
};

UserSchema.methods = {
  convertToViewModel: User.prototype.convertToViewModel,
};

type UserModelStaticMethodsType = {
  createInstance: (
    userDTO: CreateUserModel,
    UserModel: UserModelType,
  ) => UserDocument;
};

export type UserDocument = HydratedDocument<User>;

export type UserModelType = Model<UserDocument> & UserModelStaticMethodsType;
