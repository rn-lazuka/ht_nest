import { LikeStatus } from '../../../infrastructure/helpers/enums/like-status';
import { PostsLikesInfoDBType } from '../../likes-info/domain/types';
import { PostViewType } from '../models/output/post.output.model';

interface getUpdatedLikesCountForPostProps {
  likeStatus: LikeStatus;
  post: PostViewType;
  postLikeInfo: PostsLikesInfoDBType | null;
}

export const getUpdatedLikesCountForPost = ({
  likeStatus,
  post,
  postLikeInfo,
}: getUpdatedLikesCountForPostProps): {
  likesCount: number;
  dislikesCount: number;
} => {
  if (likeStatus === LikeStatus.Like && postLikeInfo) {
    return {
      likesCount:
        postLikeInfo.likeStatus !== LikeStatus.Like
          ? post.extendedLikesInfo.likesCount + 1
          : post.extendedLikesInfo.likesCount,
      dislikesCount:
        postLikeInfo.likeStatus === LikeStatus.Dislike
          ? post.extendedLikesInfo.dislikesCount - 1
          : post.extendedLikesInfo.dislikesCount,
    };
  }
  if (likeStatus === LikeStatus.Dislike && postLikeInfo) {
    return {
      likesCount:
        postLikeInfo.likeStatus === LikeStatus.Like
          ? post.extendedLikesInfo.likesCount - 1
          : post.extendedLikesInfo.likesCount,
      dislikesCount:
        postLikeInfo.likeStatus === LikeStatus.Dislike
          ? post.extendedLikesInfo.dislikesCount
          : post.extendedLikesInfo.dislikesCount + 1,
    };
  }
  if (likeStatus === LikeStatus.None && postLikeInfo) {
    return {
      likesCount:
        postLikeInfo.likeStatus === LikeStatus.Like
          ? post.extendedLikesInfo.likesCount - 1
          : post.extendedLikesInfo.likesCount,
      dislikesCount:
        postLikeInfo.likeStatus === LikeStatus.Dislike
          ? post.extendedLikesInfo.dislikesCount - 1
          : post.extendedLikesInfo.dislikesCount,
    };
  }
  if (!postLikeInfo) {
    return {
      likesCount:
        likeStatus === LikeStatus.Like
          ? post.extendedLikesInfo.likesCount + 1
          : post.extendedLikesInfo.likesCount,
      dislikesCount:
        likeStatus === LikeStatus.Dislike
          ? post.extendedLikesInfo.dislikesCount + 1
          : post.extendedLikesInfo.dislikesCount,
    };
  }
  return {
    likesCount: post.extendedLikesInfo.likesCount,
    dislikesCount: post.extendedLikesInfo.dislikesCount,
  };
};
