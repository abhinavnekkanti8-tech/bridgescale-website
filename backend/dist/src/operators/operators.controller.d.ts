import { OperatorsService } from './operators.service';
import { CreateOperatorProfileDto } from './dto/create-operator-profile.dto';
import { UpdateOperatorProfileDto } from './dto/update-operator-profile.dto';
import { CreateInviteDto } from './dto/create-invite.dto';
import { SessionUser } from '../common/types/session.types';
declare class OverrideScoreDto {
    scoreTotal: number;
    overrideReason: string;
}
declare class AcceptInviteDto {
    token: string;
    name: string;
    password: string;
}
export declare class OperatorsController {
    private readonly operatorsService;
    constructor(operatorsService: OperatorsService);
    createInvite(dto: CreateInviteDto): Promise<{
        inviteUrl: string;
        id: string;
        email: string;
        status: import(".prisma/client").$Enums.InviteStatus;
        createdAt: Date;
        role: import(".prisma/client").$Enums.MembershipRole;
        orgName: string | null;
        token: string;
        expiresAt: Date;
    }>;
    listInvites(): Promise<{
        id: string;
        email: string;
        status: import(".prisma/client").$Enums.InviteStatus;
        createdAt: Date;
        role: import(".prisma/client").$Enums.MembershipRole;
        orgName: string | null;
        token: string;
        expiresAt: Date;
    }[]>;
    revokeInvite(id: string): Promise<{
        id: string;
        email: string;
        status: import(".prisma/client").$Enums.InviteStatus;
        createdAt: Date;
        role: import(".prisma/client").$Enums.MembershipRole;
        orgName: string | null;
        token: string;
        expiresAt: Date;
    }>;
    acceptInvite(dto: AcceptInviteDto): Promise<{
        userId: string;
        orgId: string;
        email: string;
    }>;
    createProfile(dto: CreateOperatorProfileDto, user: SessionUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        operatorId: string;
        yearsExperience: number | null;
        references: import("@prisma/client/runtime/library").JsonValue | null;
        linkedIn: string | null;
        lanes: import(".prisma/client").$Enums.OperatorLane[];
        regions: import(".prisma/client").$Enums.TargetMarket[];
        functions: string[];
        experienceTags: string[];
        availability: string | null;
        bio: string | null;
        verification: import(".prisma/client").$Enums.OperatorVerification;
        tier: import(".prisma/client").$Enums.OperatorTier;
    }>;
    getMyProfile(user: SessionUser): Promise<({
        scores: {
            id: string;
            createdAt: Date;
            scoreTotal: number;
            blockers: string[];
            recommendation: string | null;
            promptVersion: string | null;
            modelName: string | null;
            profileId: string;
            scoreBreakdown: import("@prisma/client/runtime/library").JsonValue;
            generatedBy: string;
            temperature: number | null;
            adminOverride: boolean;
            overrideReason: string | null;
            tier: import(".prisma/client").$Enums.OperatorTier;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        operatorId: string;
        yearsExperience: number | null;
        references: import("@prisma/client/runtime/library").JsonValue | null;
        linkedIn: string | null;
        lanes: import(".prisma/client").$Enums.OperatorLane[];
        regions: import(".prisma/client").$Enums.TargetMarket[];
        functions: string[];
        experienceTags: string[];
        availability: string | null;
        bio: string | null;
        verification: import(".prisma/client").$Enums.OperatorVerification;
        tier: import(".prisma/client").$Enums.OperatorTier;
    }) | null>;
    updateProfile(id: string, dto: UpdateOperatorProfileDto, user: SessionUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        operatorId: string;
        yearsExperience: number | null;
        references: import("@prisma/client/runtime/library").JsonValue | null;
        linkedIn: string | null;
        lanes: import(".prisma/client").$Enums.OperatorLane[];
        regions: import(".prisma/client").$Enums.TargetMarket[];
        functions: string[];
        experienceTags: string[];
        availability: string | null;
        bio: string | null;
        verification: import(".prisma/client").$Enums.OperatorVerification;
        tier: import(".prisma/client").$Enums.OperatorTier;
    }>;
    findAll(): Promise<({
        operator: {
            id: string;
            name: string;
            country: string | null;
        };
        scores: {
            id: string;
            createdAt: Date;
            scoreTotal: number;
            blockers: string[];
            recommendation: string | null;
            promptVersion: string | null;
            modelName: string | null;
            profileId: string;
            scoreBreakdown: import("@prisma/client/runtime/library").JsonValue;
            generatedBy: string;
            temperature: number | null;
            adminOverride: boolean;
            overrideReason: string | null;
            tier: import(".prisma/client").$Enums.OperatorTier;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        operatorId: string;
        yearsExperience: number | null;
        references: import("@prisma/client/runtime/library").JsonValue | null;
        linkedIn: string | null;
        lanes: import(".prisma/client").$Enums.OperatorLane[];
        regions: import(".prisma/client").$Enums.TargetMarket[];
        functions: string[];
        experienceTags: string[];
        availability: string | null;
        bio: string | null;
        verification: import(".prisma/client").$Enums.OperatorVerification;
        tier: import(".prisma/client").$Enums.OperatorTier;
    })[]>;
    findOne(id: string): Promise<{
        scores: {
            id: string;
            createdAt: Date;
            scoreTotal: number;
            blockers: string[];
            recommendation: string | null;
            promptVersion: string | null;
            modelName: string | null;
            profileId: string;
            scoreBreakdown: import("@prisma/client/runtime/library").JsonValue;
            generatedBy: string;
            temperature: number | null;
            adminOverride: boolean;
            overrideReason: string | null;
            tier: import(".prisma/client").$Enums.OperatorTier;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        operatorId: string;
        yearsExperience: number | null;
        references: import("@prisma/client/runtime/library").JsonValue | null;
        linkedIn: string | null;
        lanes: import(".prisma/client").$Enums.OperatorLane[];
        regions: import(".prisma/client").$Enums.TargetMarket[];
        functions: string[];
        experienceTags: string[];
        availability: string | null;
        bio: string | null;
        verification: import(".prisma/client").$Enums.OperatorVerification;
        tier: import(".prisma/client").$Enums.OperatorTier;
    }>;
    requestScore(id: string): Promise<{
        status: string;
        profileId: string;
    }>;
    getScores(id: string): Promise<{
        id: string;
        createdAt: Date;
        scoreTotal: number;
        blockers: string[];
        recommendation: string | null;
        promptVersion: string | null;
        modelName: string | null;
        profileId: string;
        scoreBreakdown: import("@prisma/client/runtime/library").JsonValue;
        generatedBy: string;
        temperature: number | null;
        adminOverride: boolean;
        overrideReason: string | null;
        tier: import(".prisma/client").$Enums.OperatorTier;
    }[]>;
    verifyOperator(id: string, action: 'VERIFIED' | 'REJECTED'): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        operatorId: string;
        yearsExperience: number | null;
        references: import("@prisma/client/runtime/library").JsonValue | null;
        linkedIn: string | null;
        lanes: import(".prisma/client").$Enums.OperatorLane[];
        regions: import(".prisma/client").$Enums.TargetMarket[];
        functions: string[];
        experienceTags: string[];
        availability: string | null;
        bio: string | null;
        verification: import(".prisma/client").$Enums.OperatorVerification;
        tier: import(".prisma/client").$Enums.OperatorTier;
    }>;
    overrideScore(scoreId: string, dto: OverrideScoreDto, user: SessionUser): Promise<{
        id: string;
        createdAt: Date;
        scoreTotal: number;
        blockers: string[];
        recommendation: string | null;
        promptVersion: string | null;
        modelName: string | null;
        profileId: string;
        scoreBreakdown: import("@prisma/client/runtime/library").JsonValue;
        generatedBy: string;
        temperature: number | null;
        adminOverride: boolean;
        overrideReason: string | null;
        tier: import(".prisma/client").$Enums.OperatorTier;
    }>;
}
export {};
