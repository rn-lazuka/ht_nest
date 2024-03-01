import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument, BlogModelType } from './blogSchema';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: BlogModelType) {}

  async getBlogInstance(blogId: string): Promise<null | BlogDocument> {
    const blog = await this.blogModel.findById(blogId);
    return blog ? blog : null;
  }

  async deleteBlog(id: string) {
    const result = await this.blogModel.findByIdAndDelete(id);
    return !!result;
  }

  async save(blog: BlogDocument): Promise<void> {
    await blog.save();
    return;
  }
}
