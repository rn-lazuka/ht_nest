import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../postsRepository';
import { LikesInfoQueryRepository } from '../../likes-info/infrastructure/query.repository/likes-info.query.repository';
import { LikeStatus } from '../../../infrastructure/helpers/enums/like-status';
import { AddPostLikeInfoCommand } from '../../likes-info/use-cases/add-post-like-info.use-case';
import { UpdatePostLikeInfoCommand } from '../../likes-info/use-cases/update-post-like-info.use-case';
import { getUpdatedLikesCountForPost } from '../utils/getUpdatedLikesCountForPost';
import { PostsQueryRepository } from '../postsQueryRepository';
import { UsersQueryRepository } from '../../users/users.query-repository';

export class UpdatePostLikeStatusCommand {
  constructor(
    public postId: string,
    public userId: string,
    public likeStatus: LikeStatus,
  ) {}
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UpdatePostLikeStatusUseCase
  implements ICommandHandler<UpdatePostLikeStatusCommand>
{
  constructor(
    protected commandBus: CommandBus,
    protected usersQueryRepository: UsersQueryRepository,
    protected postsQueryRepository: PostsQueryRepository,
    protected postsRepository: PostsRepository,
    protected likesInfoQueryRepository: LikesInfoQueryRepository,
  ) {}

  async execute(command: UpdatePostLikeStatusCommand): Promise<boolean> {
    const { userId, postId, likeStatus } = command;
    const post = await this.postsQueryRepository.getPostById(postId, userId);
    if (!post) {
      return false;
    }
    const user = await this.usersQueryRepository.getUserById(userId);
    const postLikeInfo =
      await this.likesInfoQueryRepository.getPostLikesInfoByUserId(
        postId,
        userId,
      );
    if (!postLikeInfo) {
      await this.commandBus.execute(
        new AddPostLikeInfoCommand(userId, postId, user!.login, likeStatus),
      );
    }
    if (postLikeInfo && postLikeInfo.likeStatus !== likeStatus) {
      await this.commandBus.execute(
        new UpdatePostLikeInfoCommand(userId, postId, likeStatus),
      );
    }
    const likesInfo = getUpdatedLikesCountForPost({
      postLikeInfo,
      likeStatus,
      post,
    });
    if (postLikeInfo?.likeStatus !== likeStatus) {
      await this.postsRepository.updatePostLikeInfo(postId, likesInfo);
    }
    if (postLikeInfo?.likeStatus === likeStatus) {
      return true;
    }
    return true;
  }
}
