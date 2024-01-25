import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { HydratedDocument, Model } from 'mongoose';
import { CommentViewType } from './models/output/comment.output.model';
import { LikeStatus } from '../../infrastructure/helpers/enums/like-status';

@Schema()
export class CommentatorInfo {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userLogin: string;
}

export const CommentatorInfoSchema =
  SchemaFactory.createForClass(CommentatorInfo);

@Schema()
export class LikesInfo {
  @Prop({ type: Number, required: true })
  likesCount: number;

  @Prop({ type: Number, required: true })
  dislikesCount: number;
}

export const LikesInfoSchema = SchemaFactory.createForClass(LikesInfo);

@Schema()
export class Comment {
  _id: ObjectId;
  @Prop({ required: true })
  content: string;
  @Prop({ required: true })
  createdAt: Date;
  @Prop({ required: true, type: CommentatorInfoSchema })
  commentatorInfo: CommentatorInfo;
  @Prop({ required: true })
  postId: string;
  @Prop({ required: true, type: LikesInfoSchema })
  likesInfo: LikesInfo;

  static createInstance(
    content: string,
    userId: string,
    userLogin: string,
    postId: string,
    CommentModel: CommentModelType,
  ): CommentDocument {
    return new CommentModel({
      _id: new ObjectId(),
      content,
      createdAt: new Date().toISOString(),
      commentatorInfo: {
        userId,
        userLogin,
      },
      postId,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
      },
    });
  }

  convertToViewModel(myStatus: LikeStatus): CommentViewType {
    return {
      content: this.content,
      commentatorInfo: {
        userId: this.commentatorInfo.userId,
        userLogin: this.commentatorInfo.userLogin,
      },
      likesInfo: {
        likesCount: this.likesInfo.likesCount,
        dislikesCount: this.likesInfo.dislikesCount,
        myStatus,
      },
      id: this._id.toString(),
      createdAt: this.createdAt.toISOString(),
    };
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.methods = {
  convertToViewModel: Comment.prototype.convertToViewModel,
};

CommentSchema.statics = {
  createInstance: Comment.createInstance,
};

type CommentModelStaticMethodsType = {
  createInstance: (
    content: string,
    userId: string,
    userLogin: string,
    postId: string,
    CommentModel: CommentModelType,
  ) => CommentDocument;
};

export type CommentDocument = HydratedDocument<Comment>;

export type CommentModelType = Model<CommentDocument> &
  CommentModelStaticMethodsType;
