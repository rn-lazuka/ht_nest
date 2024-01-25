import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CommentModelType, Comment } from './commentSchema';
import { LikeStatus } from '../../infrastructure/helpers/enums/like-status';
import { CommentQueryModel } from './models/input/comment.input.model';
import { getQueryParams } from '../../infrastructure/utils/getQueryParams';
import {
  CommentsPaginationType,
  CommentViewType,
} from './models/output/comment.output.model';
import { LikesInfoQueryRepository } from '../likes-info/infrastructure/query.repository/likes-info.query.repository';
import { PostQueryModel } from '../posts/models/input/post.input.model';
import { CommentsLikesInfoDBType } from '../likes-info/domain/types';
import { PostsQueryRepository } from '../posts/postsQueryRepository';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: CommentModelType,
    private likesInfoQueryRepository: LikesInfoQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  async getCommentById(
    commentId: string,
    userId: string | null,
  ): Promise<CommentViewType | null> {
    const result = await this.commentModel.findById(commentId);
    if (!result) {
      return null;
    }
    let myStatus = LikeStatus.None;

    if (userId) {
      const likeInfo =
        await this.likesInfoQueryRepository.getCommentLikesInfoByUserId(
          commentId,
          userId,
        );
      if (likeInfo) {
        myStatus = likeInfo.likeStatus;
      }
    }
    return result.convertToViewModel(myStatus);
  }

  async getCommentsByPostId(
    postId: string,
    query: CommentQueryModel | PostQueryModel,
    userId: string | null,
  ): Promise<CommentsPaginationType | null> {
    const post = await this.postsQueryRepository.getPostById(postId, userId);
    if (!post) {
      return null;
    }
    const paramsOfElems = getQueryParams(query);
    const commentsCount = await this.commentModel.countDocuments({ postId });
    const comments = await this.commentModel
      .find({ postId })
      .skip((paramsOfElems.pageNumber - 1) * paramsOfElems.pageSize)
      .limit(paramsOfElems.pageSize)
      .sort(paramsOfElems.paramSort);

    const commentsWithLikes = await Promise.all(
      comments.map(async (comment) => {
        let likeInfo: CommentsLikesInfoDBType | null = null;
        let myStatus = LikeStatus.None;
        if (userId) {
          likeInfo =
            await this.likesInfoQueryRepository.getCommentLikesInfoByUserId(
              comment._id.toString(),
              userId,
            );
        }
        if (likeInfo) {
          myStatus = likeInfo.likeStatus;
        }
        return comment.convertToViewModel(myStatus);
      }),
    );

    return {
      pagesCount: Math.ceil(commentsCount / paramsOfElems.pageSize),
      page: paramsOfElems.pageNumber,
      pageSize: paramsOfElems.pageSize,
      totalCount: commentsCount,
      items: commentsWithLikes,
    };
  }
}
