import { Injectable } from '@nestjs/common';
import {
  CommentsLikesInfoDBType,
  NewestLikesType,
  PostsLikesInfoDBType,
} from '../../domain/types';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentLikesInfo,
  CommentLikesInfoDocument,
  CommentLikesInfoModelType,
} from '../../domain/comment-likes-info.schema';
import {
  PostLikesInfo,
  PostLikesInfoDocument,
  PostLikesInfoModelType,
} from '../../domain/post-likes-info.schema';
import { ObjectId } from 'mongodb';

@Injectable()
export class LikesInfoQueryRepository {
  constructor(
    @InjectModel(CommentLikesInfo.name)
    private commentsLikesInfoModel: CommentLikesInfoModelType,
    @InjectModel(PostLikesInfo.name)
    private postsLikesInfoModel: PostLikesInfoModelType,
  ) {}

  async getCommentLikesInfoByUserId(
    commentId: string,
    userId: string,
  ): Promise<CommentsLikesInfoDBType | null> {
    return this.commentsLikesInfoModel.findOne({ commentId, userId });
  }

  async getPostLikesInfoByUserId(
    postId: string,
    userId: string,
  ): Promise<PostsLikesInfoDBType | null> {
    return this.postsLikesInfoModel.findOne({ postId, userId });
  }

  async getNewestLikesOfPost(postId: string): Promise<NewestLikesType> {
    return this.postsLikesInfoModel
      .find({ postId, likeStatus: 'Like' })
      .sort({ addedAt: -1 })
      .limit(3)
      .lean();
  }

  async getPostsLikesInfoByUserId(
    userId: string,
  ): Promise<PostLikesInfoDocument[] | null> {
    const postsLikesInfo = await this.postsLikesInfoModel
      .find({ userId })
      .lean();
    return postsLikesInfo.length ? postsLikesInfo : null;
  }

  async getCommentsLikesInfoByUserId(
    userId: string,
  ): Promise<CommentLikesInfoDocument[] | null> {
    const commentLikesInfo = await this.commentsLikesInfoModel
      .find({ userId })
      .lean();
    return commentLikesInfo.length ? commentLikesInfo : null;
  }
}
