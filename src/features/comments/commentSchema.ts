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
  createdAt: string;
  @Prop({ required: true, type: CommentatorInfoSchema })
  commentatorInfo: CommentatorInfo;
  @Prop({ required: true })
  postId: string;
  @Prop({ required: true, type: LikesInfoSchema })
  likesInfo: LikesInfo;

  modifyIntoViewModel(myStatus: LikeStatus): CommentViewType {
    return {
      content: this.content,
      commentatorInfo: this.commentatorInfo,
      likesInfo: {
        likesCount: this.likesInfo.likesCount,
        dislikesCount: this.likesInfo.dislikesCount,
        myStatus,
      },
      id: this._id.toString(),
      createdAt: this.createdAt,
    };
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.methods = {
  modifyIntoViewModel: Comment.prototype.modifyIntoViewModel,
};

export type CommentDocument = HydratedDocument<Comment>;

export type CommentModelType = Model<CommentDocument>;
