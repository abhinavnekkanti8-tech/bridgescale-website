import {
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  IsUrl,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

// ── Package type DTO (mirrors PackageType enum) ──────────────────────────────

enum PackageTypeDto {
  PIPELINE_SPRINT   = 'PIPELINE_SPRINT',
  BD_SPRINT         = 'BD_SPRINT',
  FRACTIONAL_RETAINER = 'FRACTIONAL_RETAINER',
  HYBRID_EQUITY     = 'HYBRID_EQUITY',
}

export enum EquityTypeDto {
  FAST   = 'FAST',
  DIRECT = 'DIRECT',
}

// ── Standard SOW ─────────────────────────────────────────────────────────────

export class GenerateSowDto {
  @IsString()
  shortlistId: string;

  @IsString()
  startupProfileId: string;

  @IsString()
  operatorId: string;

  @IsEnum(PackageTypeDto)
  packageType: PackageTypeDto;
}

export class EditSowDto {
  @IsString() @IsOptional() @MaxLength(500) title?: string;
  @IsString() @IsOptional() @MaxLength(5000) scope?: string;
  @IsString() @IsOptional() @MaxLength(5000) deliverables?: string;
  @IsString() @IsOptional() @MaxLength(2000) timeline?: string;
  @IsInt() @Min(1) @IsOptional() weeklyHours?: number;
  @IsInt() @Min(100) @IsOptional() totalPriceUsd?: number;
  @IsString() @IsOptional() changeNote?: string;
}

export class SignContractDto {
  @IsString()
  signatureId: string;

  @IsString() @IsOptional()
  idempotencyKey?: string;
}

// ── Equity SOW ───────────────────────────────────────────────────────────────

/**
 * DTO for generating a HYBRID_EQUITY SOW.
 * packageType is always HYBRID_EQUITY — caller must declare equity terms.
 *
 * Either equityPct (for DIRECT) or fastValueUsd (for FAST) must be provided
 * depending on equityType. Validation of that cross-field constraint lives in
 * the service.
 */
export class GenerateEquitySowDto {
  @IsString()
  shortlistId: string;

  @IsString()
  startupProfileId: string;

  @IsString()
  operatorId: string;

  /** Monthly cash retainer floor in USD cents (e.g. 300000 = $3,000/mo) */
  @IsInt()
  @Min(0)
  equityCashComponentUsd: number;

  @IsEnum(EquityTypeDto)
  equityType: EquityTypeDto;

  /** For DIRECT: % of company equity (e.g. 1.5 = 1.5%) */
  @IsNumber() @Min(0) @Max(100) @IsOptional()
  equityPct?: number;

  /** For FAST: notional value in USD cents (e.g. 5000000 = $50,000) */
  @IsInt() @Min(0) @IsOptional()
  fastValueUsd?: number;

  /**
   * Human-readable vesting schedule string.
   * e.g. "6-month cliff, then monthly over 30 months"
   */
  @IsString()
  @MaxLength(500)
  vestingSchedule: string;

  /** Cliff before any equity vests, in months. Defaults to 6. */
  @IsInt() @Min(0) @IsOptional()
  equityCliffMonths?: number;

  /** Total vesting duration in months. Defaults to 36. */
  @IsInt() @Min(1) @IsOptional()
  equityVestingMonths?: number;

  /**
   * KPI-linked supplementary equity milestones.
   * Array of { metric: string, target: string, bonusDescription: string }
   */
  @IsArray() @IsOptional()
  equityKpiMilestones?: object[];

  /** Weekly hours committed. */
  @IsInt() @Min(1)
  weeklyHours: number;

  /** Six-month total cash value for contract record (cash only, not equity notional). */
  @IsInt() @Min(0)
  totalCashUsd: number;
}

// ── Equity lifecycle DTOs ─────────────────────────────────────────────────────

/**
 * Record a vesting checkpoint.
 * vestedPct is the NEW cumulative vested percentage (not a delta).
 * e.g. if 16.67% was already vested and another month lapses, send 33.34.
 */
export class RecordVestingDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  vestedPct: number;

  @IsString() @IsOptional()
  notes?: string;
}

/** Admin sets the external equity document URL after FAST/side-letter is executed. */
export class SetEquityDocRefDto {
  @IsUrl()
  documentRef: string;
}

/** Used for lapse and accelerate operations that require a reason. */
export class EquityEventDto {
  @IsString()
  @MaxLength(1000)
  notes: string;
}
