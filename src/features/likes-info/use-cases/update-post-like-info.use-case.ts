import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatus } from '../../../infrastructure/helpers/enums/like-status';
import { LikesInfoRepository } from '../infrastructure/repository/likes-info.repository';

export class UpdatePostLikeInfoCommand {
  constructor(
    public userId: string,
    public postId: string,
    public likeStatus: LikeStatus,
  ) {}
}

@CommandHandler(UpdatePostLikeInfoCommand)
export class UpdatePostLikeInfoUseCase
  implements ICommandHandler<UpdatePostLikeInfoCommand>
{
  constructor(protected likesInfoRepository: LikesInfoRepository) {}

  async execute(command: UpdatePostLikeInfoCommand): Promise<boolean> {
    const { userId, postId, likeStatus } = command;
    const postLikeInfo = await this.likesInfoRepository.getPostLikeInfoInstance(
      postId,
      userId,
    );

    if (!postLikeInfo) return false;

    postLikeInfo.likeStatus = likeStatus;
    await this.likesInfoRepository.save(postLikeInfo);
    return true;
  }
}
