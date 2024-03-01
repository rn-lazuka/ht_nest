import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatus } from '../../../infrastructure/helpers/enums/like-status';
import { LikesInfoRepository } from '../infrastructure/repository/likes-info.repository';

export class UpdateCommentLikeInfoCommand {
  constructor(
    public userId: string,
    public commentId: string,
    public likeStatus: LikeStatus,
  ) {}
}

@CommandHandler(UpdateCommentLikeInfoCommand)
export class UpdateCommentLikeInfoUseCase
  implements ICommandHandler<UpdateCommentLikeInfoCommand>
{
  constructor(protected likesInfoRepository: LikesInfoRepository) {}

  async execute(command: UpdateCommentLikeInfoCommand): Promise<boolean> {
    const { userId, commentId, likeStatus } = command;
    const commentLikeInfo =
      await this.likesInfoRepository.getCommentLikeInfoInstance(
        commentId,
        userId,
      );

    if (!commentLikeInfo) return false;

    commentLikeInfo.likeStatus = likeStatus;
    await this.likesInfoRepository.save(commentLikeInfo);
    return true;
  }
}
