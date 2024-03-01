import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ValidateUserCommand } from '../../features/auth/use-cases/validate-user.use-case';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(protected commandBus: CommandBus) {
    super({
      usernameField: 'loginOrEmail', //переименовываю поле, с которого парсится юзернейм
    });
  }

  async validate(loginOrEmail: string, password: string): Promise<any> {
    const user = await this.commandBus.execute(
      new ValidateUserCommand(loginOrEmail, password),
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    return { id: user._id };
  }
}
