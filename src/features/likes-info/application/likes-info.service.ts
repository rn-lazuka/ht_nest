import { Injectable } from '@nestjs/common';
import { LikesInfoRepository } from '../infrastructure/repository/likes-info.repository';
import { InjectModel } from '@nestjs/mongoose';
import { LikeStatus } from '../../../infrastructure/helpers/enums/like-status';
import {
  PostLikesInfo,
  PostLikesInfoModelType,
} from '../domain/post-likes-info.schema';
import {
  CommentLikesInfo,
  CommentLikesInfoModelType,
} from '../domain/comment-likes-info.schema';

@Injectable()
export class LikesInfoService {
  constructor(
    @InjectModel(CommentLikesInfo.name)
    private commentsLikesInfoModel: CommentLikesInfoModelType,
    @InjectModel(PostLikesInfo.name)
    private postsLikesInfoModel: PostLikesInfoModelType,
    protected likesInfoRepository: LikesInfoRepository,
  ) {}

  async addCommentLikeInfo(
    userId: string,
    commentId: string,
    likeStatus: LikeStatus,
  ): Promise<void> {
    const commentLikesInfo = this.commentsLikesInfoModel.createInstance(
      {
        commentId,
        userId,
        likeStatus,
      },
      this.commentsLikesInfoModel,
    );

    await this.likesInfoRepository.save(commentLikesInfo);
    return;
  }

  async addPostLikeInfo(
    userId: string,
    postId: string,
    login: string,
    likeStatus: LikeStatus,
  ): Promise<void> {
    const postLikesInfo = this.postsLikesInfoModel.createInstance(
      { postId, userId, login, addedAt: new Date().toISOString(), likeStatus },
      this.postsLikesInfoModel,
    );

    await this.likesInfoRepository.save(postLikesInfo);
    return;
  }

  async updateCommentLikeInfo(
    userId: string,
    commentId: string,
    likeStatus: LikeStatus,
  ): Promise<boolean> {
    const commentLikeInfo =
      await this.likesInfoRepository.getCommentLikeInfoInstance(
        commentId,
        userId,
      );

    if (!commentLikeInfo) return false;

    commentLikeInfo.likeStatus = likeStatus;
    await this.likesInfoRepository.save(commentLikeInfo);
    return true;
  }

  async updatePostLikeInfo(
    userId: string,
    postId: string,
    likeStatus: LikeStatus,
  ): Promise<boolean> {
    const postLikeInfo = await this.likesInfoRepository.getPostLikeInfoInstance(
      postId,
      userId,
    );

    if (!postLikeInfo) return false;

    postLikeInfo.likeStatus = likeStatus;
    await this.likesInfoRepository.save(postLikeInfo);
    return true;
  }

  async deleteLikeInfoComment(
    userId: string,
    commentId: string,
  ): Promise<boolean> {
    return this.likesInfoRepository.deleteLikeInfoComment(userId, commentId);
  }

  async deleteLikeInfoPost(userId: string, postId: string): Promise<boolean> {
    return this.likesInfoRepository.deleteLikeInfoComment(userId, postId);
  }
}
