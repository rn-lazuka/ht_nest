import { Injectable } from '@nestjs/common';
import {
  CommentsLikesInfoDBType,
  NewestLikeType,
  PostsLikesInfoDBType,
} from '../../domain/types';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentLikesInfo,
  CommentLikesInfoModelType,
} from '../../domain/comment-likes-info.schema';
import {
  PostLikesInfo,
  PostLikesInfoModelType,
} from '../../domain/post-likes-info.schema';

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

  async getNewestLikesOfPost(postId: string): Promise<NewestLikeType[]> {
    const likeInfoArray = await this.postsLikesInfoModel
      .find({
        postId,
        likeStatus: 'Like',
      })
      .sort({ addedAt: -1 })
      .limit(3);
    const result = likeInfoArray.map((likeInfo) =>
      likeInfo.convertToViewModel(),
    );
    return result;
  }
}
