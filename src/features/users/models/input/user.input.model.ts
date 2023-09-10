export type UserQueryInputModel = {
  searchLoginTerm?: string;
  searchEmailTerm?: string;
  sortBy?: string;
  sortDirection?: string;
  pageNumber?: string | number;
  pageSize?: string | number;
  banStatus?: 'all' | 'banned' | 'notBanned';
};

export type CreateUserModel = {
  login: string;
  email: string;
  password: string;
};
