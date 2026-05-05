import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

/**
 * Routes that ONBOARDING users may still access.
 */
const ONBOARDING_ALLOWED_PREFIXES = [
  '/api/v1/applications/talent',
  '/api/v1/auth',
];

/**
 * Routes that PENDING_APPROVAL users may still access.
 * They can poll their own application status, log out, or check session.
 */
const PENDING_APPROVAL_ALLOWED_PREFIXES = [
  '/api/v1/applications/me',
  '/api/v1/applications/my-application',
  '/api/v1/applications/completion-status',
  '/api/v1/applications/complete-assessment',
  '/api/v1/applications/complete-references',
  '/api/v1/applications/initiate-unlock',
  '/api/v1/applications/verify-unlock',
  '/api/v1/operators/profile',
  '/api/v1/operator-tax-profile',
  '/api/v1/calls',
  '/api/v1/engagement-intents',
  '/api/v1/pre-sow-summaries',
  '/api/v1/contracts/msa',
  '/api/v1/auth',
];

/**
 * Ensures that the incoming request has an authenticated session.
 * Apply to any route that requires a logged-in user.
 *
 * Additionally enforces onboarding-stage access restrictions.
 */
@Injectable()
export class SessionAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    if (!request.session?.user?.id) {
      throw new UnauthorizedException('You must be logged in to access this resource.');
    }

    if (request.session.user.stage === 'ONBOARDING') {
      const path = request.originalUrl || request.url || '';
      const allowed = ONBOARDING_ALLOWED_PREFIXES.some((prefix) =>
        path.startsWith(prefix),
      );
      if (!allowed) {
        throw new ForbiddenException(
          'Please complete onboarding before accessing this resource.',
        );
      }
    }

    if (request.session.user.stage === 'PENDING_APPROVAL') {
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
