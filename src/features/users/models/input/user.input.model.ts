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
  passwordHash: string;
  emailConfirmation: {
    confirmationCode?: string;
    expirationDate?: Date;
    isConfirmed: boolean;
  };
  passwordRecovery?: {
    confirmationCode: string;
    expirationDate: Date;
  };
};

export type RegisterUserModel = {
  login: string;
  email: string;
  passwordHash: string;
  emailConfirmation: {
    confirmationCode: string;
    expirationDate: Date;
    isConfirmed: boolean;
  };
  passwordRecovery?: {
    confirmationCode: string;
    expirationDate: Date;
  };
};
