import { ObjectId } from 'mongodb';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { NewestLikeType, PostLikesInfoDTOType } from './types';
import { LikeStatus } from '../../../infrastructure/helpers/enums/like-status';
import { HydratedDocument, Model } from 'mongoose';

@Schema()
export class PostLikesInfo {
  _id: ObjectId;

  @Prop({ type: String, required: true })
  postId: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  addedAt: string;

  @Prop({
    required: true,
    enum: [LikeStatus.Like, LikeStatus.Dislike, LikeStatus.None],
  })
  likeStatus: LikeStatus;

  static createInstance(
    postLikesInfoDTO: PostLikesInfoDTOType,
    PostLikesInfoModel: PostLikesInfoModelType,
  ): PostLikesInfoDocument {
    return new PostLikesInfoModel(postLikesInfoDTO);
  }

  convertToViewModel(): NewestLikeType {
    return {
      addedAt: this.addedAt,
      userId: this.userId,
      login: this.login,
    };
  }
}

export const PostsLikesInfoSchema = SchemaFactory.createForClass(PostLikesInfo);

PostsLikesInfoSchema.methods = {
  convertToViewModel: PostLikesInfo.prototype.convertToViewModel,
};
PostsLikesInfoSchema.statics = {
  createInstance: PostLikesInfo.createInstance,
};

export type PostLikesInfoDocument = HydratedDocument<PostLikesInfo>;

export type PostLikesInfoModelType = Model<PostLikesInfoDocument> &
  PostsLikesInfoStaticMethodsType;

export type PostsLikesInfoStaticMethodsType = {
  createInstance: (
    postLikesInfoDTO: PostLikesInfoDTOType,
    PostLikesInfoModel: PostLikesInfoModelType,
  ) => PostLikesInfoDocument;
};
