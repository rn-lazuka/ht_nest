import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import add from 'date-fns/add';
import { v4 as uuidv4 } from 'uuid';
import { EmailManager } from '../../../infrastructure/managers/email-manager';
import { UsersRepository } from '../../users/usersRepository';
import { UserDBType } from '../../users/types';
import { UsersQueryRepository } from '../../users/users.query-repository';

export class SendEmailPassRecoveryCommand {
  constructor(public email: string) {}
}

@CommandHandler(SendEmailPassRecoveryCommand)
export class SendEmailPassRecoveryUseCase
  implements ICommandHandler<SendEmailPassRecoveryCommand>
{
  constructor(
    protected emailManager: EmailManager,
    protected usersRepository: UsersRepository,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(command: SendEmailPassRecoveryCommand): Promise<void> {
    const { email } = command;
    const user: UserDBType | null =
      await this.usersQueryRepository.getUserByLoginOrEmail(email);
    if (!user) return;

    const newCode = uuidv4();
    const newDate = add(new Date(), { hours: 1 });

    await this.usersRepository.updatePasswordRecoveryCode(
      user._id,
      newCode,
      newDate,
    );
    await this.emailManager.sendPasswordRecoveryCode(email, newCode);

    return;
  }
}
