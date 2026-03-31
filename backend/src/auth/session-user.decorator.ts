import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Extract the authenticated user from the session.
 *
 * @example
 * @Get('profile')
 * getProfile(@SessionUser() user: any) { ... }
 */
export const SessionUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return (request.session as any)?.user;
  },
);
