import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { SessionUser } from '../types/session.types';

/**
 * Extract the authenticated user from the session.
 *
 * @example
 * @Get('profile')
 * getProfile(@CurrentUser() user: SessionUser) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): SessionUser | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.session?.user;
  },
);
