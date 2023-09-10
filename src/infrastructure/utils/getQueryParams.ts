import { QueryParams } from '../types/QueryParams';
import { SortOrder } from 'mongoose';

export function getQueryParams(query: QueryParams) {
  const pageNumber = query?.pageNumber ? Number(query.pageNumber) : 1;
  const pageSize = query?.pageSize ? Number(query.pageSize) : 10;
  const sortBy = query?.sortBy ?? '_id';
  const sortDirection = query?.sortDirection === 'asc' ? 1 : -1;
  const paramSort = { [sortBy]: sortDirection } as { [key: string]: SortOrder };

  return {
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
    paramSort,
  };
}
