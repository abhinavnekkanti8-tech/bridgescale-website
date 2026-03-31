import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { UpdateCloseoutDto, SubmitRatingDto } from './dto/closeout.dto';
export declare class CloseoutService {
    private prisma;
    private aiService;
    private readonly logger;
    constructor(prisma: PrismaService, aiService: AiService);
    generateReport(engagementId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.CloseoutStatus;
        createdAt: Date;
        updatedAt: Date;
        engagementId: string;
        promptVersion: string | null;
        summary: string;
        outcomes: string;
        nextSteps: string;
        generatedByAi: boolean;
    }>;
    getReport(engagementId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.CloseoutStatus;
        createdAt: Date;
        updatedAt: Date;
        engagementId: string;
        promptVersion: string | null;
        summary: string;
        outcomes: string;
        nextSteps: string;
        generatedByAi: boolean;
    } | null>;
    updateReport(engagementId: string, dto: UpdateCloseoutDto): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.CloseoutStatus;
        createdAt: Date;
        updatedAt: Date;
        engagementId: string;
        promptVersion: string | null;
        summary: string;
        outcomes: string;
        nextSteps: string;
        generatedByAi: boolean;
    }>;
    submitRating(engagementId: string, reviewerId: string, dto: SubmitRatingDto): Promise<{
        id: string;
        createdAt: Date;
        engagementId: string;
        components: import("@prisma/client/runtime/library").JsonValue | null;
        revieweeId: string;
        score: number;
        comments: string | null;
        reviewerId: string;
    }>;
    getEngagementRatings(engagementId: string): Promise<({
        reviewer: {
            email: string;
            name: string;
        };
        reviewee: {
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        engagementId: string;
        components: import("@prisma/client/runtime/library").JsonValue | null;
        revieweeId: string;
        score: number;
        comments: string | null;
        reviewerId: string;
    })[]>;
    generateRenewalRecommendation(engagementId: string): Promise<{
        id: string;
        createdAt: Date;
        engagementId: string;
        recommendedType: import(".prisma/client").$Enums.RenewalType;
        reasoning: string;
    }>;
    getRenewalRecommendation(engagementId: string): Promise<{
        id: string;
        createdAt: Date;
        engagementId: string;
        recommendedType: import(".prisma/client").$Enums.RenewalType;
        reasoning: string;
    } | null>;
}
