import { NudgeType, EscalationStatus } from '@prisma/client';
export declare class UpdateHealthScoreDto {
    scoreTotal: number;
    aiCommentary: string;
    suggestedAction: string;
}
export declare class CreateNudgeDto {
    nudgeType: NudgeType;
    targetUserId: string;
    message: string;
}
export declare class CreateEscalationDto {
    engagementId: string;
    reason: string;
}
export declare class UpdateEscalationDto {
    status: EscalationStatus;
    resolutionNotes?: string;
}
