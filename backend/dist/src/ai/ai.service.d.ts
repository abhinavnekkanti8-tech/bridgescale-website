import { ConfigService } from '@nestjs/config';
export interface ScoreBreakdown {
    icpClarity: number;
    collateralReadiness: number;
    executionCapacity: number;
    budgetReadiness: number;
    salesMotionFit: number;
    toolingReadiness: number;
    responsivenessCommitment: number;
}
export interface ReadinessScoreOutput {
    componentScores: ScoreBreakdown;
    totalScore: number;
    blockers: string[];
    recommendation: string;
    eligibility: 'INELIGIBLE' | 'SPRINT_ONLY' | 'SPRINT_AND_RETAINER';
}
export declare const READINESS_PROMPT_VERSION = "demand_readiness_v1.0";
export declare class AiService {
    private readonly config;
    private readonly logger;
    private readonly openai;
    private readonly model;
    private readonly isDummy;
    constructor(config: ConfigService);
    scoreStartupReadiness(profile: Record<string, unknown>): Promise<ReadinessScoreOutput>;
    private validateScoreOutput;
    getPromptVersion(): string;
    getModelName(): string;
    getTemperature(): number;
}
