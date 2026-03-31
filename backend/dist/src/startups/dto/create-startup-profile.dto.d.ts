export declare enum StartupStage {
    PRE_SEED = "PRE_SEED",
    SEED = "SEED",
    SERIES_A = "SERIES_A",
    SERIES_B_PLUS = "SERIES_B_PLUS",
    BOOTSTRAPPED = "BOOTSTRAPPED"
}
export declare enum SalesMotion {
    OUTBOUND = "OUTBOUND",
    INBOUND = "INBOUND",
    PARTNER_LED = "PARTNER_LED",
    PRODUCT_LED = "PRODUCT_LED",
    BLENDED = "BLENDED"
}
export declare enum BudgetBand {
    UNDER_2K = "UNDER_2K",
    TWO_TO_5K = "TWO_TO_5K",
    FIVE_TO_10K = "FIVE_TO_10K",
    ABOVE_10K = "ABOVE_10K"
}
export declare enum TargetMarket {
    EU = "EU",
    US = "US",
    AU = "AU",
    REST_OF_WORLD = "REST_OF_WORLD"
}
export declare class CreateStartupProfileDto {
    industry: string;
    stage: StartupStage;
    targetMarkets: TargetMarket[];
    salesMotion: SalesMotion;
    budgetBand: BudgetBand;
    executionOwner?: string;
    hasProductDemo?: boolean;
    hasDeck?: boolean;
    toolingReady?: boolean;
    responsivenessCommit?: boolean;
    additionalContext?: string;
}
