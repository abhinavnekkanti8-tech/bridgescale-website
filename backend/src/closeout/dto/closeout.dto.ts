import { IsString, IsNumber, IsEnum, Min, Max, IsBoolean, IsOptional, IsObject } from 'class-validator';
import { CloseoutStatus, RenewalType } from '@prisma/client';

export class GenerateCloseoutDto {
  @IsBoolean()
  @IsOptional()
  publish?: boolean;
}

export class UpdateCloseoutDto {
  @IsString()
  @IsOptional()
  summary?: string;

  @IsString()
  @IsOptional()
  outcomes?: string;

  @IsString()
  @IsOptional()
  nextSteps?: string;

  @IsEnum(CloseoutStatus)
  @IsOptional()
  status?: CloseoutStatus;
}

export class SubmitRatingDto {
  @IsString()
  revieweeId: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  score: number;

  @IsObject()
  @IsOptional()
  components?: any;

  @IsString()
  @IsOptional()
  comments?: string;
}

export class GenerateRenewalDto {
  @IsString()
  @IsOptional()
  customContext?: string;
}
