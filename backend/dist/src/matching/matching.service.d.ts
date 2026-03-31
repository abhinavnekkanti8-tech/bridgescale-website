import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
export interface MatchScoreBreakdown {
    laneAlignment: number;
    regionOverlap: number;
    budgetFit: number;
    experienceRelevance: number;
    availabilityMatch: number;
    tierBonus: number;
    motionFit: number;
}
export declare class MatchingService {
    private readonly prisma;
    private readonly aiService;
    private readonly logger;
    constructor(prisma: PrismaService, aiService: AiService);
    generateShortlist(startupProfileId: string): Promise<{
        candidates: {
            id: string;
            status: import(".prisma/client").$Enums.CandidateStatus;
            createdAt: Date;
            operatorId: string;
            shortlistId: string;
            scoreBreakdown: import("@prisma/client/runtime/library").JsonValue;
            matchScore: number;
            explanation: string | null;
            mainRisk: string | null;
            packageTier: import(".prisma/client").$Enums.PackageType | null;
            weeklyFitHours: number | null;
            interest: import(".prisma/client").$Enums.CandidateInterest;
            declineReason: string | null;
            selectedAt: Date | null;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ShortlistStatus;
        createdAt: Date;
        updatedAt: Date;
        startupProfileId: string;
        promptVersion: string | null;
        modelName: string | null;
        generatedBy: string;
        publishedAt: Date | null;
        selectionDeadline: Date | null;
    }>;
    private computeMatchScore;
    private generateExplanation;
    private identifyRisk;
    private recommendPackageTier;
    private estimateWeeklyHours;
    findOne(shortlistId: string): Promise<{
        candidates: {
            id: string;
            status: import(".prisma/client").$Enums.CandidateStatus;
            createdAt: Date;
            operatorId: string;
            shortlistId: string;
            scoreBreakdown: import("@prisma/client/runtime/library").JsonValue;
            matchScore: number;
            explanation: string | null;
            mainRisk: string | null;
            packageTier: import(".prisma/client").$Enums.PackageType | null;
            weeklyFitHours: number | null;
            interest: import(".prisma/client").$Enums.CandidateInterest;
            declineReason: string | null;
            selectedAt: Date | null;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ShortlistStatus;
        createdAt: Date;
        updatedAt: Date;
        startupProfileId: string;
        promptVersion: string | null;
        modelName: string | null;
        generatedBy: string;
        publishedAt: Date | null;
        selectionDeadline: Date | null;
    }>;
    findByStartup(startupProfileId: string): Promise<({
        candidates: {
            id: string;
            status: import(".prisma/client").$Enums.CandidateStatus;
            createdAt: Date;
            operatorId: string;
            shortlistId: string;
            scoreBreakdown: import("@prisma/client/runtime/library").JsonValue;
            matchScore: number;
            explanation: string | null;
            mainRisk: string | null;
            packageTier: import(".prisma/client").$Enums.PackageType | null;
            weeklyFitHours: number | null;
            interest: import(".prisma/client").$Enums.CandidateInterest;
            declineReason: string | null;
            selectedAt: Date | null;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ShortlistStatus;
        createdAt: Date;
        updatedAt: Date;
        startupProfileId: string;
        promptVersion: string | null;
        modelName: string | null;
        generatedBy: string;
        publishedAt: Date | null;
        selectionDeadline: Date | null;
    })[]>;
    findAll(): Promise<({
        startupProfile: {
            id: string;
            industry: string;
            stage: import(".prisma/client").$Enums.StartupStage;
        };
        candidates: {
            id: string;
            status: import(".prisma/client").$Enums.CandidateStatus;
            createdAt: Date;
            operatorId: string;
            shortlistId: string;
            scoreBreakdown: import("@prisma/client/runtime/library").JsonValue;
            matchScore: number;
            explanation: string | null;
            mainRisk: string | null;
            packageTier: import(".prisma/client").$Enums.PackageType | null;
            weeklyFitHours: number | null;
            interest: import(".prisma/client").$Enums.CandidateInterest;
            declineReason: string | null;
            selectedAt: Date | null;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ShortlistStatus;
        createdAt: Date;
        updatedAt: Date;
        startupProfileId: string;
        promptVersion: string | null;
        modelName: string | null;
        generatedBy: string;
        publishedAt: Date | null;
        selectionDeadline: Date | null;
    })[]>;
    publishShortlist(shortlistId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.ShortlistStatus;
        createdAt: Date;
        updatedAt: Date;
        startupProfileId: string;
        promptVersion: string | null;
        modelName: string | null;
        generatedBy: string;
        publishedAt: Date | null;
        selectionDeadline: Date | null;
    }>;
    operatorRespond(candidateId: string, interest: 'ACCEPTED' | 'DECLINED', declineReason?: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.CandidateStatus;
        createdAt: Date;
        operatorId: string;
        shortlistId: string;
        scoreBreakdown: import("@prisma/client/runtime/library").JsonValue;
        matchScore: number;
        explanation: string | null;
        mainRisk: string | null;
        packageTier: import(".prisma/client").$Enums.PackageType | null;
        weeklyFitHours: number | null;
        interest: import(".prisma/client").$Enums.CandidateInterest;
        declineReason: string | null;
        selectedAt: Date | null;
    }>;
    selectOperator(shortlistId: string, candidateId: string): Promise<{
        candidates: {
            id: string;
            status: import(".prisma/client").$Enums.CandidateStatus;
            createdAt: Date;
            operatorId: string;
            shortlistId: string;
            scoreBreakdown: import("@prisma/client/runtime/library").JsonValue;
            matchScore: number;
            explanation: string | null;
            mainRisk: string | null;
            packageTier: import(".prisma/client").$Enums.PackageType | null;
            weeklyFitHours: number | null;
            interest: import(".prisma/client").$Enums.CandidateInterest;
            declineReason: string | null;
            selectedAt: Date | null;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ShortlistStatus;
        createdAt: Date;
        updatedAt: Date;
        startupProfileId: string;
        promptVersion: string | null;
        modelName: string | null;
        generatedBy: string;
        publishedAt: Date | null;
        selectionDeadline: Date | null;
    }>;
}
