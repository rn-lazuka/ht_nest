import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserDBType } from '../../users/types';
import { UsersQueryRepository } from '../../users/users.query-repository';
import * as bcrypt from 'bcryptjs';

export class ValidateUserCommand {
  constructor(
    public loginOrEmail: string,
    public password: string,
  ) {}
}

@CommandHandler(ValidateUserCommand)
export class ValidateUserUseCase
  implements ICommandHandler<ValidateUserCommand>
{
  constructor(protected usersQueryRepository: UsersQueryRepository) {}

  async execute(command: ValidateUserCommand): Promise<UserDBType | false> {
    const { password, loginOrEmail } = command;
    const user =
      await this.usersQueryRepository.getUserByLoginOrEmail(loginOrEmail);
    if (!user || !user.emailConfirmation.isConfirmed) {
      return false;
    }

    return (await bcrypt.compare(password, user.passwordHash)) ? user : false;
  }
}
