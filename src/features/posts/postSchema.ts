import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LikesInfo, LikesInfoSchema } from '../comments/commentSchema';
import { LikeStatus } from '../../infrastructure/helpers/enums/like-status';
import { NewLike, PostViewType } from './models/output/post.output.model';
import { HydratedDocument, Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import {
  PostCreateBody,
  PostCreateModel,
} from './models/input/post.input.model';

@Schema()
export class Post {
  _id: ObjectId;
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  shortDescription: string;
  @Prop({ required: true })
  content: string;
  @Prop({ required: true })
  blogId: string;
  @Prop({ required: true })
  blogName: string;
  @Prop({ required: true })
  createdAt: string;
  @Prop({ required: true, type: LikesInfoSchema })
  likesInfo: LikesInfo;

  updatePostInfo(data: PostCreateModel) {
    this.title = data.title;
    this.shortDescription = data.shortDescription;
    this.content = data.content;
  }

  modifyIntoViewModel(
    myStatus: LikeStatus,
    newestLikes: NewLike[],
  ): PostViewType {
    return {
      id: this._id.toString(),
      createdAt: this.createdAt,
      title: this.title,
      blogId: this.blogId,
      blogName: this.blogName,
      content: this.content,
      shortDescription: this.shortDescription,
      extendedLikesInfo: {
        likesCount: this.likesInfo.likesCount,
        dislikesCount: this.likesInfo.dislikesCount,
        myStatus,
        newestLikes,
      },
    };
  }

  static createInstance(
    postInfo: PostCreateBody,
    PostModel: PostModelType,
  ): PostDocument {
    return new PostModel({
      _id: new ObjectId(),
      title: postInfo.title,
      shortDescription: postInfo.shortDescription,
      content: postInfo.content,
      blogId: postInfo.blogId,
      blogName: postInfo.blogName,
      createdAt: new Date().toISOString(),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
      },
    });
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.methods = {
  modifyIntoViewModel: Post.prototype.modifyIntoViewModel,
  updatePostInfo: Post.prototype.updatePostInfo,
};
PostSchema.statics = {
  createInstance: Post.createInstance,
};

type PostModelStaticMethodsType = {
  createInstance: (
    postInfo: PostCreateBody,
    postModel: PostModelType,
  ) => PostDocument;
};

export type PostDocument = HydratedDocument<Post>;

export type PostModelType = Model<PostDocument> & PostModelStaticMethodsType;
