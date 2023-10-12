import { ObjectId } from 'mongodb';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CommentLikesInfoDTOType } from './types';
import { LikeStatus } from '../../../infrastructure/helpers/enums/like-status';
import { HydratedDocument, Model } from 'mongoose';

@Schema()
export class CommentLikesInfo {
  _id: ObjectId;

  @Prop({ type: ObjectId, required: true })
  commentId: ObjectId;

  @Prop({ type: ObjectId, required: true })
  userId: ObjectId;

  @Prop({
    required: true,
    enum: [LikeStatus.Like, LikeStatus.Dislike, LikeStatus.None],
  })
  likeStatus: LikeStatus;

  static createInstance(
    commentLikesInfoDTO: CommentLikesInfoDTOType,
    CommentsLikesInfoModel: CommentLikesInfoModelType,
  ): CommentLikesInfoDocument {
    return new CommentsLikesInfoModel(commentLikesInfoDTO);
  }
}

export const CommentsLikesInfoSchema =
  SchemaFactory.createForClass(CommentLikesInfo);

CommentsLikesInfoSchema.statics = {
  createInstance: CommentLikesInfo.createInstance,
};

export type CommentLikesInfoStaticMethodsType = {
  createInstance: (
    commentLikesInfoDTO: CommentLikesInfoDTOType,
    CommentsLikesInfoModel: CommentLikesInfoModelType,
  ) => CommentLikesInfoDocument;
};

export type CommentLikesInfoDocument = HydratedDocument<CommentLikesInfo>;

export type CommentLikesInfoModelType = Model<CommentLikesInfoDocument> &
  CommentLikesInfoStaticMethodsType;
