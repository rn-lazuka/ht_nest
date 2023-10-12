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
import { LikesInfoQueryRepository } from '../likes-info/infrastructure/query.repository/likes-info.query.repository';
import { PostsLikesInfoDBType } from '../likes-info/domain/types';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private postModel: PostModelType,
    protected blogsRepository: BlogsRepository,
    protected likesInfoQueryRepository: LikesInfoQueryRepository,
  ) {}

  async getAllPosts(
    query: PostQueryModel,
    userId: string | null,
  ): Promise<PostsPaginationType> {
    const paramsOfElems = getQueryParams(query);
    const allPosts: PostDocument[] = await this.postModel
      .find()
      .skip((paramsOfElems.pageNumber - 1) * paramsOfElems.pageSize)
      .limit(paramsOfElems.pageSize)
      .sort(paramsOfElems.paramSort);
    const totalCount = await this.postModel.countDocuments();

    const postsWithLikes = await Promise.all(
      allPosts.map(async (post) => {
        let likeInfo: PostsLikesInfoDBType | null = null;
        let myStatus = LikeStatus.None;
        if (userId) {
          likeInfo =
            await this.likesInfoQueryRepository.getPostLikesInfoByUserId(
              post._id.toString(),
              userId,
            );
        }
        if (likeInfo) {
          myStatus = likeInfo.likeStatus;
        }
        const newestLikeInfo =
          await this.likesInfoQueryRepository.getNewestLikesOfPost(
            post._id.toString(),
          );
        return post.convertToViewModel(myStatus, newestLikeInfo);
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

  async getPostById(
    id: string,
    userId: string | null,
  ): Promise<PostViewType | null> {
    const post = await this.postModel.findById(id);
    if (!post) return null;
    let likeInfo: PostsLikesInfoDBType | null = null;
    let myStatus = LikeStatus.None;
    if (userId) {
      likeInfo = await this.likesInfoQueryRepository.getPostLikesInfoByUserId(
        id,
        userId,
      );
    }
    if (likeInfo) {
      myStatus = likeInfo.likeStatus;
    }
    const newestLikeInfo =
      await this.likesInfoQueryRepository.getNewestLikesOfPost(id);
    return post.convertToViewModel(myStatus, newestLikeInfo);
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
      .find({ blogId })
      .skip((paramsOfElems.pageNumber - 1) * paramsOfElems.pageSize)
      .limit(paramsOfElems.pageSize)
      .sort(paramsOfElems.paramSort);
    const totalCount = await this.postModel.countDocuments({ blogId });

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
        return post.convertToViewModel(myStatus, []);
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
}
