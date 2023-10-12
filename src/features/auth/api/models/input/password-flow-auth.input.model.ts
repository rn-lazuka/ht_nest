import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class PasswordRecoveryModel {
  @IsEmail({}, { message: 'Incorrect Email' })
  @Matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, {
    message: 'Incorrect Email',
  })
  email: string;
}

export class NewPasswordModel {
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: "The field shouldn't be empty" })
  @IsString({ message: 'It should be a string' })
  @Length(6, 20)
  newPassword: string;

  @IsString({ message: 'It should be a string' })
  recoveryCode: string;
}
