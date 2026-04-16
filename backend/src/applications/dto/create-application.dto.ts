import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsUrl,
  IsArray,
  IsBoolean,
  IsInt,
  IsDateString,
  ValidateNested,
  MaxLength,
  MinLength,
  Min,
  Max,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ApplicationTypeDto {
  COMPANY = 'COMPANY',
  TALENT = 'TALENT',
}

// ── Structured reference for talent vetting ──────────────────────
export class ReferenceDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  company?: string;

  @IsString()
  @MaxLength(100)
  relationship: string; // e.g. "CEO / Founder", "Direct Manager", "Peer VP"

  @IsEmail()
  email: string;

  @IsOptional()
  @IsUrl({}, { message: 'Please provide a valid LinkedIn URL for this reference.' })
  linkedIn?: string;
}

// ── Structured deal history for talent ───────────────────────────
export class DealHistoryItemDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  company?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  dealSizeRange?: string; // e.g. "$50k–$200k", ">$1M"

  @IsOptional()
  @IsString()
  @MaxLength(100)
  geography?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  outcome?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  role?: string;
}

// ── Market confidence item ────────────────────────────────────────
export class ConfidenceMarketDto {
  @IsString()
  @MaxLength(100)
  market: string;

  @IsEnum(['STRONG', 'MODERATE', 'LIGHT'])
  confidence: string;
}

// ── Main DTO ─────────────────────────────────────────────────────
export class CreateApplicationDto {
  @IsEnum(ApplicationTypeDto, { message: 'Type must be COMPANY or TALENT.' })
  type: ApplicationTypeDto;

  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters.' })
  @MaxLength(100)
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email address.' })
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  // ── Company — mandatory ───────────────────────────────────────

  @IsOptional()
  @IsString()
  @MaxLength(200)
  companyName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  companyWebsite?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  companyStage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  needArea?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  targetMarkets?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  engagementModel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  budgetRange?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  urgency?: string;

  // ── Company — optional (improve AI diagnosis quality) ─────────

  @IsOptional()
  @IsString()
  @MaxLength(100)
  salesMotion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  teamStructure?: string;

  @IsOptional()
  @IsBoolean()
  hasDeck?: boolean;

  @IsOptional()
  @IsBoolean()
  hasDemo?: boolean;

  @IsOptional()
  @IsBoolean()
  hasCrm?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  previousAttempts?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  idealOutcome90d?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  specificTargets?: string;

  // ── Talent — profile ─────────────────────────────────────────

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  talentCategory?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  currentRole?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  currentEmployer?: string;

  @IsOptional()
  @IsEnum(['EMPLOYED_FULL_TIME', 'FREELANCE', 'BETWEEN_ROLES', 'OTHER'])
  employmentStatus?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(60)
  yearsExperience?: number;

  @IsOptional()
  @IsEnum(['IC', 'MANAGER', 'DIRECTOR', 'VP', 'C_SUITE'])
  seniorityLevel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  seniority?: string; // legacy free-text, kept for backwards compat

  // ── Talent — track record ────────────────────────────────────

  @IsOptional()
  @IsString()
  @MaxLength(200)
  engagementPref?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  markets?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMaxSize(5)
  @Type(() => DealHistoryItemDto)
  dealHistory?: DealHistoryItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConfidenceMarketDto)
  confidenceMarkets?: ConfidenceMarketDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languagesSpoken?: string[];

  // ── Talent — references ──────────────────────────────────────

  @IsOptional()
  @IsUrl({}, { message: 'Please provide a valid LinkedIn URL.' })
  linkedInUrl?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(2, { message: 'Please provide at least 2 references.' })
  @ArrayMaxSize(5)
  @Type(() => ReferenceDto)
  references?: ReferenceDto[];

  // ── Talent — assessment & commercials ───────────────────────

  @IsOptional()
  @IsString()
  @MinLength(100, { message: 'Case study response must be at least 100 characters.' })
  @MaxLength(3000)
  caseStudyResponse?: string;

  @IsOptional()
  @IsEnum(['H5_10', 'H10_20', 'H20_30', 'FULL_FRACTIONAL'])
  availabilityHours?: string;

  @IsOptional()
  @IsDateString()
  earliestStart?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  rateExpectationMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  rateExpectationMax?: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  rateCurrency?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredStructures?: string[];

  // ── Free signup flow control ────────────────────────────────────

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters.' })
  @MaxLength(100)
  password?: string;

  @IsOptional()
  @IsBoolean()
  assessmentSkipped?: boolean;

  @IsOptional()
  @IsBoolean()
  referencesSkipped?: boolean;
}
