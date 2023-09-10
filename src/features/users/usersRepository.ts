import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from './userSchema';
import { EmailAndLoginTerm, UserQueryModel } from './types';
import { getQueryParams } from '../../infrastructure/utils/getQueryParams';
import { UsersPaginationType } from './models/output/user.output.model';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: UserModelType) {}

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
      items: allUsersOnPages.map((p) => p.modifyIntoViewModel()),
    };
  }

  async save(user: UserDocument): Promise<void> {
    await user.save();
    return;
  }

  async deleteUser(id: string) {
    const result = await this.userModel.findByIdAndDelete(id);
    return !!result;
  }
}
