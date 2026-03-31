import { PrismaService } from '../prisma/prisma.service';
import { UpdateEngagementStatusDto, CreateMilestoneDto, UpdateMilestoneDto, CreateNoteDto } from './dto/engagements.dto';
export declare class EngagementsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    initializeEngagement(contractId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.EngagementStatus;
        createdAt: Date;
        updatedAt: Date;
        contractId: string;
        startupId: string;
        operatorId: string;
        startDate: Date | null;
        endDate: Date | null;
        healthScore: number;
    }>;
    getEngagement(id: string): Promise<{
        contract: {
            sow: {
                title: string;
                scope: string;
                deliverables: string;
            };
        };
        startup: {
            industry: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.EngagementStatus;
        createdAt: Date;
        updatedAt: Date;
        contractId: string;
        startupId: string;
        operatorId: string;
        startDate: Date | null;
        endDate: Date | null;
        healthScore: number;
    }>;
    getWorkspaceData(engagementId: string): Promise<{
        milestones: {
            id: string;
            status: import(".prisma/client").$Enums.MilestoneStatus;
            createdAt: Date;
            updatedAt: Date;
            engagementId: string;
            description: string;
            dueDate: Date;
            title: string;
            completedAt: Date | null;
            evidenceUrl: string | null;
        }[];
        notes: ({
            author: {
                email: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            engagementId: string;
            authorId: string;
            content: string;
            isPinned: boolean;
        })[];
        logs: ({
            actor: {
                email: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            engagementId: string;
            description: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            actorId: string;
            actionType: string;
        })[];
    }>;
    findByStartup(startupId: string): Promise<({
        contract: {
            sow: {
                title: string;
            };
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.EngagementStatus;
        createdAt: Date;
        updatedAt: Date;
        contractId: string;
        startupId: string;
        operatorId: string;
        startDate: Date | null;
        endDate: Date | null;
        healthScore: number;
    })[]>;
    findByOperator(operatorId: string): Promise<({
        contract: {
            sow: {
                title: string;
            };
        };
        startup: {
            industry: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.EngagementStatus;
        createdAt: Date;
        updatedAt: Date;
        contractId: string;
        startupId: string;
        operatorId: string;
        startDate: Date | null;
        endDate: Date | null;
        healthScore: number;
    })[]>;
    updateStatus(id: string, dto: UpdateEngagementStatusDto, actorId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.EngagementStatus;
        createdAt: Date;
        updatedAt: Date;
        contractId: string;
        startupId: string;
        operatorId: string;
        startDate: Date | null;
        endDate: Date | null;
        healthScore: number;
    }>;
    createMilestone(engagementId: string, dto: CreateMilestoneDto, actorId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.MilestoneStatus;
        createdAt: Date;
        updatedAt: Date;
        engagementId: string;
        description: string;
        dueDate: Date;
        title: string;
        completedAt: Date | null;
        evidenceUrl: string | null;
    }>;
    updateMilestone(milestoneId: string, dto: UpdateMilestoneDto, actorId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.MilestoneStatus;
        createdAt: Date;
        updatedAt: Date;
        engagementId: string;
        description: string;
        dueDate: Date;
        title: string;
        completedAt: Date | null;
        evidenceUrl: string | null;
    }>;
    addNote(engagementId: string, dto: CreateNoteDto, authorId: string): Promise<{
        author: {
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        engagementId: string;
        authorId: string;
        content: string;
        isPinned: boolean;
    }>;
    private logActivity;
}
