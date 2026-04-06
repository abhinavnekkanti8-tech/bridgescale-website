import { ApplicationMatchingService } from './application-matching.service';
export declare class ApplicationMatchingController {
    private readonly matchingService;
    constructor(matchingService: ApplicationMatchingService);
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
    addCandidate(shortlistId: string, talentApplicationId: string, params?: {
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
    getTopCandidates(shortlistId: string): Promise<{
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
}
