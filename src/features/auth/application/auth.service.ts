import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import {
  ARTokensAndUserIdType,
  ErrorsTypeService,
  UserInfoType,
} from './dto/auth.dto.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { User, UserModelType } from '../../users/userSchema';
import { UsersRepository } from '../../users/usersRepository';
import { UsersQueryRepository } from '../../users/users.query-repository';
import { EmailConfirmationInfo, UserDBType } from '../../users/types';
import { RegisterUserModel } from '../../users/models/input/user.input.model';
import { CryptoAdapter } from '../../../infrastructure/adapters/crypto.adapter';
import { EmailManager } from '../../../infrastructure/managers/email-manager';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: UserModelType,
    protected cryptoAdapter: CryptoAdapter,
    protected emailManager: EmailManager,
    protected jwtService: JwtService,
    protected usersRepository: UsersRepository,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}

  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<UserDBType | false> {
    const user =
      await this.usersQueryRepository.getUserByLoginOrEmail(loginOrEmail);
    if (!user || !user.emailConfirmation.isConfirmed) {
      return false;
    }

    return (await bcrypt.compare(password, user.passwordHash)) ? user : false;
  }

  async loginUser(userId: string): Promise<ARTokensAndUserIdType | null> {
    const user = await this.usersQueryRepository.getUserById(userId);
    if (!user) {
      return null;
    }
    const accessToken = this.jwtService.sign(
      { userId },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.EXPIRATION_TIME_ACCESS_TOKEN,
      },
    );
    const refreshToken = this.jwtService.sign(
      { userId, deviceId: uuidv4() },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.EXPIRATION_TIME_REFRESH_TOKEN,
      },
    );

    return {
      accessToken,
      refreshToken,
      userId,
    };
  }

  async registerUser(
    email: string,
    login: string,
    password: string,
  ): Promise<void> {
    const passwordHash = await this.cryptoAdapter.generateHash(password);
    const userInfo: RegisterUserModel = {
      email,
      login,
      passwordHash,
      emailConfirmation: {
        confirmationCode: uuidv4(),
        expirationDate: add(new Date(), { hours: 5, seconds: 20 }),
        isConfirmed: false,
      },
    };
    const user = this.userModel.createInstance(userInfo, this.userModel);

    await this.usersRepository.save(user);
    await this.emailManager.sendEmailConfirmationCode(
      user.email,
      user.emailConfirmation.confirmationCode,
    );

    return;
  }

  async confirmEmail(inputConfirmationCode: string): Promise<void> {
    const user = await this.usersQueryRepository.getUserByConfirmationCode(
      inputConfirmationCode,
    );

    if (!user) {
      throw new BadRequestException([
        { message: 'Code is incorrect', field: 'code' },
      ]);
    }
    if (user.emailConfirmation.isConfirmed) {
      throw new BadRequestException([
        { message: 'Email is already confirmed', field: 'email' },
      ]);
    }

    const result = await this.usersRepository.updateUserConfirmationData(
      user._id.toString(),
      {
        ...user.emailConfirmation,
        isConfirmed: true,
      },
    );
    if (!result) {
      throw new Error('Email confirmation failed.');
    }

    return;
  }

  async resendConfirmationEmailMessage(email: string): Promise<void> {
    const user = await this.usersQueryRepository.getUserByLoginOrEmail(email);
    if (!user) {
      throw new Error('No user with such email');
    }
    if (user.emailConfirmation.isConfirmed) {
      throw new Error('User already confirmed');
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

  async getUserInformation(userId: string): Promise<UserInfoType | null> {
    const user = await this.usersQueryRepository.getUserById(userId);

    if (!user) {
      return null;
    }

    return {
      email: user.email,
      login: user.login,
      userId: user.id,
    };
  }

  async sendEmailPasswordRecovery(email: string): Promise<void> {
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

  async saveNewPassword(
    newPassword: string,
    recoveryCode: string,
  ): Promise<true | ErrorsTypeService> {
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
