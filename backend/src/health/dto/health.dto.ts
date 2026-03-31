import { IsString, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { NudgeType, EscalationStatus } from '@prisma/client';

export class UpdateHealthScoreDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  scoreTotal: number;

  @IsString()
  aiCommentary: string;

  @IsString()
  suggestedAction: string;
}

export class CreateNudgeDto {
  @IsEnum(NudgeType)
  nudgeType: NudgeType;

  @IsString()
  targetUserId: string;

  @IsString()
  message: string;
}

export class CreateEscalationDto {
  @IsString()
  engagementId: string;

  @IsString()
  reason: string;
}

export class UpdateEscalationDto {
  @IsEnum(EscalationStatus)
  status: EscalationStatus;

  @IsString()
  resolutionNotes?: string;
}
