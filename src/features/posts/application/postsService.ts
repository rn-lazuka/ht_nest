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

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private postModel: PostModelType,
    protected postsRepository: PostsRepository,
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

    //find last 3 Likes
    // const newestLikes =
    //   await this.likesInfoQueryRepository.getNewestLikesOfPost(post._id);
    // const reformedNewestLikes = reformNewestLikes(newestLikes);
    const myStatus = LikeStatus.None;
    return post.modifyIntoViewModel(myStatus, []);
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

  async deletePost(id: string): Promise<boolean> {
    return this.postsRepository.deletePost(id);
  }
}
