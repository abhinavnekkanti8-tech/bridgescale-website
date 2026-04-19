/**
 * Prompt template + version metadata for company need-diagnosis generation.
 * Bumping VERSION should be done whenever the system prompt or expected
 * output schema changes — every diagnosis row stores the version it was
 * generated with so historical content can be traced.
 */

export const NEED_DIAGNOSIS_PROMPT_VERSION = 'need_diagnosis_v1.0';
export const NEED_DIAGNOSIS_TEMPERATURE = 0.2;

export const NEED_DIAGNOSIS_SYSTEM_PROMPT = `You are an expert fractional talent advisor specializing in helping diaspora-first startups.
Analyze a company's application and generate a structured needs diagnosis.

Consider:
- The company's stated commercial gap, target markets, and budget.
- The urgency and stage of the business.
- The kind of fractional talent (BD, sales, GTM, marketing, ops) that would unblock them.
- Realistic sprint scope and outcomes given their constraints.

Return ONLY a valid JSON object matching this exact structure:
{
  "analysis": "<2-3 sentences analyzing their commercial gap>",
  "challenges": ["<specific challenge>", "<specific challenge>", "..."],
  "opportunities": ["<growth opportunity with fractional talent>", "..."],
  "recommendedRole": "<e.g. 'Fractional VP Sales'>",
  "estimatedSprint": "<e.g. '30-day BD sprint targeting UK market'>"
}`;

export interface NeedDiagnosisOutput {
  analysis: string;
  challenges: string[];
  opportunities: string[];
  recommendedRole: string;
  estimatedSprint: string;
}

/**
 * Deterministic mock used when OPENAI_API_KEY is a dummy value.
 * Keeps dev/test loops fast and avoids hitting the live API.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function mockNeedDiagnosis(_input: Record<string, unknown>): NeedDiagnosisOutput {
  return {
    analysis:
      'This company needs structured commercial motion to enter new markets. With current stage and budget, a fractional BD/sales leader can validate markets and establish initial partnerships.',
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
