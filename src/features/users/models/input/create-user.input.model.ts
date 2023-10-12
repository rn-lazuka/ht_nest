import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserInputModel {
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'The field shouldn\t be empty' })
  @IsString({ message: 'It should be a string' })
  @Length(3, 10)
  @Matches(/^[a-zA-Z0-9_-]*$/, {
    message: 'Incorrect login. Please, use only latin letters and numbers',
  })
  login: string;

  @IsEmail({}, { message: 'Incorrect Email' })
  @Matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, {
    message: 'Incorrect Email',
  })
  email: string;

  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'The field shouldn\t be empty' })
  @IsString({ message: 'It should be a string' })
  @Length(6, 20)
  password: string;
}
