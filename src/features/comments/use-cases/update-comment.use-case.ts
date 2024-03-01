import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { CommentsRepository } from '../comments.repository';

export class UpdateCommentCommand {
  constructor(
    public commentId: string,
    public userId: string,
    public content: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(protected commentsRepository: CommentsRepository) {}

  async execute(command: UpdateCommentCommand): Promise<boolean> {
    const { content, userId, commentId } = command;
    const comment = await this.commentsRepository.getCommentInstance(commentId);
    if (!comment) return false;
    if (comment.commentatorInfo.userId !== userId)
      throw new ForbiddenException();

    comment.content = content;
    await this.commentsRepository.save(comment);

    return true;
  }
}
