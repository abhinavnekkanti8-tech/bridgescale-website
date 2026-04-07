import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  NEED_DIAGNOSIS_SYSTEM_PROMPT,
  NEED_DIAGNOSIS_PROMPT_VERSION,
  NEED_DIAGNOSIS_TEMPERATURE,
  NeedDiagnosisOutput,
  mockNeedDiagnosis,
} from './prompts/need-diagnosis.prompt';

// ── Scoring output schema ────────────────────────────────────────────────────
export interface ScoreBreakdown {
  icpClarity: number;           // max 15
  collateralReadiness: number;  // max 15
  executionCapacity: number;    // max 20
  budgetReadiness: number;      // max 20
  salesMotionFit: number;       // max 10
  toolingReadiness: number;     // max 10
  responsivenessCommitment: number; // max 10
}

export interface ReadinessScoreOutput {
  componentScores: ScoreBreakdown;
  totalScore: number;
  blockers: string[];
  recommendation: string;
  eligibility: 'INELIGIBLE' | 'SPRINT_ONLY' | 'SPRINT_AND_RETAINER';
}

// ── Prompt versioning ────────────────────────────────────────────────────────
export const READINESS_PROMPT_VERSION = 'demand_readiness_v1.0';
const TEMPERATURE = 0.1;

const SYSTEM_PROMPT = `You are an expert B2B sales readiness evaluator for a diaspora-first marketplace.
Evaluate the startup profile and score each component strictly based on the provided data.

Scoring components and maximum points:
1. ICP Clarity (max 15): How clear and specific is the target customer segment?
2. Collateral Readiness (max 15): Do they have a product demo or deck ready for sales?
3. Execution Capacity (max 20): Is there a named internal owner with bandwidth for weekly follow-up?
4. Budget Readiness (max 20): Is the budget band sufficient and committed for a paid sprint?
5. Sales Motion Fit (max 10): Does the stated sales motion align with target markets?
6. Tooling Readiness (max 10): Is the startup tooling-ready (CRM/tracker)?
7. Responsiveness Commitment (max 10): Have they committed to responsive governance?

Eligibility rules:
- Total < 60: INELIGIBLE (requires preparation)
- Total 60–74: SPRINT_ONLY (eligible for Sprint packages with strict governance)
- Total >= 75: SPRINT_AND_RETAINER (eligible for all packages)

Respond ONLY with a valid JSON object matching this exact structure:
{
  "componentScores": {
    "icpClarity": <number 0-15>,
    "collateralReadiness": <number 0-15>,
    "executionCapacity": <number 0-20>,
    "budgetReadiness": <number 0-20>,
    "salesMotionFit": <number 0-10>,
    "toolingReadiness": <number 0-10>,
    "responsivenessCommitment": <number 0-10>
  },
  "totalScore": <sum of all component scores>,
  "blockers": ["<specific action required>", ...],
  "recommendation": "<1-2 sentence actionable recommendation>",
  "eligibility": "INELIGIBLE" | "SPRINT_ONLY" | "SPRINT_AND_RETAINER"
}`;

// ── Mock response for dummy API key ─────────────────────────────────────────
function buildMockResponse(profile: Record<string, unknown>): ReadinessScoreOutput {
  const hasDeck = profile.hasDeck as boolean;
  const hasDemo = profile.hasProductDemo as boolean;
  const hasOwner = Boolean(profile.executionOwner);
  const tooling = profile.toolingReady as boolean;
  const responsive = profile.responsivenessCommit as boolean;
  const budget = profile.budgetBand as string;

  const icpClarity = 10;
  const collateral = (hasDeck ? 8 : 0) + (hasDemo ? 7 : 0);
  const execution = hasOwner ? 18 : 8;
  const budgetScore = budget === 'ABOVE_10K' ? 20 : budget === 'FIVE_TO_10K' ? 16 : budget === 'TWO_TO_5K' ? 10 : 5;
  const salesFit = 8;
  const toolingScore = tooling ? 9 : 4;
  const responsivenessScore = responsive ? 9 : 5;

  const totalScore = icpClarity + collateral + execution + budgetScore + salesFit + toolingScore + responsivenessScore;
  const blockers: string[] = [];
  if (!hasDeck && !hasDemo) blockers.push('No product demo or deck provided — prepare sales collateral before sprint.');
  if (!hasOwner) blockers.push('No named execution owner — assign an internal person to manage weekly follow-up.');
  if (!tooling) blockers.push('Tooling not ready — set up a basic CRM or tracker before sprint kickoff.');

  const eligibility =
    totalScore >= 75 ? 'SPRINT_AND_RETAINER' :
    totalScore >= 60 ? 'SPRINT_ONLY' : 'INELIGIBLE';

  return {
    componentScores: {
      icpClarity,
      collateralReadiness: collateral,
      executionCapacity: execution,
      budgetReadiness: budgetScore,
      salesMotionFit: salesFit,
      toolingReadiness: toolingScore,
      responsivenessCommitment: responsivenessScore,
    },
    totalScore,
    blockers,
    recommendation: `Score: ${totalScore}/100. ${eligibility === 'INELIGIBLE' ? 'Resolve blockers before applying for a sprint.' : 'Ready for a structured sprint engagement.'}`,
    eligibility,
  };
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly openai: OpenAI;
  private readonly model: string;
  private readonly isDummy: boolean;

  constructor(private readonly config: ConfigService) {
    const apiKey = config.get<string>('OPENAI_API_KEY', 'sk-dummy');
    this.model = config.get<string>('OPENAI_MODEL', 'gpt-4o');
    this.isDummy = apiKey.startsWith('sk-dummy');
    this.openai = new OpenAI({ apiKey });

    if (this.isDummy) {
      this.logger.warn('⚠️  Using DUMMY OpenAI key — AI responses will be simulated.');
    }
  }

  /**
   * Score a startup profile for demand readiness.
   * Returns a fully typed ReadinessScoreOutput.
   */
  async scoreStartupReadiness(profile: Record<string, unknown>): Promise<ReadinessScoreOutput> {
    // Use mock response if API key is dummy
    if (this.isDummy) {
      this.logger.debug('Returning mock readiness score (dummy key).');
      return buildMockResponse(profile);
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        temperature: TEMPERATURE,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: JSON.stringify(profile) },
        ],
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('Empty response from OpenAI');

      const parsed = JSON.parse(content) as ReadinessScoreOutput;
      this.validateScoreOutput(parsed);
      return parsed;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`OpenAI scoring failed: ${msg}`);
      throw new InternalServerErrorException('AI scoring failed. Please try again.');
    }
  }

  private validateScoreOutput(output: ReadinessScoreOutput): void {
    const required = ['componentScores', 'totalScore', 'blockers', 'recommendation', 'eligibility'];
    for (const key of required) {
      if (!(key in output)) throw new Error(`Missing key in AI output: ${key}`);
    }
    if (!['INELIGIBLE', 'SPRINT_ONLY', 'SPRINT_AND_RETAINER'].includes(output.eligibility)) {
      throw new Error(`Invalid eligibility value: ${output.eligibility}`);
    }
  }

  /**
   * Generate a needs diagnosis for a company application.
   * Returns structured analysis of their commercial gap and fractional talent requirements.
   */
  async generateNeedsDiagnosis(
    applicationData: Record<string, unknown>,
  ): Promise<NeedDiagnosisOutput> {
    if (this.isDummy) {
      this.logger.debug('Returning mock needs diagnosis (dummy key).');
      return mockNeedDiagnosis(applicationData);
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        temperature: NEED_DIAGNOSIS_TEMPERATURE,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: NEED_DIAGNOSIS_SYSTEM_PROMPT },
          { role: 'user', content: JSON.stringify(applicationData) },
        ],
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('Empty response from OpenAI');

      const parsed = JSON.parse(content) as NeedDiagnosisOutput;
      return parsed;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`OpenAI diagnosis failed: ${msg}`);
      throw new InternalServerErrorException('Diagnosis generation failed. Please try again.');
    }
  }

  getPromptVersion() { return READINESS_PROMPT_VERSION; }
  getNeedDiagnosisPromptVersion() { return NEED_DIAGNOSIS_PROMPT_VERSION; }
  getModelName() { return this.model; }
  getTemperature() { return TEMPERATURE; }
}
