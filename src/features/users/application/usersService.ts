import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../userSchema';
import { UsersRepository } from '../usersRepository';
import { CreateUserModel } from '../models/input/user.input.model';
import { UserViewType } from '../models/output/user.output.model';
import { CryptoAdapter } from '../../../infrastructure/adapters/crypto.adapter';
import { CreateUserInputModel } from '../models/input/create-user.input.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: UserModelType,
    protected usersRepository: UsersRepository,
    protected cryptoAdapter: CryptoAdapter,
  ) {}

  async createUser(inputBodyUser: CreateUserInputModel): Promise<UserViewType> {
    const passwordHash = await this.cryptoAdapter.generateHash(
      inputBodyUser.password,
    );

    const userInfo: CreateUserModel = {
      email: inputBodyUser.email,
      login: inputBodyUser.login,
      passwordHash,
      emailConfirmation: { isConfirmed: true },
    };
    const user = this.userModel.createInstance(userInfo, this.userModel);
    await this.usersRepository.save(user);
    return user.convertToViewModel();
  }

  async deleteUser(id: string) {
    return this.usersRepository.deleteUser(id);
  }
}
