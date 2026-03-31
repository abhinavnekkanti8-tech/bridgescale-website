import {
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  MaxLength,
  Min,
} from 'class-validator';

enum PackageTypeDto {
  PIPELINE_SPRINT = 'PIPELINE_SPRINT',
  BD_SPRINT = 'BD_SPRINT',
  FRACTIONAL_RETAINER = 'FRACTIONAL_RETAINER',
}

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
