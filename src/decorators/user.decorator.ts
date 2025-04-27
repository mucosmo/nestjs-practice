import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const user = request.user || 'user';
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return data ? user?.[data] : user;
});
