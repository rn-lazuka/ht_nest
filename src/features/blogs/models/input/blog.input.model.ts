export type BlogQueryModel = {
  searchNameTerm?: string;
  sortBy?: string;
  sortDirection?: string;
  pageNumber?: number;
  pageSize?: number;
};

export interface CreateBlogModel {
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
}

export type BlogUpdateType = {
  name: string;
  description: string;
  websiteUrl: string;
};
