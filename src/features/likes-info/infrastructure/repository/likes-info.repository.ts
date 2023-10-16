import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentLikesInfo,
  CommentLikesInfoDocument,
  CommentLikesInfoModelType,
} from '../../domain/comment-likes-info.schema';
import { PostsLikesInfoDBType } from '../../domain/types';
import { Post, PostModelType } from '../../../posts/postSchema';
import { CommentModelType, Comment } from '../../../comments/commentSchema';
import {
  PostLikesInfo,
  PostLikesInfoDocument,
  PostLikesInfoModelType,
} from '../../domain/post-likes-info.schema';

@Injectable()
export class LikesInfoRepository {
  constructor(
    @InjectModel(Post.name)
    private postModel: PostModelType,
    @InjectModel(Comment.name)
    private commentModel: CommentModelType,
    @InjectModel(CommentLikesInfo.name)
    private commentsLikesInfoModel: CommentLikesInfoModelType,
    @InjectModel(PostLikesInfo.name)
    private postsLikesInfoModel: PostLikesInfoModelType,
  ) {}

  async getCommentLikeInfoInstance(
    commentId: string,
    userId: string,
  ): Promise<CommentLikesInfoDocument | null> {
    const commentLikeInfo = await this.commentsLikesInfoModel.findOne({
      commentId,
      userId,
    });

    if (!commentLikeInfo) return null;
    return commentLikeInfo;
  }

  async getPostLikeInfoInstance(
    postId: string,
    userId: string,
  ): Promise<PostLikesInfoDocument | null> {
    const postLikeInfo = await this.postsLikesInfoModel.findOne({
      postId,
      userId,
    });

    if (!postLikeInfo) return null;
    return postLikeInfo;
  }

  async save(
    likeInfo: PostLikesInfoDocument | CommentLikesInfoDocument,
  ): Promise<void> {
    await likeInfo.save();
    return;
  }

  async createPostsLikesInfo(
    postsLikesInfo: PostsLikesInfoDBType[],
  ): Promise<void> {
    await this.postsLikesInfoModel.insertMany(postsLikesInfo);
    return;
  }

  async createCommentsLikesInfo(commentsLikesInfo): Promise<void> {
    await this.commentsLikesInfoModel.insertMany(commentsLikesInfo);
    return;
  }

  async incrementNumberOfLikesOfComment(
    commentId: string,
    incrementValue: 'Like' | 'Dislike',
  ): Promise<boolean> {
    if (incrementValue === 'Like') {
      const result = await this.commentModel.updateOne(
        { _id: commentId },
        { $inc: { 'likesInfo.likesCount': 1 } },
      );
      return result.modifiedCount === 1;
    } else {
      const result = await this.commentModel.updateOne(
        { _id: commentId },
        { $inc: { 'likesInfo.dislikesCount': 1 } },
      );
      return result.modifiedCount === 1;
    }
  }

  async decrementNumberOfLikesOfComment(
    commentId: string,
    decrementValue: 'Like' | 'Dislike',
  ): Promise<boolean> {
    if (decrementValue === 'Like') {
      const result = await this.commentModel.updateOne(
        { _id: commentId },
        { $inc: { 'likesInfo.likesCount': -1 } },
      );
      return result.modifiedCount === 1;
    } else {
      const result = await this.commentModel.updateOne(
        { _id: commentId },
        { $inc: { 'likesInfo.dislikesCount': -1 } },
      );
      return result.modifiedCount === 1;
    }
  }

  async incrementNumberOfLikesOfPost(
    postId: string,
    incrementValue: 'Like' | 'Dislike' | 'None',
  ): Promise<boolean> {
    if (incrementValue === 'Like') {
      const result = await this.postModel.updateOne(
        { _id: postId },
        { $inc: { 'likesInfo.likesCount': 1 } },
      );
      return result.modifiedCount === 1;
    }
    if (incrementValue === 'Dislike') {
      const result = await this.postModel.updateOne(
        { _id: postId },
        { $inc: { 'likesInfo.dislikesCount': 1 } },
      );
      return result.modifiedCount === 1;
    }
    return true;
  }

  async decrementNumberOfLikesOfPost(
    postId: string,
    decrementValue: 'Like' | 'Dislike' | 'None',
  ): Promise<boolean> {
    if (decrementValue === 'Like') {
      const result = await this.postModel.updateOne(
        { _id: postId },
        { $inc: { 'likesInfo.likesCount': -1 } },
      );
      return result.modifiedCount === 1;
    }
    if (decrementValue === 'Dislike') {
      const result = await this.postModel.updateOne(
        { _id: postId },
        { $inc: { 'likesInfo.dislikesCount': -1 } },
      );
      return result.modifiedCount === 1;
    }
    return true;
  }

  async deleteLikeInfoComment(
    userId: string,
    commentId: string,
  ): Promise<boolean> {
    const result = await this.commentsLikesInfoModel.deleteOne({
      userId,
      commentId,
    });
    return result.deletedCount === 1;
  }

  async deleteLikesInfoPostsByUserId(userId: string): Promise<boolean> {
    const result = await this.postsLikesInfoModel.deleteMany({ userId });
    return result.deletedCount > 0;
  }

  async deleteLikesInfoCommentsByUserId(userId: string): Promise<boolean> {
    const result = await this.commentsLikesInfoModel.deleteMany({ userId });
    return result.deletedCount > 0;
  }
}
