import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../features/auth/application/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'loginOrEmail', //переименовываю поле, с которого парсится юзернейм
    });
  }

  async validate(loginOrEmail: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(loginOrEmail, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return { id: user._id };
  }
}
