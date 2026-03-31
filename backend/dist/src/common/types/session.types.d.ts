import { MembershipRole } from '@prisma/client';
export interface SessionUser {
    id: string;
    name: string;
    email: string;
    role: MembershipRole;
    orgId: string;
}
declare module 'express-session' {
    interface SessionData {
        user: SessionUser;
    }
}
