import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const MongoSession = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.session;
  },
);
