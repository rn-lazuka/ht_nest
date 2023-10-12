import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../postSchema';
import { PostsRepository } from '../postsRepository';
import { BlogsRepository } from '../../blogs/blogsRepository';
import {
  PostCreateBody,
  PostCreateModel,
} from '../models/input/post.input.model';
import { PostViewType } from '../models/output/post.output.model';
import { LikeStatus } from '../../../infrastructure/helpers/enums/like-status';
import { LikesInfoQueryRepository } from '../../likes-info/infrastructure/query.repository/likes-info.query.repository';
import { updateNewestLikesInfo } from '../../likes-info/utils/updateNewestLikesInfo';
import { PostsQueryRepository } from '../postsQueryRepository';
import { LikesInfoService } from '../../likes-info/application/likes-info.service';
import { UsersQueryRepository } from '../../users/users.query-repository';
import { getUpdatedLikesCountForPost } from '../utils/getUpdatedLikesCountForPost';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private postModel: PostModelType,
    protected postsRepository: PostsRepository,
    protected postsQueryRepository: PostsQueryRepository,
    protected usersQueryRepository: UsersQueryRepository,
    protected likesInfoQueryRepository: LikesInfoQueryRepository,
    protected likesInfoService: LikesInfoService,
    protected blogsRepository: BlogsRepository,
  ) {}

  async createPost(createData: PostCreateModel): Promise<null | PostViewType> {
    const blog = await this.blogsRepository.getBlogInstance(createData.blogId);
    if (!blog) {
      return null;
    }

    const postData: PostCreateBody = {
      ...createData,
      blogName: blog.name,
    };

    const post = this.postModel.createInstance(postData, this.postModel);
    await this.postsRepository.save(post);

    // find last 3 Likes
    const newestLikes =
      await this.likesInfoQueryRepository.getNewestLikesOfPost(
        post._id.toString(),
      );
    const updatedNewestLikes = updateNewestLikesInfo(newestLikes);
    const myStatus = LikeStatus.None;
    return post.convertToViewModel(myStatus, updatedNewestLikes);
  }

  async updatePost(
    postId: string,
    inputBodyPost: PostCreateModel,
  ): Promise<boolean> {
    const blog = await this.blogsRepository.getBlogById(inputBodyPost.blogId);

    if (!blog) {
      throw new BadRequestException([
        {
          message: 'Such blogId is not found',
          field: 'blogId',
        },
      ]);
    }

    const post = await this.postsRepository.getPostDocumentById(postId);
    if (!post) return false;

    post.updatePostInfo(inputBodyPost);
    await this.postsRepository.save(post);

    return true;
  }

  async updateLikeStatus(
    postId: string,
    userId: string,
    likeStatus: LikeStatus,
  ): Promise<boolean> {
    const post = await this.postsQueryRepository.getPostById(postId, userId);
    if (!post) {
      return false;
    }
    const user = await this.usersQueryRepository.getUserById(userId);
    const postLikeInfo =
      await this.likesInfoQueryRepository.getPostLikesInfoByUserId(
        postId,
        userId,
      );
    if (!postLikeInfo) {
      await this.likesInfoService.addPostLikeInfo(
        userId,
        postId,
        user!.login,
        likeStatus,
      );
    }
    if (postLikeInfo && postLikeInfo.likeStatus !== likeStatus) {
      await this.likesInfoService.updatePostLikeInfo(
        userId,
        postId,
        likeStatus,
      );
    }
    const likesInfo = getUpdatedLikesCountForPost({
      postLikeInfo,
      likeStatus,
      post,
    });

    if (postLikeInfo?.likeStatus !== likeStatus) {
      await this.postsRepository.updatePostLikeInfo(postId, likesInfo);
    }
    if (postLikeInfo?.likeStatus === likeStatus) {
      return true;
    }
    return true;
  }

  async deletePost(id: string): Promise<boolean> {
    return this.postsRepository.deletePost(id);
  }
}
