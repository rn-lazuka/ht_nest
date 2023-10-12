import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RefreshToken = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    return request.cookies.refreshToken || null;
  },
);
