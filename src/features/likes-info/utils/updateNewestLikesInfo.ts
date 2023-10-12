import { NewestLikesType } from '../domain/types';

export function updateNewestLikesInfo(newestLikes: NewestLikesType) {
  const updatedNewestLikesInfo: any = [];

  for (const i of newestLikes) {
    updatedNewestLikesInfo.push({
      userId: i.userId,
      login: i.login,
      addedAt: i.addedAt,
    });
  }

  return updatedNewestLikesInfo;
}
