export type PostQueryModel = {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
  userId?: string;
};

export interface PostCreateModel {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}

export interface PostCreateFromBlogModel {
  title: string;
  shortDescription: string;
  content: string;
}

export interface PostCreateBody {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
}
