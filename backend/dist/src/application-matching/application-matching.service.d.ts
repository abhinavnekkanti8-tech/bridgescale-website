import { PrismaService } from '../prisma/prisma.service';
export declare class ApplicationMatchingService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createShortlist(companyApplicationId: string, params: {
        name: string;
    }): Promise<{
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
    getShortlist(shortlistId: string): Promise<{
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
    addCandidateToShortlist(shortlistId: string, talentApplicationId: string, params?: {
        matchScore?: number;
        explanation?: string;
    }): Promise<{
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
    updateCandidate(candidateId: string, params: {
        matchScore?: number;
        explanation?: string;
    }): Promise<{
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
    getTopCandidates(shortlistId: string, limit?: number): Promise<{
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
    }[]>;
    private calculateFitScore;
}
