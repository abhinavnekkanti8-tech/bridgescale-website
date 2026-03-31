import { MembershipRole } from '@prisma/client';

/**
 * Shape of the authenticated user object stored in the express-session,
 * and exposed through the @CurrentUser() decorator.
 */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: MembershipRole;
  orgId: string;
}

/**
 * Augment express-session to include our custom session data.
 */
declare module 'express-session' {
  interface SessionData {
    user: SessionUser;
  }
}
