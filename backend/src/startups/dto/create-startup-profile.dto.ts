import {
  IsString,
  IsEnum,
  IsArray,
  ArrayMinSize,
  IsBoolean,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';

export enum StartupStage {
  PRE_SEED = 'PRE_SEED',
  SEED = 'SEED',
  SERIES_A = 'SERIES_A',
  SERIES_B_PLUS = 'SERIES_B_PLUS',
  BOOTSTRAPPED = 'BOOTSTRAPPED',
}

export enum SalesMotion {
  OUTBOUND = 'OUTBOUND',
  INBOUND = 'INBOUND',
  PARTNER_LED = 'PARTNER_LED',
  PRODUCT_LED = 'PRODUCT_LED',
  BLENDED = 'BLENDED',
}

export enum BudgetBand {
  UNDER_2K = 'UNDER_2K',
  TWO_TO_5K = 'TWO_TO_5K',
  FIVE_TO_10K = 'FIVE_TO_10K',
  ABOVE_10K = 'ABOVE_10K',
}

export enum TargetMarket {
  EU = 'EU',
  US = 'US',
  AU = 'AU',
  REST_OF_WORLD = 'REST_OF_WORLD',
}

export class CreateStartupProfileDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  industry: string;

  @IsEnum(StartupStage)
  stage: StartupStage;

  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(TargetMarket, { each: true })
  targetMarkets: TargetMarket[];

  @IsEnum(SalesMotion)
  salesMotion: SalesMotion;

  @IsEnum(BudgetBand)
  budgetBand: BudgetBand;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsOptional()
  executionOwner?: string;

  @IsBoolean()
  @IsOptional()
  hasProductDemo?: boolean;

  @IsBoolean()
  @IsOptional()
  hasDeck?: boolean;

  @IsBoolean()
  @IsOptional()
  toolingReady?: boolean;

  @IsBoolean()
  @IsOptional()
  responsivenessCommit?: boolean;

  @IsString()
  @MaxLength(2000)
  @IsOptional()
  additionalContext?: string;
}
