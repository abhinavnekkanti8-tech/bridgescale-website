import { SetMetadata } from '@nestjs/common';
import { MembershipRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Attach one or more required roles to a route handler.
 * Used in conjunction with RolesGuard.
 *
 * @example
 * @Roles(MembershipRole.PLATFORM_ADMIN, MembershipRole.STARTUP_ADMIN)
 * @Get('sensitive-route')
 */
export const Roles = (...roles: MembershipRole[]) => SetMetadata(ROLES_KEY, roles);
