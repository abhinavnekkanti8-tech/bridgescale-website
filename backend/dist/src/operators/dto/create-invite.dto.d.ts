import { MembershipRole } from '@prisma/client';
export declare class CreateInviteDto {
    email: string;
    role: MembershipRole;
    orgName?: string;
}
