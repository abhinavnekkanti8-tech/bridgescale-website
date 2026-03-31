import { PrismaService } from '../prisma/prisma.service';
import { HealthService } from './health.service';
import { CreateEscalationDto, UpdateEscalationDto, CreateNudgeDto } from './dto/health.dto';
interface ServiceStatus {
    status: 'up' | 'down';
    latencyMs?: number;
    error?: string;
}
interface HealthResult {
    status: 'ok' | 'degraded';
    timestamp: string;
    uptime: number;
    services: {
        database: ServiceStatus;
    };
}
export declare class HealthController {
    private readonly prisma;
    private readonly healthService;
    constructor(prisma: PrismaService, healthService: HealthService);
    check(): Promise<HealthResult>;
    getSnapshots(id: string): Promise<{
        id: string;
        createdAt: Date;
        scoreTotal: number;
        aiCommentary: string | null;
        suggestedAction: string | null;
        engagementId: string;
        components: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    recalculate(id: string): Promise<{
        id: string;
        createdAt: Date;
        scoreTotal: number;
        aiCommentary: string | null;
        suggestedAction: string | null;
        engagementId: string;
        components: import("@prisma/client/runtime/library").JsonValue;
    }>;
    getMyNudges(user: any): Promise<({
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
    markNudgeRead(id: string): Promise<{
        id: string;
        createdAt: Date;
        nudgeType: import(".prisma/client").$Enums.NudgeType;
        targetUserId: string;
        message: string;
        engagementId: string;
        isRead: boolean;
    }>;
    createNudge(id: string, dto: CreateNudgeDto): Promise<{
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
    createEscalation(dto: CreateEscalationDto, user: any): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.EscalationStatus;
        createdAt: Date;
        updatedAt: Date;
        engagementId: string;
        reason: string;
        resolutionNotes: string | null;
        reporterId: string;
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
export {};
