import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from './blogSchema';
import { BlogQueryModel } from './models/input/blog.input.model';
import { getQueryParams } from '../../infrastructure/utils/getQueryParams';
import { BlogViewType } from './models/output/blog.output.model';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private blogModel: BlogModelType) {}

  async getAllBlogs(query: BlogQueryModel) {
    const filter: any = {};
    const paramsOfElems = getQueryParams(query);
    if (query.searchNameTerm) {
      filter.name = { $regex: query.searchNameTerm, $options: 'i' };
    }
    const blogsCount = await this.blogModel.countDocuments(filter);
    const blogs = await this.blogModel
      .find(filter)
      .skip((paramsOfElems.pageNumber - 1) * paramsOfElems.pageSize)
      .limit(paramsOfElems.pageSize)
      .sort(paramsOfElems.paramSort);

    return {
      pagesCount: Math.ceil(blogsCount / paramsOfElems.pageSize),
      page: paramsOfElems.pageNumber,
      pageSize: paramsOfElems.pageSize,
      totalCount: blogsCount,
      items: blogs.map((p) => p.convertToViewModel()),
    };
  }

  async getBlogById(id: string): Promise<BlogViewType | null> {
    const blog = await this.blogModel.findById(id);
    if (!blog) return null;
    return blog.convertToViewModel();
  }
}
