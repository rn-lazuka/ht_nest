import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../users/usersRepository';
import { UsersQueryRepository } from '../../users/users.query-repository';
import { BadRequestException } from '@nestjs/common';
import { ErrorsTypeService } from '../application/dto/auth.dto.service';
import { CryptoAdapter } from '../../../infrastructure/adapters/crypto.adapter';

export class SaveNewPasswordCommand {
  constructor(
    public newPassword: string,
    public recoveryCode: string,
  ) {}
}

@CommandHandler(SaveNewPasswordCommand)
export class SaveNewPasswordUseCase
  implements ICommandHandler<SaveNewPasswordCommand>
{
  constructor(
    protected cryptoAdapter: CryptoAdapter,
    protected usersRepository: UsersRepository,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(
    command: SaveNewPasswordCommand,
  ): Promise<true | ErrorsTypeService> {
    const { newPassword, recoveryCode } = command;
    const user =
      await this.usersQueryRepository.getUserByPasswordRecoveryCode(
        recoveryCode,
      );
    if (!user) {
      throw new BadRequestException([
        {
          message: 'RecoveryCode is incorrect or expired',
          field: 'recoveryCode',
        },
      ]);
    }

    if (user.passwordRecovery.expirationDate < new Date()) {
      throw new BadRequestException([
        {
          message: 'RecoveryCode is incorrect or expired',
          field: 'recoveryCode',
        },
      ]);
    }

    const passwordHash = await this.cryptoAdapter.generateHash(newPassword);
    await this.usersRepository.updatePassword(passwordHash, user._id);

    return true;
  }
}
