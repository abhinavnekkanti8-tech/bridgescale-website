import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { CreateOperatorProfileDto } from './dto/create-operator-profile.dto';
import { UpdateOperatorProfileDto } from './dto/update-operator-profile.dto';
import { CreateInviteDto } from './dto/create-invite.dto';
import { SessionUser } from '../common/types/session.types';
export interface SupplyScoreBreakdown {
    domainExpertise: number;
    regionExperience: number;
    referencesVerified: number;
    trackRecord: number;
    platformFit: number;
    availability: number;
    responsiveness: number;
}
export interface SupplyScoreOutput {
    componentScores: SupplyScoreBreakdown;
    totalScore: number;
    blockers: string[];
    recommendation: string;
    tier: 'TIER_A' | 'TIER_B' | 'TIER_C';
}
export declare class OperatorsService {
    private readonly prisma;
    private readonly aiService;
    private readonly logger;
    constructor(prisma: PrismaService, aiService: AiService);
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
    acceptInvite(token: string, name: string, password: string): Promise<{
        userId: string;
        orgId: string;
        email: string;
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
    revokeInvite(inviteId: string): Promise<{
        id: string;
        email: string;
        status: import(".prisma/client").$Enums.InviteStatus;
        createdAt: Date;
        role: import(".prisma/client").$Enums.MembershipRole;
        orgName: string | null;
        token: string;
        expiresAt: Date;
    }>;
    createProfile(orgId: string, dto: CreateOperatorProfileDto): Promise<{
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
    updateProfile(profileId: string, orgId: string, dto: UpdateOperatorProfileDto): Promise<{
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
    findOne(profileId: string): Promise<{
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
    findByOrgId(orgId: string): Promise<({
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
    requestScore(profileId: string): Promise<{
        status: string;
        profileId: string;
    }>;
    private runScoringJob;
    private buildMockSupplyScore;
    verifyOperator(profileId: string, action: 'VERIFIED' | 'REJECTED'): Promise<{
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
    overrideScore(scoreId: string, admin: SessionUser, data: {
        scoreTotal: number;
        overrideReason: string;
    }): Promise<{
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
    getScores(profileId: string): Promise<{
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
}
