import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from './userSchema';
import { UsersRepository } from './usersRepository';
import { UserViewType } from './models/output/user.output.model';
import { CreateUserModel } from './models/input/user.input.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: UserModelType,
    protected usersRepository: UsersRepository,
  ) {}

  async createUser(inputBodyUser: CreateUserModel): Promise<UserViewType> {
    const user = this.userModel.createInstance(inputBodyUser, this.userModel);
    await this.usersRepository.save(user);
    return user.modifyIntoViewModel();
  }

  async deleteUser(id: string) {
    return this.usersRepository.deleteUser(id);
  }
}
