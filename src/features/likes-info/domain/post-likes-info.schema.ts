import { ObjectId } from 'mongodb';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PostLikesInfoDTOType } from './types';
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
}

export const PostsLikesInfoSchema = SchemaFactory.createForClass(PostLikesInfo);

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
