import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  PostCreateBody,
  PostCreateModel,
} from '../models/input/post.input.model';
import { PostViewType } from '../models/output/post.output.model';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../postSchema';
import { BlogsRepository } from '../../blogs/blogs-repository';
import { PostsRepository } from '../postsRepository';
import { LikesInfoQueryRepository } from '../../likes-info/infrastructure/query.repository/likes-info.query.repository';
import { updateNewestLikesInfo } from '../../likes-info/utils/updateNewestLikesInfo';
import { LikeStatus } from '../../../infrastructure/helpers/enums/like-status';

export class CreatePostCommand {
  constructor(public createData: PostCreateModel) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    @InjectModel(Post.name)
    private postModel: PostModelType,
    protected blogsRepository: BlogsRepository,
    protected postsRepository: PostsRepository,
    protected likesInfoQueryRepository: LikesInfoQueryRepository,
  ) {}

  async execute(command: CreatePostCommand): Promise<null | PostViewType> {
    const { createData } = command;
    const blog = await this.blogsRepository.getBlogInstance(createData.blogId);
    if (!blog) {
      return null;
    }

    const postData: PostCreateBody = {
      ...createData,
      blogName: blog.name,
    };

    const post = this.postModel.createInstance(postData, this.postModel);
    await this.postsRepository.save(post);

    // find last 3 Likes
    const newestLikes =
      await this.likesInfoQueryRepository.getNewestLikesOfPost(
        post._id.toString(),
      );
    const updatedNewestLikes = updateNewestLikesInfo(newestLikes);
    const myStatus = LikeStatus.None;
    return post.convertToViewModel(myStatus, updatedNewestLikes);
  }
}
