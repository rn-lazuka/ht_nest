import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LikeStatus } from '../../infrastructure/helpers/enums/like-status';
import { Post, PostDocument, PostModelType } from './postSchema';
import { PostQueryModel } from './models/input/post.input.model';
import { getQueryParams } from '../../infrastructure/utils/getQueryParams';
import {
  PostsPaginationType,
  PostViewType,
} from './models/output/post.output.model';
import { BlogsRepository } from '../blogs/blogsRepository';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private postModel: PostModelType,
    protected blogsRepository: BlogsRepository,
  ) {}

  async getAllPosts(query: PostQueryModel): Promise<PostsPaginationType> {
    const paramsOfElems = getQueryParams(query);
    const allPosts: PostDocument[] = await this.postModel
      .find()
      .skip((paramsOfElems.pageNumber - 1) * paramsOfElems.pageSize)
      .limit(paramsOfElems.pageSize)
      .sort(paramsOfElems.paramSort);
    const totalCount = await this.postModel.countDocuments();

    const postsWithLikes = await Promise.all(
      allPosts.map(async (post) => {
        // let likeInfo: PostLikeDBType | null = null;
        const myStatus = LikeStatus.None;
        // if (query.userId) {
        //   likeInfo = await this.likesRepository.getPostLikeInfo(
        //       query.userId,
        //     post._id.toString(),
        //   );
        // }
        // if (likeInfo) {
        //   myStatus = likeInfo.likeStatus;
        // }
        // const newestLikeInfo = await this.likesRepository.getNewestLikesOfPost(
        //   post._id.toString(),
        // );
        return post.modifyIntoViewModel(myStatus, []);
      }),
    );

    return {
      pagesCount: Math.ceil(totalCount / paramsOfElems.pageSize),
      page: paramsOfElems.pageNumber,
      pageSize: paramsOfElems.pageSize,
      totalCount,
      items: postsWithLikes,
    };
  }

  async getPostById(id: string, userId?: string): Promise<PostViewType | null> {
    const post = await this.postModel.findById(id);
    if (!post) return null;
    // let likeInfo: PostLikeDBType | null = null;
    const myStatus = LikeStatus.None;
    // if (userId) {
    //   likeInfo = await this.likesRepository.getPostLikeInfo(userId, id);
    // }
    // if (likeInfo) {
    //   myStatus = likeInfo.likeStatus;
    // }
    // const newestLikeInfo = await this.likesRepository.getNewestLikesOfPost(id);
    return post.modifyIntoViewModel(myStatus, []);
  }

  async getPostDocumentById(postId: string): Promise<null | PostDocument> {
    const post = await this.postModel.findById(postId);
    if (!post) {
      return null;
    }
    return post;
  }

  async getAllPostsForBlog(
    blogId: string,
    query: PostQueryModel,
    userId?: string,
  ) {
    const blog = await this.blogsRepository.getBlogById(blogId);
    if (!blog) {
      return null;
    }

    const paramsOfElems = getQueryParams(query);
    const posts: PostDocument[] = await this.postModel
      .find()
      .skip((paramsOfElems.pageNumber - 1) * paramsOfElems.pageSize)
      .limit(paramsOfElems.pageSize)
      .sort(paramsOfElems.paramSort);
    const totalCount = await this.postModel.countDocuments();

    const postsWithLikes = await Promise.all(
      posts.map(async (post) => {
        // let likeInfo: PostLikeDBType | null = null;
        const myStatus = LikeStatus.None;
        // if (userId) {
        //   likeInfo = await this.likesRepository.getPostLikeInfo(
        //     userId,
        //     post._id.toString(),
        //   );
        // }
        // if (likeInfo) {
        //   myStatus = likeInfo.likeStatus;
        // }
        // const newestLikeInfo = await this.likesRepository.getNewestLikesOfPost(
        //   post._id.toString(),
        // );
        return post.modifyIntoViewModel(myStatus, []);
      }),
    );

    return {
      pagesCount: Math.ceil(totalCount / paramsOfElems.pageSize),
      page: paramsOfElems.pageNumber,
      pageSize: paramsOfElems.pageSize,
      totalCount,
      items: postsWithLikes,
    };
  }

  async deletePost(id: string) {
    const result = await this.postModel.findByIdAndDelete(id);
    return !!result;
  }

  async save(post: PostDocument): Promise<void> {
    await post.save();
    return;
  }
}
