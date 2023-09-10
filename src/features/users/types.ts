import { ObjectId } from 'mongodb';

export type UserQueryModel = {
  searchLoginTerm?: string;
  searchEmailTerm?: string;
  sortBy?: string;
  sortDirection?: string;
  pageNumber?: number;
  pageSize?: number;
};

export type EmailAndLoginTerm = Array<{
  email?: { $regex: string; $options: string };
  login?: { $regex: string; $options: string };
}>;

export type UserDBType = {
  _id: ObjectId;
  login: string;
  email: string;
  createdAt: string;
  passwordHash: string;
  emailConfirmation: {
    confirmationCode: string;
    expirationDate: Date;
    isConfirmed: boolean;
  };
  passwordRecovery: {
    confirmationCode: string;
    expirationDate: Date;
  };
};
