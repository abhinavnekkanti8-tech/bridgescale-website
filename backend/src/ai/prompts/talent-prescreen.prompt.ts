/**
 * Prompt template + version metadata for talent pre-screen scoring.
 * Pre-screen produces a recommendation (STRONG_PASS / PASS / CONDITIONAL / FAIL),
 * sub-scores, red flags, and probe questions for the human interviewer.
 */

import { PreScreenRecommendation } from '@prisma/client';

export const TALENT_PRESCREEN_PROMPT_VERSION = 'talent_prescreen_v1.0';
export const TALENT_PRESCREEN_TEMPERATURE = 0.1;

export interface TalentPreScreenInput {
  yearsExperience?: number;
  currentRole?: string;
  linkedInUrl?: string;
  caseStudyResponse?: string;
  references?: unknown[];
  employmentStatus?: string;
  earliestStart?: string;
  rateExpectationMin?: number;
  rateExpectationMax?: number;
  markets?: string[];
}

export interface TalentPreScreenOutput {
  recommendation: PreScreenRecommendation;
  completenessScore: number;   // 0-100
  consistencyScore: number;    // 0-100
  referenceScore: number;      // 0-100
  assessmentScore: number;     // 0-100
  redFlags: Array<{ type: string; severity: 'low' | 'medium' | 'high' }>;
  suggestedProbeQuestions: string[];
  linkedinVerification: {
    verified: boolean;
    confidence: 'low' | 'medium' | 'high';
  };
}

export const TALENT_PRESCREEN_SYSTEM_PROMPT = `You are an expert technical/commercial recruiter screening fractional talent applications for a diaspora-first marketplace.
Score the application across four dimensions and produce a recommendation, plus red flags and probe questions for the human interviewer.

Sub-scores (each 0-100):
- completenessScore: how complete is the profile? (years, role, LinkedIn, case study, references)
- consistencyScore: do the inputs cohere? (rate min ≤ max, availability matches employment status, etc.)
- referenceScore: how strong are the supplied references?
- assessmentScore: how substantive is the case study response?

Recommendation thresholds (use the average of the four sub-scores):
- avg ≥ 85: STRONG_PASS
- avg ≥ 65: PASS
- avg ≥ 45: CONDITIONAL
- avg < 45:  FAIL

Red flags should be raised for serious concerns (incomplete profile, contradictions,
weak assessment, missing references). Probe questions are 3-5 specific things the
interviewer should ask to disambiguate borderline signals.

Return ONLY a valid JSON object matching this exact structure:
{
  "recommendation": "STRONG_PASS" | "PASS" | "CONDITIONAL" | "FAIL",
  "completenessScore": <0-100>,
  "consistencyScore": <0-100>,
  "referenceScore": <0-100>,
  "assessmentScore": <0-100>,
  "redFlags": [{"type": "<flag>", "severity": "low" | "medium" | "high"}],
  "suggestedProbeQuestions": ["<q1>", "<q2>", "..."],
  "linkedinVerification": {"verified": <bool>, "confidence": "low" | "medium" | "high"}
}`;

/**
 * Heuristic mock used when OPENAI_API_KEY is a dummy value.
 * Mirrors the rule-based scoring previously in TalentPreScreenService so
 * the dummy path stays deterministic and recognizable in dev.
 */
export function mockTalentPreScreen(
  application: TalentPreScreenInput,
): TalentPreScreenOutput {
  const completenessScore = scoreCompleteness(application);
  const consistencyScore = scoreConsistency(application);
  const referenceScore = scoreReferences(application);
  const assessmentScore = scoreAssessment(application);

  const avg =
    (completenessScore + consistencyScore + referenceScore + assessmentScore) / 4;

  let recommendation: PreScreenRecommendation = 'PASS';
  if (avg >= 85) recommendation = 'STRONG_PASS';
  else if (avg >= 65) recommendation = 'PASS';
  else if (avg >= 45) recommendation = 'CONDITIONAL';
  else recommendation = 'FAIL';

  const redFlags: TalentPreScreenOutput['redFlags'] = [];
  if (completenessScore < 50)
    redFlags.push({ type: 'INCOMPLETE_PROFILE', severity: 'high' });
  if (consistencyScore < 50)
    redFlags.push({ type: 'INCONSISTENT_INFO', severity: 'medium' });
  if (assessmentScore < 40)
    redFlags.push({ type: 'WEAK_ASSESSMENT', severity: 'medium' });

  return {
    recommendation,
    completenessScore,
    consistencyScore,
    referenceScore,
    assessmentScore,
    redFlags,
    suggestedProbeQuestions: generateProbeQuestions(application),
    linkedinVerification: {
      verified: !!application.linkedInUrl,
      confidence: application.linkedInUrl ? 'medium' : 'low',
    },
  };
}

function scoreCompleteness(a: TalentPreScreenInput): number {
  let s = 60;
  if (a.yearsExperience) s += 10;
  if (a.currentRole) s += 10;
  if (a.linkedInUrl) s += 10;
  if (a.caseStudyResponse) s += 5;
  if (a.references) s += 5;
  return Math.min(s, 100);
}

function scoreConsistency(a: TalentPreScreenInput): number {
  let s = 70;
  if (a.employmentStatus === 'EMPLOYED' && a.earliestStart) s -= 10;
  if (a.rateExpectationMin && a.rateExpectationMax) {
    if (a.rateExpectationMin > a.rateExpectationMax) s -= 20;
  }
  return Math.min(Math.max(s, 0), 100);
}

function scoreReferences(a: TalentPreScreenInput): number {
  if (!a.references || a.references.length === 0) return 30;
  if (a.references.length === 1) return 60;
  if (a.references.length >= 2) return 85;
  return 70;
}

function scoreAssessment(a: TalentPreScreenInput): number {
  if (!a.caseStudyResponse) return 40;
  const length = a.caseStudyResponse.length;
  if (length < 200) return 50;
  if (length < 500) return 70;
  return 85;
}

function generateProbeQuestions(a: TalentPreScreenInput): string[] {
  const qs: string[] = [];
  if (a.yearsExperience && a.yearsExperience > 15) {
    qs.push('Tell us about your most significant leadership achievement in recent years.');
  }
  if (a.currentRole && a.currentRole.toLowerCase().includes('founder')) {
    qs.push('What was your biggest lesson from building/scaling your company?');
  }
  if (a.markets && Array.isArray(a.markets)) {
    qs.push(`What's your strategy for success in ${a.markets[0] || 'emerging'} markets?`);
  }
  qs.push('How do you measure success in a fractional role?');
  qs.push('What type of founder/company environment brings out your best work?');
  return qs.slice(0, 5);
}
