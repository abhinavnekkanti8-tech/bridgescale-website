"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = exports.READINESS_PROMPT_VERSION = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const openai_1 = require("openai");
exports.READINESS_PROMPT_VERSION = 'demand_readiness_v1.0';
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
function buildMockResponse(profile) {
    const hasDeck = profile.hasDeck;
    const hasDemo = profile.hasProductDemo;
    const hasOwner = Boolean(profile.executionOwner);
    const tooling = profile.toolingReady;
    const responsive = profile.responsivenessCommit;
    const budget = profile.budgetBand;
    const icpClarity = 10;
    const collateral = (hasDeck ? 8 : 0) + (hasDemo ? 7 : 0);
    const execution = hasOwner ? 18 : 8;
    const budgetScore = budget === 'ABOVE_10K' ? 20 : budget === 'FIVE_TO_10K' ? 16 : budget === 'TWO_TO_5K' ? 10 : 5;
    const salesFit = 8;
    const toolingScore = tooling ? 9 : 4;
    const responsivenessScore = responsive ? 9 : 5;
    const totalScore = icpClarity + collateral + execution + budgetScore + salesFit + toolingScore + responsivenessScore;
    const blockers = [];
    if (!hasDeck && !hasDemo)
        blockers.push('No product demo or deck provided — prepare sales collateral before sprint.');
    if (!hasOwner)
        blockers.push('No named execution owner — assign an internal person to manage weekly follow-up.');
    if (!tooling)
        blockers.push('Tooling not ready — set up a basic CRM or tracker before sprint kickoff.');
    const eligibility = totalScore >= 75 ? 'SPRINT_AND_RETAINER' :
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
let AiService = AiService_1 = class AiService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(AiService_1.name);
        const apiKey = config.get('OPENAI_API_KEY', 'sk-dummy');
        this.model = config.get('OPENAI_MODEL', 'gpt-4o');
        this.isDummy = apiKey.startsWith('sk-dummy');
        this.openai = new openai_1.default({ apiKey });
        if (this.isDummy) {
            this.logger.warn('⚠️  Using DUMMY OpenAI key — AI responses will be simulated.');
        }
    }
    async scoreStartupReadiness(profile) {
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
            if (!content)
                throw new Error('Empty response from OpenAI');
            const parsed = JSON.parse(content);
            this.validateScoreOutput(parsed);
            return parsed;
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this.logger.error(`OpenAI scoring failed: ${msg}`);
            throw new common_1.InternalServerErrorException('AI scoring failed. Please try again.');
        }
    }
    validateScoreOutput(output) {
        const required = ['componentScores', 'totalScore', 'blockers', 'recommendation', 'eligibility'];
        for (const key of required) {
            if (!(key in output))
                throw new Error(`Missing key in AI output: ${key}`);
        }
        if (!['INELIGIBLE', 'SPRINT_ONLY', 'SPRINT_AND_RETAINER'].includes(output.eligibility)) {
            throw new Error(`Invalid eligibility value: ${output.eligibility}`);
        }
    }
    async generateNeedsDiagnosis(applicationData) {
        const diagnosisPrompt = `You are an expert fractional talent advisor specializing in helping diaspora-first startups.
Analyze this company's application and generate a needs diagnosis.

Return a JSON object with:
{
  "analysis": "<2-3 sentences analyzing their commercial gap>",
  "challenges": ["<specific challenge>", ...],
  "opportunities": ["<growth opportunity with fractional talent>", ...],
  "recommendedRole": "<e.g. 'Fractional VP Sales'>",
  "estimatedSprint": "<e.g. '30-day BD sprint targeting UK market'>"
}`;
        if (this.isDummy) {
            this.logger.debug('Returning mock needs diagnosis (dummy key).');
            return {
                analysis: 'This company needs structured commercial motion to enter new markets. With current stage and budget, a fractional BD/sales leader can validate markets and establish initial partnerships.',
                challenges: [
                    'No dedicated commercial owner for international expansion',
                    'Limited market validation in target geographies',
                    'Undefined sales motion for B2B segment',
                ],
                opportunities: [
                    'Market entry into EU with fractional BD',
                    'Sales collateral and pitch refinement',
                    'Channel partnership strategy',
                ],
                recommendedRole: 'Fractional VP Sales / Head of Growth',
                estimatedSprint: '30-day market entry sprint',
            };
        }
        try {
            const response = await this.openai.chat.completions.create({
                model: this.model,
                temperature: 0.2,
                response_format: { type: 'json_object' },
                messages: [
                    { role: 'system', content: diagnosisPrompt },
                    { role: 'user', content: JSON.stringify(applicationData) },
                ],
            });
            const content = response.choices[0]?.message?.content;
            if (!content)
                throw new Error('Empty response from OpenAI');
            const parsed = JSON.parse(content);
            return parsed;
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this.logger.error(`OpenAI diagnosis failed: ${msg}`);
            throw new common_1.InternalServerErrorException('Diagnosis generation failed. Please try again.');
        }
    }
    getPromptVersion() { return exports.READINESS_PROMPT_VERSION; }
    getModelName() { return this.model; }
    getTemperature() { return TEMPERATURE; }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AiService);
//# sourceMappingURL=ai.service.js.map