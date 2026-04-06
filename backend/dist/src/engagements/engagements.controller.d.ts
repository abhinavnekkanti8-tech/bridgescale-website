import { EngagementsService } from './engagements.service';
import { UpdateEngagementStatusDto, CreateMilestoneDto, UpdateMilestoneDto, CreateNoteDto } from './dto/engagements.dto';
export declare class EngagementsController {
    private readonly service;
    constructor(service: EngagementsService);
    initialize(contractId: string): Promise<{
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
    getForStartup(user: any): Promise<({
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
    getForOperator(user: any): Promise<({
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
    getOne(id: string): Promise<{
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
    getWorkspace(id: string): Promise<{
        milestones: {
            id: string;
            status: import(".prisma/client").$Enums.MilestoneStatus;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            engagementId: string;
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
            description: string;
            engagementId: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            actorId: string;
            actionType: string;
        })[];
    }>;
    updateStatus(id: string, dto: UpdateEngagementStatusDto, user: any): Promise<{
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
    createMilestone(id: string, dto: CreateMilestoneDto, user: any): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.MilestoneStatus;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        engagementId: string;
        dueDate: Date;
        title: string;
        completedAt: Date | null;
        evidenceUrl: string | null;
    }>;
    updateMilestone(milestoneId: string, dto: UpdateMilestoneDto, user: any): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.MilestoneStatus;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        engagementId: string;
        dueDate: Date;
        title: string;
        completedAt: Date | null;
        evidenceUrl: string | null;
    }>;
    addNote(id: string, dto: CreateNoteDto, user: any): Promise<{
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
}
