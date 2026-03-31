import { PrismaService } from '../prisma/prisma.service';
import { CreateEscalationDto, UpdateEscalationDto, CreateNudgeDto } from './dto/health.dto';
import { AiService } from '../ai/ai.service';
export declare class HealthService {
    private prisma;
    private aiService;
    private readonly logger;
    constructor(prisma: PrismaService, aiService: AiService);
    recalculateHealth(engagementId: string): Promise<{
        id: string;
        createdAt: Date;
        scoreTotal: number;
        aiCommentary: string | null;
        suggestedAction: string | null;
        engagementId: string;
        components: import("@prisma/client/runtime/library").JsonValue;
    }>;
    getLatestSnapshot(engagementId: string): Promise<{
        id: string;
        createdAt: Date;
        scoreTotal: number;
        aiCommentary: string | null;
        suggestedAction: string | null;
        engagementId: string;
        components: import("@prisma/client/runtime/library").JsonValue;
    } | null>;
    getAllSnapshots(engagementId: string): Promise<{
        id: string;
        createdAt: Date;
        scoreTotal: number;
        aiCommentary: string | null;
        suggestedAction: string | null;
        engagementId: string;
        components: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    createNudge(engagementId: string, dto: CreateNudgeDto): Promise<{
        targetUser: {
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        nudgeType: import(".prisma/client").$Enums.NudgeType;
        targetUserId: string;
        message: string;
        engagementId: string;
        isRead: boolean;
    }>;
    getMyNudges(userId: string): Promise<({
        engagement: {
            contract: {
                sow: {
                    title: string;
                };
            };
        };
    } & {
        id: string;
        createdAt: Date;
        nudgeType: import(".prisma/client").$Enums.NudgeType;
        targetUserId: string;
        message: string;
        engagementId: string;
        isRead: boolean;
    })[]>;
    markNudgeRead(nudgeId: string): Promise<{
        id: string;
        createdAt: Date;
        nudgeType: import(".prisma/client").$Enums.NudgeType;
        targetUserId: string;
        message: string;
        engagementId: string;
        isRead: boolean;
    }>;
    getOpenEscalations(): Promise<({
        engagement: {
            id: string;
            status: import(".prisma/client").$Enums.EngagementStatus;
        };
        reporter: {
            email: string;
            name: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.EscalationStatus;
        createdAt: Date;
        updatedAt: Date;
        engagementId: string;
        reason: string;
        resolutionNotes: string | null;
        reporterId: string;
    })[]>;
    createEscalation(reporterId: string, dto: CreateEscalationDto): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.EscalationStatus;
        createdAt: Date;
        updatedAt: Date;
        engagementId: string;
        reason: string;
        resolutionNotes: string | null;
        reporterId: string;
    }>;
    updateEscalationStatus(id: string, dto: UpdateEscalationDto): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.EscalationStatus;
        createdAt: Date;
        updatedAt: Date;
        engagementId: string;
        reason: string;
        resolutionNotes: string | null;
        reporterId: string;
    }>;
}
