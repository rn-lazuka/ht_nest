import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const TitleOfDevice = createParamDecorator(
  (data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();

    return request.headers['user-agent'] || 'unknown';
  },
);
