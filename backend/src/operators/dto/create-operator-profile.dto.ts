import {
  IsString,
  IsEnum,
  IsArray,
  IsInt,
  IsOptional,
  MaxLength,
  Min,
  ArrayMinSize,
} from 'class-validator';

export enum OperatorLane {
  PIPELINE_SPRINT = 'PIPELINE_SPRINT',
  BD_SPRINT = 'BD_SPRINT',
  FRACTIONAL_RETAINER = 'FRACTIONAL_RETAINER',
}

export enum TargetMarket {
  EU = 'EU',
  US = 'US',
  AU = 'AU',
  REST_OF_WORLD = 'REST_OF_WORLD',
}

export enum OperatorRole {
  VP_SALES = 'VP_SALES',
  VP_REVENUE = 'VP_REVENUE',
  CRO = 'CRO',
  HEAD_OF_SALES = 'HEAD_OF_SALES',
  GTM_LEADER = 'GTM_LEADER',
  FOUNDER_LED_SALES_COACH = 'FOUNDER_LED_SALES_COACH',
  REVENUE_ADVISOR = 'REVENUE_ADVISOR',
  BD_LEAD = 'BD_LEAD',
  PARTNERSHIPS_LEAD = 'PARTNERSHIPS_LEAD',
  CHANNEL_LEAD = 'CHANNEL_LEAD',
  ALLIANCES_LEAD = 'ALLIANCES_LEAD',
  MARKET_ACCESS_LEAD = 'MARKET_ACCESS_LEAD',
  AE = 'AE',
  SDR = 'SDR',
  BDR = 'BDR',
  OUTBOUND_OPERATOR = 'OUTBOUND_OPERATOR',
  REVOPS = 'REVOPS',
  SALES_OPS = 'SALES_OPS',
  CUSTOMER_SUCCESS_OPERATOR = 'CUSTOMER_SUCCESS_OPERATOR',
  EXPANSION_OPERATOR = 'EXPANSION_OPERATOR',
  ACCOUNT_MANAGER = 'ACCOUNT_MANAGER',
  SALES_ENABLEMENT_SOLUTIONS_CONSULTANT = 'SALES_ENABLEMENT_SOLUTIONS_CONSULTANT',
}

export class CreateOperatorProfileDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(OperatorLane, { each: true })
  lanes: OperatorLane[];

  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(TargetMarket, { each: true })
  regions: TargetMarket[];

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  functions: string[];

  @IsArray()
  @IsEnum(OperatorRole, { each: true })
  @IsOptional()
  roles?: OperatorRole[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  experienceTags?: string[];

  @IsInt()
  @Min(0)
  @IsOptional()
  yearsExperience?: number;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  linkedIn?: string;

  @IsOptional()
  references?: Record<string, unknown>;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  availability?: string;

  @IsString()
  @MaxLength(2000)
  @IsOptional()
  bio?: string;
}
