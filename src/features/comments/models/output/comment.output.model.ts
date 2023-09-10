import { LikeStatus } from '../../../../infrastructure/helpers/enums/like-status';

export type CommentViewType = {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
  };
};

export type CommentsPaginationType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<CommentViewType>;
};
