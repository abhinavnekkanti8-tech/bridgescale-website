import { MilestoneStatus } from '@prisma/client';
export declare class UpdateEngagementStatusDto {
    status: 'NOT_STARTED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'TERMINATED';
}
export declare class CreateMilestoneDto {
    title: string;
    description: string;
    dueDate: string;
}
export declare class UpdateMilestoneDto {
    status?: MilestoneStatus;
    evidenceUrl?: string;
}
export declare class CreateNoteDto {
    content: string;
}
