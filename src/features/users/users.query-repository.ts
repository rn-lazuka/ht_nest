import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from './userSchema';
import { EmailAndLoginTerm, UserDBType, UserQueryModel } from './types';
import {
  UsersPaginationType,
  UserViewType,
} from './models/output/user.output.model';
import { getQueryParams } from '../../infrastructure/utils/getQueryParams';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(User.name)
    private userModel: UserModelType,
  ) {}

  async getAllUsers(query: UserQueryModel): Promise<UsersPaginationType> {
    const emailAndLoginTerm: EmailAndLoginTerm = [];
    const paramsOfElems = getQueryParams(query);

    if (!!query?.searchEmailTerm)
      emailAndLoginTerm.push({
        email: { $regex: query.searchEmailTerm, $options: 'i' },
      });
    if (!!query?.searchLoginTerm)
      emailAndLoginTerm.push({
        login: { $regex: query.searchLoginTerm, $options: 'i' },
      });
    const filters =
      emailAndLoginTerm.length > 0 ? { $or: emailAndLoginTerm } : {};
    const allUsersCount = await this.userModel.countDocuments(filters);

    const allUsersOnPages = await this.userModel
      .find(filters)
      .skip((paramsOfElems.pageNumber - 1) * paramsOfElems.pageSize)
      .limit(paramsOfElems.pageSize)
      .sort(paramsOfElems.paramSort);

    return {
      pagesCount: Math.ceil(allUsersCount / paramsOfElems.pageSize),
      page: paramsOfElems.pageNumber,
      pageSize: paramsOfElems.pageSize,
      totalCount: allUsersCount,
      items: allUsersOnPages.map((p) => p.convertToViewModel()),
    };
  }

  async getUserById(id: string): Promise<UserViewType | null> {
    const result = await this.userModel.findById(id);
    return result ? result.convertToViewModel() : result;
  }

  async getUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UserDBType | null> {
    return this.userModel
      .findOne()
      .or([{ login: loginOrEmail }, { email: loginOrEmail }]);
  }

  async getUserByConfirmationCode(code: string): Promise<UserDBType | null> {
    return this.userModel.findOne({
      'emailConfirmation.confirmationCode': code,
    });
  }

  async getUserByPasswordRecoveryCode(
    code: string,
  ): Promise<UserDBType | null> {
    return this.userModel.findOne({
      'recoveryData.recoveryCode': code,
    });
  }
}
