import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../../posts/postSchema';
import { CommentModelType, Comment } from '../commentSchema';
import { UsersQueryRepository } from '../../users/users.query-repository';
import { CommentsQueryRepository } from '../comments.query-repository';
import { CommentsRepository } from '../comments.repository';
import { LikeStatus } from '../../../infrastructure/helpers/enums/like-status';
import { CommentViewType } from '../models/output/comment.output.model';
import { LikesInfoRepository } from '../../likes-info/infrastructure/repository/likes-info.repository';
import { LikesInfoQueryRepository } from '../../likes-info/infrastructure/query.repository/likes-info.query.repository';
import { LikesInfoService } from '../../likes-info/application/likes-info.service';
import { getUpdatedLikesCountForComment } from '../../likes-info/utils/getUpdatedLikesCountForComment';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Post.name)
    private postModel: PostModelType,
    @InjectModel(Comment.name)
    private commentModel: CommentModelType,
    protected likesInfoRepository: LikesInfoRepository,
    protected likesInfoQueryRepository: LikesInfoQueryRepository,
    protected likesInfoService: LikesInfoService,
    protected commentsRepository: CommentsRepository,
    protected usersQueryRepository: UsersQueryRepository,
    protected commentsQueryRepository: CommentsQueryRepository,
  ) {}

  async updateComment(
    commentId: string,
    userId: string,
    content: string,
  ): Promise<boolean> {
    const comment = await this.commentsRepository.getCommentInstance(commentId);
    if (!comment) return false;
    if (comment.commentatorInfo.userId !== userId)
      throw new ForbiddenException();

    comment.content = content;
    await this.commentsRepository.save(comment);

    return true;
  }

  async deleteComment(commentId: string, userId: string): Promise<boolean> {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) return false;
    if (comment.commentatorInfo.userId !== userId)
      throw new ForbiddenException();
    return this.commentsRepository.deleteComment(commentId);
  }

  async createCommentByPostId(
    content: string,
    userId: string,
    postId: string,
  ): Promise<null | CommentViewType> {
    const user = await this.usersQueryRepository.getUserById(userId);
    if (!user) {
      return null;
    }

    const post = await this.postModel.findById(postId);
    if (!post) {
      return null;
    }

    const comment = this.commentModel.createInstance(
      content,
      userId.toString(),
      user.login,
      postId,
      this.commentModel,
    );

    await this.commentsRepository.save(comment);
    return comment.convertToViewModel(LikeStatus.None);
  }

  async updateLikeStatusOfComment(
    commentId: string,
    userId: string,
    likeStatus: LikeStatus,
  ): Promise<boolean> {
    const comment = await this.commentsQueryRepository.getCommentById(
      commentId,
      userId,
    );
    if (!comment) {
      return false;
    }

    const commentLikeInfo =
      await this.likesInfoQueryRepository.getCommentLikesInfoByUserId(
        commentId,
        userId,
      );
    if (!commentLikeInfo) {
      await this.likesInfoService.addCommentLikeInfo(
        userId,
        commentId,
        likeStatus,
      );
    }
    if (commentLikeInfo && commentLikeInfo.likeStatus !== likeStatus) {
      await this.likesInfoService.updateCommentLikeInfo(
        userId,
        commentId,
        likeStatus,
      );
    }
    const likesInfo = getUpdatedLikesCountForComment({
      commentLikeInfo,
      likeStatus,
      comment,
    });

    if (commentLikeInfo?.likeStatus !== likeStatus) {
      await this.commentsRepository.updateCommentLikeInfo(commentId, likesInfo);
    }
    if (commentLikeInfo?.likeStatus === likeStatus) {
      return true;
    }
    return true;
  }
}
