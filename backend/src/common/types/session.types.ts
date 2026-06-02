import { MembershipRole, OnboardingStage, UserStatus } from '@prisma/client';

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
  status: UserStatus;
  stage: OnboardingStage;
}

/**
 * Augment express-session to include our custom session data.
 */
declare module 'express-session' {
  interface SessionData {
    user: SessionUser;
    oauthState?: {
      provider: string;
      state: string;
      nextPath?: string;
    };
  }
}
