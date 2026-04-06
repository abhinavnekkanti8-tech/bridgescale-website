export declare enum ApplicationTypeDto {
    COMPANY = "COMPANY",
    TALENT = "TALENT"
}
export declare class ReferenceDto {
    name: string;
    title: string;
    company?: string;
    relationship: string;
    email: string;
    linkedIn?: string;
}
export declare class DealHistoryItemDto {
    company?: string;
    dealSizeRange?: string;
    geography?: string;
    outcome?: string;
    role?: string;
}
export declare class ConfidenceMarketDto {
    market: string;
    confidence: string;
}
export declare class CreateApplicationDto {
    type: ApplicationTypeDto;
    name: string;
    email: string;
    notes?: string;
    companyName?: string;
    companyWebsite?: string;
    companyStage?: string;
    needArea?: string;
    targetMarkets?: string;
    engagementModel?: string;
    budgetRange?: string;
    urgency?: string;
    salesMotion?: string;
    teamStructure?: string;
    hasDeck?: boolean;
    hasDemo?: boolean;
    hasCrm?: boolean;
    previousAttempts?: string;
    idealOutcome90d?: string;
    specificTargets?: string;
    location?: string;
    talentCategory?: string;
    currentRole?: string;
    currentEmployer?: string;
    employmentStatus?: string;
    yearsExperience?: number;
    seniorityLevel?: string;
    seniority?: string;
    engagementPref?: string;
    markets?: string;
    dealHistory?: DealHistoryItemDto[];
    confidenceMarkets?: ConfidenceMarketDto[];
    languagesSpoken?: string[];
    linkedInUrl?: string;
    references?: ReferenceDto[];
    caseStudyResponse?: string;
    availabilityHours?: string;
    earliestStart?: string;
    rateExpectationMin?: number;
    rateExpectationMax?: number;
    rateCurrency?: string;
    preferredStructures?: string[];
}
