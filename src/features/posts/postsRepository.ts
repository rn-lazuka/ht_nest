import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from './postSchema';
import { BlogsRepository } from '../blogs/blogs-repository';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private postModel: PostModelType,
    protected blogsRepository: BlogsRepository,
  ) {}

  async getPostDocumentById(postId: string): Promise<null | PostDocument> {
    const post = await this.postModel.findById(postId);
    if (!post) {
      return null;
    }
    return post;
  }

  async updatePostLikeInfo(
    id: string,
    extendedLikesInfo: { likesCount: number; dislikesCount: number },
  ) {
    const result = await this.postModel.findByIdAndUpdate(id, {
      likesInfo: extendedLikesInfo,
    });
    return !!result;
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
