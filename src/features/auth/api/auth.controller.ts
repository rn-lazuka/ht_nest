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
import { AuthService } from '../application/auth.service';
import { AuthViewModel, TokenViewModel } from './models/output/authViewModel';
import { HTTP_STATUS_CODE } from '../../../infrastructure/helpers/enums/http-status';
import {
  ConfirmationCodeModel,
  EmailResendingInputModel,
  RegistrationInputModel,
} from './models/input/registration.input.model';
import { LocalAuthGuard } from '../../../infrastructure/guards/local-auth.guard';
import { CurrentUserId } from '../../../infrastructure/decorators/auth/current-user-id.param.decorator';
import { ObjectId } from 'mongodb';
import { JwtAccessGuard } from '../../../infrastructure/guards/jwt-access.guard';
import {
  NewPasswordModel,
  PasswordRecoveryModel,
} from './models/input/password-flow-auth.input.model';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtRefreshGuard } from '../../../infrastructure/guards/jwt-refresh.guard';
import { RefreshToken } from '../../../infrastructure/decorators/auth/refresh-token-param.decorator';
import { JwtService } from '../../jwt/jwt.service';
import { DevicesService } from '../../devices/application/devices.service';
import { ValidateEmailResendingGuard } from '../../../infrastructure/guards/validation-guards/validate-email-resending.guard';
import { ValidateEmailRegistrationGuard } from '../../../infrastructure/guards/validation-guards/validate-email-registration.guard';
import { ValidateConfirmationCodeGuard } from '../../../infrastructure/guards/validation-guards/validate-confirmation-code.guard';
import { TitleOfDevice } from '../../../infrastructure/decorators/auth/title-of-device.param.decorator';

@Controller('/auth')
export class AuthController {
  constructor(
    protected jwtService: JwtService,
    protected devicesService: DevicesService,
    protected authService: AuthService,
  ) {}

  @SkipThrottle()
  @UseGuards(JwtAccessGuard)
  @Get('me')
  async getUserInformation(
    @CurrentUserId() userId: string,
    @Res() res: Response<AuthViewModel>,
  ) {
    const result = await this.authService.getUserInformation(userId);

    if (result) {
      res.status(HTTP_STATUS_CODE.OK_200).send(result);
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
    await this.devicesService.deleteDeviceByRefreshToken(refreshToken);
    res.sendStatus(HTTP_STATUS_CODE.NO_CONTENT_204);
  }

  @UseGuards(ValidateEmailResendingGuard)
  @Post('registration-email-resending')
  async resendEmailConfirmation(
    @Body() inputEmail: EmailResendingInputModel,
    @Res() res: Response<string>,
  ) {
    await this.authService.resendConfirmationEmailMessage(inputEmail.email);
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
    await this.authService.registerUser(
      inputRegisterModel.email,
      inputRegisterModel.login,
      inputRegisterModel.password,
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
    await this.authService.confirmEmail(inputConfirmationCode.code);
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
    const tokens = await this.jwtService.changeTokensByRefreshToken(
      userId,
      refreshToken,
    );

    res
      .cookie(`refreshToken`, tokens.refreshToken, {
        httpOnly: true,
        secure: true,
      })
      .status(HTTP_STATUS_CODE.OK_200)
      .send({ accessToken: tokens.accessToken });
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async loginUser(
    @CurrentUserId() userId: string,
    @Res() res: Response<TokenViewModel>,
    @Ip() ip: string,
    @TitleOfDevice() title: string,
  ) {
    const result = await this.authService.loginUser(userId);

    if (result) {
      await this.devicesService.createNewDevice(
        ip || 'unknown',
        title,
        result.userId,
        result.refreshToken,
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

  @Post('new-password')
  async saveNewPassword(
    @Body() inputInfo: NewPasswordModel,
    @Res() res: Response<string>,
  ) {
    await this.authService.saveNewPassword(
      inputInfo.newPassword,
      inputInfo.recoveryCode,
    );

    res.status(HTTP_STATUS_CODE.NO_CONTENT_204).send('New password is saved');
  }

  @Post('password-recovery')
  async passwordRecovery(
    @Body() inputEmail: PasswordRecoveryModel,
    @Res() res: Response<string>,
  ) {
    await this.authService.sendEmailPasswordRecovery(inputEmail.email);
    res
      .status(HTTP_STATUS_CODE.NO_CONTENT_204)
      .send(
        'Email with instruction will be send to passed email address (if a user with such email exists)',
      );
  }
}
