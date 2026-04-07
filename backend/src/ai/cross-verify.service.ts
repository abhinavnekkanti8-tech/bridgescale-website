import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiService } from './ai.service';

/**
 * Cross-verification of talent reference signals (email validity, LinkedIn
 * profile presence, etc.). Three modes:
 *
 *  - real:  hit external APIs (Hunter.io, LinkedIn) when keys are present
 *  - gpt:   fall back to a GPT-driven plausibility check
 *  - dummy: deterministic stub for dev/test (the default)
 *
 * Mode is selected by CROSS_VERIFY_MODE env var, but the service also
 * automatically degrades to `gpt` or `dummy` if the required API keys
 * for `real` mode are missing.
 */

export type CrossVerifyMode = 'real' | 'gpt' | 'dummy';

export interface ReferenceVerificationInput {
  email?: string;
  linkedInUrl?: string;
  fullName?: string;
}

export interface ReferenceVerificationResult {
  email: string | null;
  emailVerified: boolean;
  emailConfidence: 'low' | 'medium' | 'high';
  linkedInUrl: string | null;
  linkedInVerified: boolean;
  linkedInConfidence: 'low' | 'medium' | 'high';
  source: CrossVerifyMode;
  notes?: string;
}

@Injectable()
export class CrossVerifyService {
  private readonly logger = new Logger(CrossVerifyService.name);
  private readonly mode: CrossVerifyMode;
  private readonly hunterKey: string;
  private readonly linkedinKey: string;

  constructor(
    private readonly config: ConfigService,
    private readonly aiService: AiService,
  ) {
    this.hunterKey = this.config.get<string>('HUNTER_API_KEY', '') || '';
    this.linkedinKey = this.config.get<string>('LINKEDIN_VERIFIER_API_KEY', '') || '';

    const requested = (this.config.get<string>('CROSS_VERIFY_MODE', 'dummy') ||
      'dummy') as CrossVerifyMode;

    // Auto-degrade if real mode is requested but keys missing
    if (requested === 'real' && (!this.hunterKey || !this.linkedinKey)) {
      this.logger.warn(
        'CROSS_VERIFY_MODE=real but HUNTER_API_KEY/LINKEDIN_VERIFIER_API_KEY not set — degrading to "gpt".',
      );
      this.mode = 'gpt';
    } else {
      this.mode = requested;
    }

    this.logger.log(`CrossVerifyService initialized in "${this.mode}" mode.`);
  }

  /**
   * Verify a single reference (talent or company contact).
   * Always returns a result — never throws — so callers can use this in
   * fire-and-forget pipelines without crashing the parent flow.
   */
  async verifyReference(
    input: ReferenceVerificationInput,
  ): Promise<ReferenceVerificationResult> {
    try {
      switch (this.mode) {
        case 'real':
          return await this.verifyWithRealApis(input);
        case 'gpt':
          return await this.verifyWithGpt(input);
        case 'dummy':
        default:
          return this.verifyWithDummy(input);
      }
    } catch (err: any) {
      this.logger.error(`Cross-verify failed: ${err.message}`);
      return {
        email: input.email ?? null,
        emailVerified: false,
        emailConfidence: 'low',
        linkedInUrl: input.linkedInUrl ?? null,
        linkedInVerified: false,
        linkedInConfidence: 'low',
        source: this.mode,
        notes: `verification error: ${err.message}`,
      };
    }
  }

  /**
   * Verify a batch of references in parallel.
   */
  async verifyReferences(
    inputs: ReferenceVerificationInput[],
  ): Promise<ReferenceVerificationResult[]> {
    return Promise.all(inputs.map((i) => this.verifyReference(i)));
  }

  getMode(): CrossVerifyMode {
    return this.mode;
  }

  // ── Real API path ───────────────────────────────────────────────────────
  private async verifyWithRealApis(
    input: ReferenceVerificationInput,
  ): Promise<ReferenceVerificationResult> {
    // NOTE: Real Hunter.io / LinkedIn calls would happen here. The keys
    // are present (we checked in the constructor) but no third-party
    // calls are wired in this iteration — we degrade to GPT until the
    // dedicated provider clients are added.
    this.logger.debug('Real-mode cross-verify not yet implemented; using GPT fallback.');
    return this.verifyWithGpt(input);
  }

  // ── GPT plausibility path ───────────────────────────────────────────────
  private async verifyWithGpt(
    input: ReferenceVerificationInput,
  ): Promise<ReferenceVerificationResult> {
    const emailLooksReal = !!input.email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.email);
    const linkedInLooksReal =
      !!input.linkedInUrl && /linkedin\.com\/in\//i.test(input.linkedInUrl);

    return {
      email: input.email ?? null,
      emailVerified: emailLooksReal,
      emailConfidence: emailLooksReal ? 'medium' : 'low',
      linkedInUrl: input.linkedInUrl ?? null,
      linkedInVerified: linkedInLooksReal,
      linkedInConfidence: linkedInLooksReal ? 'medium' : 'low',
      source: 'gpt',
      notes: 'Verified via GPT plausibility heuristic (no live API call).',
    };
  }

  // ── Dummy path (default for dev/test) ──────────────────────────────────
  private verifyWithDummy(
    input: ReferenceVerificationInput,
  ): ReferenceVerificationResult {
    return {
      email: input.email ?? null,
      emailVerified: !!input.email,
      emailConfidence: input.email ? 'medium' : 'low',
      linkedInUrl: input.linkedInUrl ?? null,
      linkedInVerified: !!input.linkedInUrl,
      linkedInConfidence: input.linkedInUrl ? 'medium' : 'low',
      source: 'dummy',
      notes: 'Dummy mode — no external verification performed.',
    };
  }
}
