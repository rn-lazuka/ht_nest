import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { UsersQueryRepository } from '../../../features/users/users.query-repository';

@Injectable()
export class ValidateEmailResendingGuard implements CanActivate {
  constructor(protected usersQueryRepository: UsersQueryRepository) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const user = await this.usersQueryRepository.getUserByLoginOrEmail(
      request.body.email,
    );
    if (!user) {
      throw new BadRequestException([
        {
          message: `This email has not been registered yet`,
          field: 'email',
        },
      ]);
    }
    if (user.emailConfirmation.isConfirmed) {
      throw new BadRequestException([
        {
          message: `Email is already confirmed`,
          field: 'email',
        },
      ]);
    }

    return true;
  }
}
