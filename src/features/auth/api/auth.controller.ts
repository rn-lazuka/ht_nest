import { Response } from 'express';
import {
  Body,
  Controller,
  Get,
  Ip,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthViewModel, TokenViewModel } from './models/output/authViewModel';
import { HTTP_STATUS_CODE } from '../../../infrastructure/helpers/enums/http-status';
import {
  ConfirmationCodeModel,
  EmailResendingInputModel,
  RegistrationInputModel,
} from './models/input/registration.input.model';
import { LocalAuthGuard } from '../../../infrastructure/guards/local-auth.guard';
import { CurrentUserId } from '../../../infrastructure/decorators/auth/current-user-id.param.decorator';
import { JwtAccessGuard } from '../../../infrastructure/guards/jwt-access.guard';
import {
  NewPasswordModel,
  PasswordRecoveryModel,
} from './models/input/password-flow-auth.input.model';
import { SkipThrottle, ThrottlerGuard } from '@nestjs/throttler';
import { JwtRefreshGuard } from '../../../infrastructure/guards/jwt-refresh.guard';
import { RefreshToken } from '../../../infrastructure/decorators/auth/refresh-token-param.decorator';
import { ValidateEmailResendingGuard } from '../../../infrastructure/guards/validation-guards/validate-email-resending.guard';
import { ValidateEmailRegistrationGuard } from '../../../infrastructure/guards/validation-guards/validate-email-registration.guard';
import { ValidateConfirmationCodeGuard } from '../../../infrastructure/guards/validation-guards/validate-confirmation-code.guard';
import { TitleOfDevice } from '../../../infrastructure/decorators/auth/title-of-device.param.decorator';
import { CommandBus } from '@nestjs/cqrs';
import { ConfirmEmailCommand } from '../use-cases/confirm-email.use-case';
import { LoginUserCommand } from '../use-cases/login-user.use-case';
import { UsersQueryRepository } from '../../users/users.query-repository';
import { RegisterUserCommand } from '../use-cases/register-user.use-case';
import { ResendConfirmationEmailMsgCommand } from '../use-cases/resend-confirmation-email-message.use-case';
import { SendEmailPassRecoveryCommand } from '../use-cases/send-email-pass-recovery.use-case';
import { SaveNewPasswordCommand } from '../use-cases/save-new-password.use-case';
import { DeleteDeviceByRefreshTokenCommand } from '../../devices/use-cases/delete-device-by-refresh-token.use-case';
import { CreateNewDeviceCommand } from '../../devices/use-cases/create-new-device.use-case';
import { ChangeTokenByRefreshTokenCommand } from '../../jwt/use-cases/change-token-by-refresh-token.use-case';

@Controller('/auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(
    protected commandBus: CommandBus,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async loginUser(
    @CurrentUserId() userId: string,
    @Res() res: Response<TokenViewModel>,
    @Ip() ip: string,
    @TitleOfDevice() title: string,
  ) {
    const result = await this.commandBus.execute(new LoginUserCommand(userId));

    if (result) {
      await this.commandBus.execute(
        new CreateNewDeviceCommand(
          ip || 'unknown',
          title,
          result.userId,
          result.refreshToken,
        ),
      );

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: true,
      });
      res
        .status(HTTP_STATUS_CODE.OK_200)
        .send({ accessToken: result.accessToken });
    } else {
      res.sendStatus(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    }
  }

  @SkipThrottle()
  @UseGuards(JwtAccessGuard)
  @Get('me')
  async getUserInformation(
    @CurrentUserId() userId: string,
    @Res() res: Response<AuthViewModel>,
  ) {
    const result = await this.usersQueryRepository.getUserById(userId);
    if (result) {
      res
        .status(HTTP_STATUS_CODE.OK_200)
        .send({ userId: result.id, email: result.email, login: result.login });
    } else {
      res.sendStatus(HTTP_STATUS_CODE.NOT_FOUND_404);
    }
  }

  @SkipThrottle()
  @UseGuards(JwtRefreshGuard)
  @Post('logout')
  async logoutUser(
    @RefreshToken() refreshToken: string,
    @Res() res: Response<void>,
  ) {
    const result = await this.commandBus.execute(
      new DeleteDeviceByRefreshTokenCommand(refreshToken),
    );
    result
      ? res.sendStatus(HTTP_STATUS_CODE.NO_CONTENT_204)
      : res.sendStatus(HTTP_STATUS_CODE.UNAUTHORIZED_401);
  }

  @UseGuards(ValidateEmailResendingGuard)
  @Post('registration-email-resending')
  async resendEmailConfirmation(
    @Body() inputEmail: EmailResendingInputModel,
    @Res() res: Response<string>,
  ) {
    await this.commandBus.execute(
      new ResendConfirmationEmailMsgCommand(inputEmail.email),
    );
    res
      .status(HTTP_STATUS_CODE.NO_CONTENT_204)
      .send(
        'Input data is accepted. Email with confirmation code will be send to passed email address.',
      );
  }

  @UseGuards(ValidateEmailRegistrationGuard)
  @Post('registration')
  async registerUser(
    @Body() inputRegisterModel: RegistrationInputModel,
    @Res() res: Response<string>,
  ) {
    await this.commandBus.execute(
      new RegisterUserCommand(
        inputRegisterModel.email,
        inputRegisterModel.login,
        inputRegisterModel.password,
      ),
    );

    res
      .status(HTTP_STATUS_CODE.NO_CONTENT_204)
      .send(
        'Input data is accepted. Email with confirmation code will be send to passed email address',
      );
  }

  @UseGuards(ValidateConfirmationCodeGuard)
  @Post('registration-confirmation')
  async confirmEmail(
    @Body() inputConfirmationCode: ConfirmationCodeModel,
    @Res() res: Response<string>,
  ) {
    await this.commandBus.execute(
      new ConfirmEmailCommand(inputConfirmationCode.code),
    );
    res
      .status(HTTP_STATUS_CODE.NO_CONTENT_204)
      .send('Email was verified. Account was activated');
  }

  @SkipThrottle()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh-token')
  async newRefreshToken(
    @CurrentUserId() userId: string,
    @RefreshToken() refreshToken: string,
    @Res() res: Response<TokenViewModel | string>,
  ) {
    const tokens = await this.commandBus.execute(
      new ChangeTokenByRefreshTokenCommand(userId, refreshToken),
    );

    res
      .cookie(`refreshToken`, tokens.refreshToken, {
        httpOnly: true,
        secure: true,
      })
      .status(HTTP_STATUS_CODE.OK_200)
      .send({ accessToken: tokens.accessToken });
  }

  @SkipThrottle()
  @Post('new-password')
  async saveNewPassword(
    @Body() inputInfo: NewPasswordModel,
    @Res() res: Response<string>,
  ) {
    await this.commandBus.execute(
      new SaveNewPasswordCommand(inputInfo.newPassword, inputInfo.recoveryCode),
    );

    res.status(HTTP_STATUS_CODE.NO_CONTENT_204).send('New password is saved');
  }

  @Post('password-recovery')
  async passwordRecovery(
    @Body() inputEmail: PasswordRecoveryModel,
    @Res() res: Response<string>,
  ) {
    await this.commandBus.execute(
      new SendEmailPassRecoveryCommand(inputEmail.email),
    );
    res
      .status(HTTP_STATUS_CODE.NO_CONTENT_204)
      .send(
        'Email with instruction will be send to passed email address (if a user with such email exists)',
      );
  }
}
