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

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: CommentModelType,
  ) {}

  async getCommentById(
    commentId: string,
    // userId?: string
  ): Promise<CommentViewType | null> {
    const result = await this.commentModel.findById(commentId);
    if (!result) {
      return null;
    }
    const myStatus = LikeStatus.None;

    // if (userId) {
    //   const likeInfo = await this.likesRepository.getCommentLikeInfo(
    //     userId,
    //     commentId,
    //   );
    //   if (likeInfo) {
    //     myStatus = likeInfo.likeStatus;
    //   }
    // }
    return result.modifyIntoViewModel(myStatus);
  }

  async getCommentsByPostId(
    postId: string,
    query: CommentQueryModel,
    userId?: string,
  ): Promise<CommentsPaginationType> {
    const paramsOfElems = getQueryParams(query);
    const commentsCount = await this.commentModel.countDocuments({ postId });
    const comments = await this.commentModel
      .find({ postId })
      .skip((paramsOfElems.pageNumber - 1) * paramsOfElems.pageSize)
      .limit(paramsOfElems.pageSize)
      .sort(paramsOfElems.paramSort);

    const commentsWithLikes = await Promise.all(
      comments.map(async (comment) => {
        // let likeInfo: CommentLikeDBType | null = null;
        const myStatus = LikeStatus.None;
        // if (userId) {
        //   likeInfo = await this.likesRepository.getCommentLikeInfo(
        //     userId,
        //     comment._id.toString(),
        //   );
        // }
        // if (likeInfo) {
        //   myStatus = likeInfo.likeStatus;
        // }
        return comment.modifyIntoViewModel(myStatus);
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
