import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostCreateModel } from '../models/input/post.input.model';
import { PostsRepository } from '../postsRepository';
import { BadRequestException } from '@nestjs/common';
import { BlogsQueryRepository } from '../../blogs/blogs-query-repository';

export class UpdatePostCommand {
  constructor(
    public postId: string,
    public inputBodyPost: PostCreateModel,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsRepository: PostsRepository,
  ) {}

  async execute(command: UpdatePostCommand): Promise<boolean> {
    const { postId, inputBodyPost } = command;
    const blog = await this.blogsQueryRepository.getBlogById(
      inputBodyPost.blogId,
    );

    if (!blog) {
      throw new BadRequestException([
        {
          message: 'Such blogId is not found',
          field: 'blogId',
        },
      ]);
    }

    const post = await this.postsRepository.getPostDocumentById(postId);
    if (!post) return false;

    post.updatePostInfo(inputBodyPost);
    await this.postsRepository.save(post);

    return true;
  }
}
