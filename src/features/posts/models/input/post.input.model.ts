import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsString,
  MaxLength,
  Validate,
} from 'class-validator';
import {
  // IsBlogByIdExists,
  IsBlogByIdExistsConstraint,
} from '../../../../infrastructure/decorators/posts/blog-id-exists.decorator';
import { LikeStatus } from '../../../../infrastructure/helpers/enums/like-status';

export class UpdatePostLikeStatusModel {
  @IsEnum(['Like', 'Dislike', 'None'], {
    message: 'The value should be one of these: None, Like, Dislike',
  })
  likeStatus: LikeStatus;
}

export type PostQueryModel = {
  searchNameTerm?: string;
  sortBy?: string;
  sortDirection?: string;
  pageNumber?: string | number;
  pageSize?: string | number;
};

export class PostCreateModel {
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'The field shouldn\t be empty' })
  @IsString({ message: 'It should be a string' })
  @MaxLength(30)
  title: string;

  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'The field shouldn\t be empty' })
  @IsString({ message: 'It should be a string' })
  @MaxLength(100)
  shortDescription: string;

  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'The field shouldn\t be empty' })
  @IsString({ message: 'It should be a string' })
  @MaxLength(1000)
  content: string;

  @IsMongoId()
  @IsString({ message: 'It should be a string' })
  @Validate(IsBlogByIdExistsConstraint)
  blogId: string;
}

export class PostCreateFromBlogModel {
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: "The field shouldn't be empty" })
  @IsString({ message: 'It should be a string' })
  @MaxLength(30, { message: 'Max length 30 symbols' })
  title: string;
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: "The field shouldn't be empty" })
  @IsString({ message: 'It should be a string' })
  @MaxLength(100, { message: 'Max length 100 symbols' })
  shortDescription: string;
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: "The field shouldn't be empty" })
  @IsString({ message: 'It should be a string' })
  @MaxLength(1000, { message: 'Max length 1000 symbols' })
  content: string;
}

export interface PostCreateBody {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
}
