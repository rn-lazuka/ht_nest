import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { UsersQueryRepository } from '../../users/users.query-repository';
import { UsersRepository } from '../../users/usersRepository';

export class ConfirmEmailCommand {
  constructor(public confirmationCode: string) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase
  implements ICommandHandler<ConfirmEmailCommand>
{
  constructor(
    protected usersQueryRepository: UsersQueryRepository,
    protected usersRepository: UsersRepository,
  ) {}

  async execute(command: ConfirmEmailCommand): Promise<void> {
    const { confirmationCode } = command;

    const user =
      await this.usersQueryRepository.getUserByConfirmationCode(
        confirmationCode,
      );
    if (!user) {
      throw new BadRequestException([
        { message: 'Code is incorrect', field: 'code' },
      ]);
    }
    if (user.emailConfirmation.isConfirmed) {
      throw new BadRequestException([
        { message: 'User is already confirmed', field: 'code' },
      ]);
    }

    const result = await this.usersRepository.updateUserConfirmationStatus(
      user._id.toString(),
    );
    if (!result) {
      throw new Error('Email confirmation failed.');
    }

    return;
  }
}
