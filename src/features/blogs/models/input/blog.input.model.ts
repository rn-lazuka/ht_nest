import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export type BlogQueryModel = {
  searchNameTerm?: string;
  sortBy?: string;
  sortDirection?: string;
  pageNumber?: number;
  pageSize?: number;
};

export class PasswordRecoveryModel {
  @IsEmail({}, { message: 'Incorrect Email' })
  email: string;
}

export class CreateBlogModel {
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: "The field shouldn't be empty" })
  @IsString({ message: 'It should be a string' })
  @MaxLength(15, { message: 'Max length 15 symbols' })
  name: string;
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: "The field shouldn't be empty" })
  @IsString({ message: 'It should be a string' })
  @MaxLength(500, { message: 'Max length 500 symbols' })
  description: string;
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: "The field shouldn't be empty" })
  @IsString({ message: 'It should be a string' })
  @MaxLength(100, { message: 'Max length 100 symbols' })
  @Matches(
    /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
    {
      message: 'Incorrect website',
    },
  )
  websiteUrl: string;
}

export class UpdateBlogModel {
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: "The field shouldn't be empty" })
  @IsString({ message: 'It should be a string' })
  @MaxLength(15, { message: 'Max length 15 symbols' })
  name: string;
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: "The field shouldn't be empty" })
  @IsString({ message: 'It should be a string' })
  @MaxLength(500, { message: 'Max length 500 symbols' })
  description: string;
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: "The field shouldn't be empty" })
  @IsString({ message: 'It should be a string' })
  @MaxLength(100, { message: 'Max length 100 symbols' })
  @Matches(
    /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
    {
      message: 'Incorrect website',
    },
  )
  websiteUrl: string;
}
