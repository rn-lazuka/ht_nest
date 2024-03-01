import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserInputModel } from '../models/input/create-user.input.model';
import { UserViewType } from '../models/output/user.output.model';
import { CreateUserModel } from '../models/input/user.input.model';
import { User, UserModelType } from '../userSchema';
import { UsersRepository } from '../usersRepository';
import { CryptoAdapter } from '../../../infrastructure/adapters/crypto.adapter';

export class CreateUserCommand {
  constructor(public inputBodyUser: CreateUserInputModel) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    @InjectModel(User.name)
    private userModel: UserModelType,
    protected usersRepository: UsersRepository,
    protected cryptoAdapter: CryptoAdapter,
  ) {}

  async execute(command: CreateUserCommand): Promise<UserViewType> {
    const { inputBodyUser } = command;
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
}
