declare enum PackageTypeDto {
    PIPELINE_SPRINT = "PIPELINE_SPRINT",
    BD_SPRINT = "BD_SPRINT",
    FRACTIONAL_RETAINER = "FRACTIONAL_RETAINER"
}
export declare class GenerateSowDto {
    shortlistId: string;
    startupProfileId: string;
    operatorId: string;
    packageType: PackageTypeDto;
}
export declare class EditSowDto {
    title?: string;
    scope?: string;
    deliverables?: string;
    timeline?: string;
    weeklyHours?: number;
    totalPriceUsd?: number;
    changeNote?: string;
}
export declare class SignContractDto {
    signatureId: string;
    idempotencyKey?: string;
}
export {};
