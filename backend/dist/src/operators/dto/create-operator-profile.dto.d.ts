export declare enum OperatorLane {
    PIPELINE_SPRINT = "PIPELINE_SPRINT",
    BD_SPRINT = "BD_SPRINT",
    FRACTIONAL_RETAINER = "FRACTIONAL_RETAINER"
}
export declare enum TargetMarket {
    EU = "EU",
    US = "US",
    AU = "AU",
    REST_OF_WORLD = "REST_OF_WORLD"
}
export declare class CreateOperatorProfileDto {
    lanes: OperatorLane[];
    regions: TargetMarket[];
    functions: string[];
    experienceTags?: string[];
    yearsExperience?: number;
    linkedIn?: string;
    references?: Record<string, unknown>;
    availability?: string;
    bio?: string;
}
