import { LikeStatus } from '../../../../infrastructure/helpers/enums/like-status';

export interface NewLike {
  addedAt: string;
  userId: string;
  login: string;
}

export type PostViewType = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
    newestLikes: NewLike[];
  };
};

export type PostsPaginationType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<PostViewType>;
};
