import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

/**
 * Routes that PENDING_APPROVAL users may still access.
 * They can poll their own application status, log out, or check session.
 */
const PENDING_APPROVAL_ALLOWED_PREFIXES = [
  '/api/v1/applications/me',
  '/api/v1/auth',
];

/**
 * Ensures that the incoming request has an authenticated session.
 * Apply to any route that requires a logged-in user.
 *
 * Additionally enforces that users with status PENDING_APPROVAL can only
 * reach a small whitelist of routes (their own application status + auth).
 */
@Injectable()
export class SessionAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    if (!request.session?.user?.id) {
      throw new UnauthorizedException('You must be logged in to access this resource.');
    }

    if (request.session.user.status === 'PENDING_APPROVAL') {
      const path = request.originalUrl || request.url || '';
      const allowed = PENDING_APPROVAL_ALLOWED_PREFIXES.some((prefix) =>
        path.startsWith(prefix),
      );
      if (!allowed) {
        throw new ForbiddenException(
          'Your application is still under review. Access will be granted once approved.',
        );
      }
    }

    return true;
  }
}
