import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

/**
 * Ensures that the incoming request has an authenticated session.
 * Apply to any route that requires a logged-in user.
 */
@Injectable()
export class SessionAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    if (!request.session?.user?.id) {
      throw new UnauthorizedException('You must be logged in to access this resource.');
    }

    return true;
  }
}
