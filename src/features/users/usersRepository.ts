import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from './userSchema';
import { EmailConfirmationInfo } from './types';
import { ObjectId } from 'mongodb';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: UserModelType) {}

  async save(user: UserDocument): Promise<void> {
    await user.save();
    return;
  }

  async updateUserConfirmationData(id: string, data: EmailConfirmationInfo) {
    const result = await this.userModel.findByIdAndUpdate(
      id,
      { emailConfirmation: data },
      { new: true },
    );
    return result;
  }
  async updateUserConfirmationStatus(id: string) {
    const result = await this.userModel.findByIdAndUpdate(
      id,
      { 'emailConfirmation.isConfirmed': true },
      { new: true },
    );
    return result;
  }

  async updatePassword(passwordHash: string, id: ObjectId): Promise<boolean> {
    const result = await this.userModel.updateOne(
      { _id: id },
      { $set: { passwordHash } },
    );
    return result.modifiedCount === 1;
  }

  async updatePasswordRecoveryCode(
    id: ObjectId,
    newCode: string,
    newDate: Date,
  ): Promise<boolean> {
    const result = await this.userModel.updateOne(
      { _id: id },
      {
        $set: {
          'passwordRecovery.confirmationCode': newCode,
          'passwordRecovery.expirationDate': newDate,
        },
      },
    );

    return result.modifiedCount === 1;
  }

  async deleteUser(id: string) {
    const result = await this.userModel.findByIdAndDelete(id);
    return !!result;
  }
}
