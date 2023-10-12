import { ObjectId } from 'mongodb';
import { LikeStatus } from '../../../infrastructure/helpers/enums/like-status';

export type NewestLikesType = Array<{
  addedAt: string;
  userId: string;
  login: string;
}>;

export class CommentsLikesInfoDBType {
  _id: ObjectId;
  commentId: string;
  userId: string;
  likeStatus: LikeStatus;
}

export class CommentLikesInfoDTOType {
  commentId: string;
  userId: string;
  likeStatus: LikeStatus;
}

export class PostsLikesInfoDBType {
  _id: ObjectId;

  postId: string;

  userId: string;

  login: string;

  addedAt: string;

  likeStatus: LikeStatus;
}

export class PostLikesInfoDTOType {
  postId: string;
  userId: string;
  login: string;
  addedAt: string;
  likeStatus: LikeStatus;
}

export type PostsLikesInfoOfUserType = Array<PostsLikesInfoDBType>;

export type CommentsLikesInfoOfUserType = Array<CommentsLikesInfoDBType>;
