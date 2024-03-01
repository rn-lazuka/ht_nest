import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBlogModel } from '../models/input/blog.input.model';
import { Blog, BlogModelType } from '../blogSchema';
import { BlogsRepository } from '../blogs-repository';
import { InjectModel } from '@nestjs/mongoose';

export class UpdateBlogCommand {
  constructor(
    public id: string,
    public blogBody: UpdateBlogModel,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(
    @InjectModel(Blog.name)
    private blogModel: BlogModelType,
    protected blogsRepository: BlogsRepository,
  ) {}

  async execute(command: UpdateBlogCommand): Promise<boolean> {
    const { blogBody, id } = command;
    const blog = await this.blogsRepository.getBlogInstance(id);
    if (!blog) {
      return false;
    }

    blog.updateBlogInfo(blog, blogBody);
    await this.blogsRepository.save(blog);

    return true;
  }
}
