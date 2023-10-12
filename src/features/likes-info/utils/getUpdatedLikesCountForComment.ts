import { LikeStatus } from '../../../infrastructure/helpers/enums/like-status';
import { CommentViewType } from '../../comments/models/output/comment.output.model';
import { CommentsLikesInfoDBType } from '../domain/types';

interface getUpdatedLikesCountForComment {
  likeStatus: LikeStatus;
  comment: CommentViewType;
  commentLikeInfo: CommentsLikesInfoDBType | null;
}

export const getUpdatedLikesCountForComment = ({
  likeStatus,
  comment,
  commentLikeInfo,
}: getUpdatedLikesCountForComment): {
  likesCount: number;
  dislikesCount: number;
} => {
  if (likeStatus === LikeStatus.Like && commentLikeInfo) {
    return {
      likesCount:
        commentLikeInfo.likeStatus !== LikeStatus.Like
          ? comment.likesInfo.likesCount + 1
          : comment.likesInfo.likesCount,
      dislikesCount:
        commentLikeInfo.likeStatus === LikeStatus.Dislike
          ? comment.likesInfo.dislikesCount - 1
          : comment.likesInfo.dislikesCount,
    };
  }
  if (likeStatus === LikeStatus.Dislike && commentLikeInfo) {
    return {
      likesCount:
        commentLikeInfo.likeStatus === LikeStatus.Like
          ? comment.likesInfo.likesCount - 1
          : comment.likesInfo.likesCount,
      dislikesCount:
        commentLikeInfo.likeStatus === LikeStatus.Dislike
          ? comment.likesInfo.dislikesCount
          : comment.likesInfo.dislikesCount + 1,
    };
  }
  if (likeStatus === LikeStatus.None && commentLikeInfo) {
    return {
      likesCount:
        commentLikeInfo.likeStatus === LikeStatus.Like
          ? comment.likesInfo.likesCount - 1
          : comment.likesInfo.likesCount,
      dislikesCount:
        commentLikeInfo.likeStatus === LikeStatus.Dislike
          ? comment.likesInfo.dislikesCount - 1
          : comment.likesInfo.dislikesCount,
    };
  }
  if (!commentLikeInfo) {
    return {
      likesCount:
        likeStatus === LikeStatus.Like
          ? comment.likesInfo.likesCount + 1
          : comment.likesInfo.likesCount,
      dislikesCount:
        likeStatus === LikeStatus.Dislike
          ? comment.likesInfo.dislikesCount + 1
          : comment.likesInfo.dislikesCount,
    };
  }
  return {
    likesCount: comment.likesInfo.likesCount,
    dislikesCount: comment.likesInfo.dislikesCount,
  };
};
