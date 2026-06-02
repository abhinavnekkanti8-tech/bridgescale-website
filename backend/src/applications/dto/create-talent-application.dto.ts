import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ConfidenceMarketDto, DealHistoryItemDto, ReferenceDto } from './create-application.dto';

export class CreateTalentApplicationDto {
  @IsString()
  @MaxLength(2000)
  @IsOptional()
  notes?: string;

  @IsString()
  @MaxLength(200)
  location: string;

  @IsString()
  @MaxLength(200)
  talentCategory: string;

  @IsString()
  @MaxLength(200)
  currentRole: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  currentEmployer?: string;

  @IsEnum(['EMPLOYED_FULL_TIME', 'FREELANCE', 'BETWEEN_ROLES', 'OTHER'])
  employmentStatus: string;

  @IsInt()
  @Min(0)
  @Max(60)
  yearsExperience: number;

  @IsEnum(['IC', 'MANAGER', 'DIRECTOR', 'VP', 'C_SUITE'])
  seniorityLevel: string;

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

  @IsUrl({}, { message: 'Please provide a valid LinkedIn URL.' })
  linkedInUrl: string;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(2, { message: 'Please provide at least 2 references.' })
  @ArrayMaxSize(5)
  @Type(() => ReferenceDto)
  references: ReferenceDto[];

  @IsString()
  @MinLength(100, { message: 'Case study response must be at least 100 characters.' })
  @MaxLength(3000)
  caseStudyResponse: string;

  @IsEnum(['H5_10', 'H10_20', 'H20_30', 'FULL_FRACTIONAL'])
  availabilityHours: string;

  @IsOptional()
  @IsDateString()
  earliestStart?: string;

  @IsInt()
  @Min(0)
  rateExpectationMin: number;

  @IsInt()
  @Min(0)
  rateExpectationMax: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  rateCurrency?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredStructures?: string[];

  @IsOptional()
  @IsBoolean()
  assessmentSkipped?: boolean;

  @IsOptional()
  @IsBoolean()
  referencesSkipped?: boolean;

  @IsBoolean()
  privacyAccepted: boolean;

  @IsBoolean()
  termsAccepted: boolean;

  @IsString()
  @MaxLength(32)
  noticeVersion: string;
}
