import { CloseoutStatus } from '@prisma/client';
export declare class GenerateCloseoutDto {
    publish?: boolean;
}
export declare class UpdateCloseoutDto {
    summary?: string;
    outcomes?: string;
    nextSteps?: string;
    status?: CloseoutStatus;
}
export declare class SubmitRatingDto {
    revieweeId: string;
    score: number;
    components?: any;
    comments?: string;
}
export declare class GenerateRenewalDto {
    customContext?: string;
}
