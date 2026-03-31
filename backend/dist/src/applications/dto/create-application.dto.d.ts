export declare enum ApplicationTypeDto {
    COMPANY = "COMPANY",
    TALENT = "TALENT"
}
export declare class ReferenceDto {
    name: string;
    company?: string;
    relationship: string;
    email: string;
    phone?: string;
}
export declare class CreateApplicationDto {
    type: ApplicationTypeDto;
    name: string;
    email: string;
    notes?: string;
    companyName?: string;
    companyStage?: string;
    needArea?: string;
    targetMarkets?: string;
    engagementModel?: string;
    budgetRange?: string;
    urgency?: string;
    location?: string;
    talentCategory?: string;
    seniority?: string;
    engagementPref?: string;
    markets?: string;
    linkedInUrl?: string;
    references?: ReferenceDto[];
}
