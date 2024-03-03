import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import {
  RefreshToken,
  RefreshTokenDocument,
  RefreshTokenModelType,
} from '../../domain/refreshToken.schema';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: RefreshTokenModelType,
  ) {}

  async isRefreshTokenActive(refreshToken: string): Promise<boolean> {
    const result = await this.refreshTokenModel.findOne({ refreshToken });
    return !result;
  }
  async save(deactivatedRefreshToken: RefreshTokenDocument): Promise<void> {
    await deactivatedRefreshToken.save();
    return;
  }
}
