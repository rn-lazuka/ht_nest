import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { LikeStatus } from '../../../../infrastructure/helpers/enums/like-status';

export type CommentQueryModel = {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
};

export class UpdateCommentInputModel {
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: "The field shouldn't be empty" })
  @IsString({ message: 'It should be a string' })
  @Length(20, 300, { message: 'Min 20, max 300 characters' })
  content: string;
}

export class CreateCommentByPostIdModel {
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: "The field shouldn't be empty" })
  @IsString({ message: 'It should be a string' })
  @Length(20, 300, { message: 'Min 20, max 300 characters' })
  content: string;
}

export class UpdateCommentLikeStatusInputModel {
  @IsEnum(['Like', 'Dislike', 'None'], {
    message: 'The value should be one of these: None, Like, Dislike',
  })
  likeStatus: LikeStatus;
}
