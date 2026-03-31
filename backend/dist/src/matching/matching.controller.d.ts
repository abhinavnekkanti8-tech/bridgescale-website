import { MatchingService } from './matching.service';
export declare class MatchingController {
    private readonly matchingService;
    constructor(matchingService: MatchingService);
    generateShortlist(id: string): Promise<{
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
    findByStartup(id: string): Promise<({
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
    findOne(id: string): Promise<{
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
    publish(id: string): Promise<{
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
    operatorRespond(id: string, body: {
        interest: 'ACCEPTED' | 'DECLINED';
        declineReason?: string;
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
