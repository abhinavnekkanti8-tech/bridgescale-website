import { StartupsService } from './startups.service';
import { CreateStartupProfileDto } from './dto/create-startup-profile.dto';
import { UpdateStartupProfileDto } from './dto/update-startup-profile.dto';
import { SessionUser } from '../common/types/session.types';
declare class OverrideScoreDto {
    scoreTotal: number;
    overrideReason: string;
}
export declare class StartupsController {
    private readonly startupsService;
    constructor(startupsService: StartupsService);
    create(dto: CreateStartupProfileDto, user: SessionUser): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.ProfileStatus;
        createdAt: Date;
        updatedAt: Date;
        hasDeck: boolean;
        hasProductDemo: boolean;
        executionOwner: string | null;
        toolingReady: boolean;
        responsivenessCommit: boolean;
        budgetBand: import(".prisma/client").$Enums.BudgetBand;
        startupId: string;
        industry: string;
        stage: import(".prisma/client").$Enums.StartupStage;
        targetMarkets: import(".prisma/client").$Enums.TargetMarket[];
        salesMotion: import(".prisma/client").$Enums.SalesMotion;
        additionalContext: string | null;
    }>;
    update(id: string, dto: UpdateStartupProfileDto, user: SessionUser): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.ProfileStatus;
        createdAt: Date;
        updatedAt: Date;
        hasDeck: boolean;
        hasProductDemo: boolean;
        executionOwner: string | null;
        toolingReady: boolean;
        responsivenessCommit: boolean;
        budgetBand: import(".prisma/client").$Enums.BudgetBand;
        startupId: string;
        industry: string;
        stage: import(".prisma/client").$Enums.StartupStage;
        targetMarkets: import(".prisma/client").$Enums.TargetMarket[];
        salesMotion: import(".prisma/client").$Enums.SalesMotion;
        additionalContext: string | null;
    }>;
    getMyProfile(user: SessionUser): Promise<({
        scores: {
            id: string;
            createdAt: Date;
            scoreTotal: number;
            blockers: string[];
            recommendation: string | null;
            eligibility: import(".prisma/client").$Enums.Eligibility;
            promptVersion: string | null;
            modelName: string | null;
            profileId: string;
            scoreBreakdown: import("@prisma/client/runtime/library").JsonValue;
            generatedBy: string;
            temperature: number | null;
            adminOverride: boolean;
            overrideReason: string | null;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ProfileStatus;
        createdAt: Date;
        updatedAt: Date;
        hasDeck: boolean;
        hasProductDemo: boolean;
        executionOwner: string | null;
        toolingReady: boolean;
        responsivenessCommit: boolean;
        budgetBand: import(".prisma/client").$Enums.BudgetBand;
        startupId: string;
        industry: string;
        stage: import(".prisma/client").$Enums.StartupStage;
        targetMarkets: import(".prisma/client").$Enums.TargetMarket[];
        salesMotion: import(".prisma/client").$Enums.SalesMotion;
        additionalContext: string | null;
    }) | null>;
    findAll(): Promise<({
        startup: {
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
            eligibility: import(".prisma/client").$Enums.Eligibility;
            promptVersion: string | null;
            modelName: string | null;
            profileId: string;
            scoreBreakdown: import("@prisma/client/runtime/library").JsonValue;
            generatedBy: string;
            temperature: number | null;
            adminOverride: boolean;
            overrideReason: string | null;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ProfileStatus;
        createdAt: Date;
        updatedAt: Date;
        hasDeck: boolean;
        hasProductDemo: boolean;
        executionOwner: string | null;
        toolingReady: boolean;
        responsivenessCommit: boolean;
        budgetBand: import(".prisma/client").$Enums.BudgetBand;
        startupId: string;
        industry: string;
        stage: import(".prisma/client").$Enums.StartupStage;
        targetMarkets: import(".prisma/client").$Enums.TargetMarket[];
        salesMotion: import(".prisma/client").$Enums.SalesMotion;
        additionalContext: string | null;
    })[]>;
    findOne(id: string): Promise<{
        scores: {
            id: string;
            createdAt: Date;
            scoreTotal: number;
            blockers: string[];
            recommendation: string | null;
            eligibility: import(".prisma/client").$Enums.Eligibility;
            promptVersion: string | null;
            modelName: string | null;
            profileId: string;
            scoreBreakdown: import("@prisma/client/runtime/library").JsonValue;
            generatedBy: string;
            temperature: number | null;
            adminOverride: boolean;
            overrideReason: string | null;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ProfileStatus;
        createdAt: Date;
        updatedAt: Date;
        hasDeck: boolean;
        hasProductDemo: boolean;
        executionOwner: string | null;
        toolingReady: boolean;
        responsivenessCommit: boolean;
        budgetBand: import(".prisma/client").$Enums.BudgetBand;
        startupId: string;
        industry: string;
        stage: import(".prisma/client").$Enums.StartupStage;
        targetMarkets: import(".prisma/client").$Enums.TargetMarket[];
        salesMotion: import(".prisma/client").$Enums.SalesMotion;
        additionalContext: string | null;
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
        eligibility: import(".prisma/client").$Enums.Eligibility;
        promptVersion: string | null;
        modelName: string | null;
        profileId: string;
        scoreBreakdown: import("@prisma/client/runtime/library").JsonValue;
        generatedBy: string;
        temperature: number | null;
        adminOverride: boolean;
        overrideReason: string | null;
    }[]>;
    overrideScore(scoreId: string, dto: OverrideScoreDto, user: SessionUser): Promise<{
        id: string;
        createdAt: Date;
        scoreTotal: number;
        blockers: string[];
        recommendation: string | null;
        eligibility: import(".prisma/client").$Enums.Eligibility;
        promptVersion: string | null;
        modelName: string | null;
        profileId: string;
        scoreBreakdown: import("@prisma/client/runtime/library").JsonValue;
        generatedBy: string;
        temperature: number | null;
        adminOverride: boolean;
        overrideReason: string | null;
    }>;
}
export {};
