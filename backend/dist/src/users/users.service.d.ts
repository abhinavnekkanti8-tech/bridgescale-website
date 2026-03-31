import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByEmail(email: string): Promise<({
        memberships: ({
            organization: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                orgType: import(".prisma/client").$Enums.OrgType;
                country: string | null;
                website: string | null;
            };
        } & {
            id: string;
            status: import(".prisma/client").$Enums.MembershipStatus;
            createdAt: Date;
            updatedAt: Date;
            membershipRole: import(".prisma/client").$Enums.MembershipRole;
            orgId: string;
            userId: string;
        })[];
    } & {
        id: string;
        email: string;
        name: string;
        passwordHash: string;
        status: import(".prisma/client").$Enums.UserStatus;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    findById(id: string): Promise<{
        memberships: ({
            organization: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                orgType: import(".prisma/client").$Enums.OrgType;
                country: string | null;
                website: string | null;
            };
        } & {
            id: string;
            status: import(".prisma/client").$Enums.MembershipStatus;
            createdAt: Date;
            updatedAt: Date;
            membershipRole: import(".prisma/client").$Enums.MembershipRole;
            orgId: string;
            userId: string;
        })[];
    } & {
        id: string;
        email: string;
        name: string;
        passwordHash: string;
        status: import(".prisma/client").$Enums.UserStatus;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    sanitize(user: Awaited<ReturnType<typeof this.findByEmail>>): {
        memberships: ({
            organization: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                orgType: import(".prisma/client").$Enums.OrgType;
                country: string | null;
                website: string | null;
            };
        } & {
            id: string;
            status: import(".prisma/client").$Enums.MembershipStatus;
            createdAt: Date;
            updatedAt: Date;
            membershipRole: import(".prisma/client").$Enums.MembershipRole;
            orgId: string;
            userId: string;
        })[];
        id: string;
        email: string;
        name: string;
        status: import(".prisma/client").$Enums.UserStatus;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    } | null;
    touchLoginTimestamp(userId: string): Promise<{
        id: string;
        email: string;
        name: string;
        passwordHash: string;
        status: import(".prisma/client").$Enums.UserStatus;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
