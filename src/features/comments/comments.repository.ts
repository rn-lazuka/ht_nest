import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CommentModelType, Comment, CommentDocument } from './commentSchema';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name)
    private commentModel: CommentModelType,
  ) {}

  async getCommentInstance(commentId: string): Promise<CommentDocument | null> {
    const comment = await this.commentModel.findById(commentId);
    return comment;
  }

  async save(comment: CommentDocument): Promise<void> {
    await comment.save();
    return;
  }

  async updateCommentLikeInfo(
    id: string,
    likesInfo: { likesCount: number; dislikesCount: number },
  ) {
    const result = await this.commentModel.findByIdAndUpdate(id, { likesInfo });
    return !!result;
  }

  async deleteComment(id: string): Promise<boolean> {
    const result = await this.commentModel.findByIdAndDelete(id);
    return !!result;
  }
}
