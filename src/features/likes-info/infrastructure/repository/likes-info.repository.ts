import { Injectable } from '@nestjs/common';
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

@Injectable()
export class LikesInfoRepository {
  constructor(
    @InjectModel(CommentLikesInfo.name)
    private commentsLikesInfoModel: CommentLikesInfoModelType,
    @InjectModel(PostLikesInfo.name)
    private postsLikesInfoModel: PostLikesInfoModelType,
  ) {}

  async getCommentLikeInfoInstance(
    commentId: string,
    userId: string,
  ): Promise<CommentLikesInfoDocument | null> {
    const commentLikeInfo = await this.commentsLikesInfoModel.findOne({
      commentId,
      userId,
    });

    if (!commentLikeInfo) return null;
    return commentLikeInfo;
  }

  async getPostLikeInfoInstance(
    postId: string,
    userId: string,
  ): Promise<PostLikesInfoDocument | null> {
    const postLikeInfo = await this.postsLikesInfoModel.findOne({
      postId,
      userId,
    });

    if (!postLikeInfo) return null;
    return postLikeInfo;
  }

  async save(
    likeInfo: PostLikesInfoDocument | CommentLikesInfoDocument,
  ): Promise<void> {
    await likeInfo.save();
    return;
  }
}
