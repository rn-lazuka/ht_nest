import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import add from 'date-fns/add';
import { v4 as uuidv4 } from 'uuid';
import { EmailManager } from '../../../infrastructure/managers/email-manager';
import { UsersRepository } from '../../users/usersRepository';
import { BadRequestException } from '@nestjs/common';
import { EmailConfirmationInfo } from '../../users/types';
import { UsersQueryRepository } from '../../users/users.query-repository';

export class ResendConfirmationEmailMsgCommand {
  constructor(public email: string) {}
}

@CommandHandler(ResendConfirmationEmailMsgCommand)
export class ResendConfirmationEmailMsgUseCase
  implements ICommandHandler<ResendConfirmationEmailMsgCommand>
{
  constructor(
    protected emailManager: EmailManager,
    protected usersRepository: UsersRepository,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(command: ResendConfirmationEmailMsgCommand): Promise<void> {
    const { email } = command;
    const user = await this.usersQueryRepository.getUserByLoginOrEmail(email);
    if (!user) {
      throw new Error('No user with such email');
    }
    if (user.emailConfirmation.isConfirmed) {
      throw new BadRequestException([
        { message: 'User is already confirmed', field: 'email' },
      ]);
    }
    const confirmationInfo: EmailConfirmationInfo = {
      confirmationCode: uuidv4(),
      expirationDate: add(new Date(), { hours: 5, seconds: 20 }),
      isConfirmed: false,
    };

    const result = await this.usersRepository.updateUserConfirmationData(
      user._id.toString(),
      confirmationInfo,
    );
    if (!result) {
      throw new Error('Resending confirmation email message failed.');
    }

    await this.emailManager.sendEmailConfirmationCode(
      email,
      confirmationInfo.confirmationCode,
    );
    return;
  }
}
