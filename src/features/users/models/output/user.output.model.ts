export type UserViewType = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
};

export type ViewAllUsersModels = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<UserViewType>;
};

export type UsersPaginationType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<UserViewType>;
};
