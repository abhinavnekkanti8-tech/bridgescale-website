/**
 * Prompt template + version metadata for opportunity brief generation.
 * The brief is generated from a company application + approved diagnosis,
 * and produces both an internal admin-facing structure and a downstream
 * client-facing summary.
 */

export const OPPORTUNITY_BRIEF_PROMPT_VERSION = 'opportunity_brief_v1.0';
export const OPPORTUNITY_BRIEF_TEMPERATURE = 0.3;

export interface OpportunityBriefInput {
  companyName?: string;
  needArea?: string;
  targetMarkets?: string[] | string;
  budgetRange?: string;
  urgency?: string;
  diagnosis?: {
    analysis?: string;
    recommendedRole?: string;
    estimatedSprint?: string;
    challenges?: string[];
    opportunities?: string[];
  } | Record<string, unknown>;
}

export interface OpportunityBriefOutput {
  summary: string;
  keyResponsibilities: string[];
  successMetrics: string[];
  timeline: string;
  talentProfile: string;
  riskFactors: string[];
  growthPotential: string;
}

export function buildOpportunityBriefSystemPrompt(): string {
  return `You are an expert in fractional hiring and talent matching for diaspora-first startups.
You generate detailed internal opportunity briefs from a company application and an approved
needs diagnosis. Your output is used by platform admins to scope engagements and by talent
matching to find the right fractional operator.

Be specific, concrete, and grounded in the inputs provided. Avoid generic filler.

Return ONLY a valid JSON object matching this exact structure:
{
  "summary": "<2-3 sentence summary of the opportunity>",
  "keyResponsibilities": ["<responsibility 1>", "..."],
  "successMetrics": ["<measurable metric 1>", "..."],
  "timeline": "<estimated timeline, e.g. '30-day sprint'>",
  "talentProfile": "<ideal talent profile description>",
  "riskFactors": ["<risk 1>", "..."],
  "growthPotential": "<description of how this could grow into a longer engagement>"
}`;
}

export function buildOpportunityBriefUserPrompt(input: OpportunityBriefInput): string {
  const targetMarkets = Array.isArray(input.targetMarkets)
    ? input.targetMarkets.join(', ')
    : input.targetMarkets || 'Not specified';

  const diagnosis = (input.diagnosis ?? {}) as Record<string, unknown>;

  return `Company: ${input.companyName || 'Unknown'}
Type of Need: ${input.needArea || 'Not specified'}
Target Markets: ${targetMarkets}
Budget Range: ${input.budgetRange || 'Not specified'}
Urgency: ${input.urgency || 'Not specified'}

Diagnosis Summary:
- Analysis: ${diagnosis.analysis || 'Not provided'}
- Recommended Role: ${diagnosis.recommendedRole || 'Not provided'}
- Estimated Sprint: ${diagnosis.estimatedSprint || 'Not provided'}`;
}

/**
 * Deterministic mock used when OPENAI_API_KEY is a dummy value.
 */
export function mockOpportunityBrief(
  input: OpportunityBriefInput,
): OpportunityBriefOutput {
  const market = Array.isArray(input.targetMarkets)
    ? input.targetMarkets[0]
    : input.targetMarkets;
  const diagnosis = (input.diagnosis ?? {}) as Record<string, unknown>;

  return {
    summary: `Building ${input.companyName || 'the company'}'s commercial capability in ${market || 'target markets'}. This fractional engagement will establish market entry strategy and initial customer pipeline.`,
    keyResponsibilities: [
      'Market research and competitive analysis',
      'Initial customer identification and outreach',
      'Sales collateral development',
      'Partnership exploration',
      'Revenue forecasting and pipeline building',
    ],
    successMetrics: [
      'Identified 10+ qualified leads in target market',
      'Established 3-5 strategic partnerships',
      'Delivered market entry playbook',
      '$X revenue pipeline created',
      'Team trained on go-to-market strategy',
    ],
    timeline: (diagnosis.estimatedSprint as string) || '30-day sprint',
    talentProfile:
      'Experienced sales/business development leader with successful market entry experience, deep network in target geography, and proven ability to identify and close early deals.',
    riskFactors: [
      'Market timing and readiness',
      'Resource availability of company team',
      'Competitive landscape changes',
    ],
    growthPotential:
      'Potential evolution into retained fractional VP Sales or head of business development role based on initial sprint results.',
  };
}
