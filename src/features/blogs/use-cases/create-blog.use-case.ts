import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBlogModel } from '../models/input/blog.input.model';
import { BlogViewType } from '../models/output/blog.output.model';
import { Blog, BlogModelType } from '../blogSchema';
import { BlogsRepository } from '../blogs-repository';
import { InjectModel } from '@nestjs/mongoose';

export class CreateBlogCommand {
  constructor(public createBlogModel: CreateBlogModel) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(
    @InjectModel(Blog.name)
    private blogModel: BlogModelType,
    protected blogsRepository: BlogsRepository,
  ) {}

  async execute(command: CreateBlogCommand): Promise<BlogViewType> {
    const { createBlogModel } = command;
    const blog = this.blogModel.createInstance(createBlogModel, this.blogModel);
    await this.blogsRepository.save(blog);
    return blog.convertToViewModel();
  }
}
