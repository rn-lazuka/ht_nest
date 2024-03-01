import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../comments.repository';
import { LikeStatus } from '../../../infrastructure/helpers/enums/like-status';
import { getUpdatedLikesCountForComment } from '../../likes-info/utils/getUpdatedLikesCountForComment';
import { LikesInfoQueryRepository } from '../../likes-info/infrastructure/query.repository/likes-info.query.repository';
import { UsersQueryRepository } from '../../users/users.query-repository';
import { CommentsQueryRepository } from '../comments.query-repository';
import { AddCommentLikeInfoCommand } from '../../likes-info/use-cases/add-comment-like-info.use-case';
import { UpdateCommentLikeInfoCommand } from '../../likes-info/use-cases/update-comment-like-info.use-case';

export class UpdateLikeStatusOfCommentCommand {
  constructor(
    public commentId: string,
    public userId: string,
    public likeStatus: LikeStatus,
  ) {}
}

@CommandHandler(UpdateLikeStatusOfCommentCommand)
export class UpdateLikeStatusOfCommentUseCase
  implements ICommandHandler<UpdateLikeStatusOfCommentCommand>
{
  constructor(
    protected likesInfoQueryRepository: LikesInfoQueryRepository,
    protected commandBus: CommandBus,
    protected commentsRepository: CommentsRepository,
    protected usersQueryRepository: UsersQueryRepository,
    protected commentsQueryRepository: CommentsQueryRepository,
  ) {}

  async execute(command: UpdateLikeStatusOfCommentCommand): Promise<boolean> {
    const { userId, commentId, likeStatus } = command;
    const comment = await this.commentsQueryRepository.getCommentById(
      commentId,
      userId,
    );
    if (!comment) {
      return false;
    }

    const commentLikeInfo =
      await this.likesInfoQueryRepository.getCommentLikesInfoByUserId(
        commentId,
        userId,
      );
    if (!commentLikeInfo) {
      await this.commandBus.execute(
        new AddCommentLikeInfoCommand(userId, commentId, likeStatus),
      );
    }
    if (commentLikeInfo && commentLikeInfo.likeStatus !== likeStatus) {
      await this.commandBus.execute(
        new UpdateCommentLikeInfoCommand(userId, commentId, likeStatus),
      );
    }
    const likesInfo = getUpdatedLikesCountForComment({
      commentLikeInfo,
      likeStatus,
      comment,
    });

    if (commentLikeInfo?.likeStatus !== likeStatus) {
      await this.commentsRepository.updateCommentLikeInfo(commentId, likesInfo);
    }
    if (commentLikeInfo?.likeStatus === likeStatus) {
      return true;
    }
    return true;
  }
}
