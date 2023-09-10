import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from './blogSchema';
import { BlogsRepository } from './blogsRepository';
import {
  BlogUpdateType,
  CreateBlogModel,
} from './models/input/blog.input.model';
import { BlogViewType } from './models/output/blog.output.model';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name)
    private blogModel: BlogModelType,
    protected blogsRepository: BlogsRepository,
  ) {}

  async createBlog(createBlogModel: CreateBlogModel): Promise<BlogViewType> {
    const blog = this.blogModel.createInstance(createBlogModel, this.blogModel);
    await this.blogsRepository.save(blog);
    return blog.modifyIntoViewModel();
  }

  async updateBlog(id: string, blogBody: BlogUpdateType): Promise<boolean> {
    const blog = await this.blogsRepository.getBlogInstance(id);
    if (!blog) {
      return false;
    }

    blog.updateBlogInfo(blog, blogBody);
    await this.blogsRepository.save(blog);

    return true;
  }
}
