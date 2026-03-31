import { CloseoutService } from './closeout.service';
import { UpdateCloseoutDto, SubmitRatingDto } from './dto/closeout.dto';
export declare class CloseoutController {
    private readonly service;
    constructor(service: CloseoutService);
    getReport(id: string): Promise<{
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
    generateReport(id: string): Promise<{
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
    updateReport(id: string, dto: UpdateCloseoutDto): Promise<{
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
    getRatings(id: string): Promise<({
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
    submitRating(id: string, dto: SubmitRatingDto, user: any): Promise<{
        id: string;
        createdAt: Date;
        engagementId: string;
        components: import("@prisma/client/runtime/library").JsonValue | null;
        revieweeId: string;
        score: number;
        comments: string | null;
        reviewerId: string;
    }>;
    getRenewal(id: string): Promise<{
        id: string;
        createdAt: Date;
        engagementId: string;
        recommendedType: import(".prisma/client").$Enums.RenewalType;
        reasoning: string;
    } | null>;
    generateRenewal(id: string): Promise<{
        id: string;
        createdAt: Date;
        engagementId: string;
        recommendedType: import(".prisma/client").$Enums.RenewalType;
        reasoning: string;
    }>;
}
