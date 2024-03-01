import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { CommentsRepository } from '../comments.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../commentSchema';

export class DeleteCommentCommand {
  constructor(
    public commentId: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(
    @InjectModel(Comment.name)
    private commentModel: CommentModelType,
    protected commentsRepository: CommentsRepository,
  ) {}

  async execute(command: DeleteCommentCommand): Promise<boolean> {
    const { userId, commentId } = command;
    const comment = await this.commentModel.findById(commentId);
    if (!comment) return false;
    if (comment.commentatorInfo.userId !== userId)
      throw new ForbiddenException();
    return this.commentsRepository.deleteComment(commentId);
  }
}
