import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsUrl,
  IsArray,
  ValidateNested,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ApplicationTypeDto {
  COMPANY = 'COMPANY',
  TALENT = 'TALENT',
}

// ── Structured reference for talent vetting ──
export class ReferenceDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  company?: string;

  @IsString()
  @MaxLength(100)
  relationship: string; // e.g. "CEO / Founder", "Direct Manager", "Direct Report"

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;
}

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

  // ── Company-specific ──
  @IsOptional()
  @IsString()
  @MaxLength(200)
  companyName?: string;

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

  // ── Talent-specific ──
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
  seniority?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  engagementPref?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  markets?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Please provide a valid LinkedIn URL.' })
  linkedInUrl?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReferenceDto)
  references?: ReferenceDto[];
}
