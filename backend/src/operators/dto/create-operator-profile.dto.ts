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
