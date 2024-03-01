import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterUserModel } from '../../users/models/input/user.input.model';
import add from 'date-fns/add';
import { v4 as uuidv4 } from 'uuid';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../../users/userSchema';
import { CryptoAdapter } from '../../../infrastructure/adapters/crypto.adapter';
import { EmailManager } from '../../../infrastructure/managers/email-manager';
import { UsersRepository } from '../../users/usersRepository';

export class RegisterUserCommand {
  constructor(
    public email: string,
    public login: string,
    public password: string,
  ) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase
  implements ICommandHandler<RegisterUserCommand>
{
  constructor(
    @InjectModel(User.name)
    private userModel: UserModelType,
    protected cryptoAdapter: CryptoAdapter,
    protected emailManager: EmailManager,
    protected usersRepository: UsersRepository,
  ) {}

  async execute(command: RegisterUserCommand): Promise<void> {
    const { email, login, password } = command;
    const passwordHash = await this.cryptoAdapter.generateHash(password);
    const userInfo: RegisterUserModel = {
      email,
      login,
      passwordHash,
      emailConfirmation: {
        confirmationCode: uuidv4(),
        expirationDate: add(new Date(), { hours: 5, seconds: 20 }),
        isConfirmed: false,
      },
    };
    const user = this.userModel.createInstance(userInfo, this.userModel);

    await this.usersRepository.save(user);
    await this.emailManager.sendEmailConfirmationCode(
      user.email,
      user.emailConfirmation.confirmationCode,
    );

    return;
  }
}
