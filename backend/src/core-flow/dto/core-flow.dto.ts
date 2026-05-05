import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  CompensationMode,
  EngagementIntentParty,
  EngagementIntentStatus,
  EngagementType,
  RetainerFlavour,
  ServiceTemplateCode,
} from '@prisma/client';

export class RequestCallDto {
  @IsString()
  startupProfileId: string;

  @IsString()
  operatorId: string;

  @IsOptional()
  @IsString()
  shortlistId?: string;

  @IsOptional()
  @IsString()
  candidateId?: string;

  @IsOptional()
  @IsDateString()
  proposedAt?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  meetingLink?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class RespondToCallDto {
  @IsEnum(['ACCEPTED', 'DECLINED'])
  status: 'ACCEPTED' | 'DECLINED';

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  meetingLink?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CallOutcomeDto {
  @IsString()
  outcomeNotes: string;
}

export class EngagementIntentDto {
  @IsString()
  callId: string;

  @IsEnum(EngagementIntentParty)
  party: EngagementIntentParty;

  @IsEnum(EngagementIntentStatus)
  status: EngagementIntentStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreatePreSowSummaryDto {
  @IsString()
  callId: string;

  @IsEnum(ServiceTemplateCode)
  serviceTemplate: ServiceTemplateCode;

  @IsEnum(EngagementType)
  engagementType: EngagementType;

  @IsOptional()
  @IsEnum(RetainerFlavour)
  retainerFlavour?: RetainerFlavour;

  @IsOptional()
  @IsEnum(CompensationMode)
  compensationMode?: CompensationMode;

  @IsOptional()
  @IsInt()
  @Min(0)
  indicativePrice?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  weeklyHours?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationDays?: number;

  @IsOptional()
  @IsString()
  specialTerms?: string;

  @IsOptional()
  @IsString()
  cancellationNote?: string;
}

export class ConfirmPreSowSummaryDto {
  @IsEnum(EngagementIntentParty)
  party: EngagementIntentParty;
}

export class DeferCallDto {
  @IsDateString()
  newProposedAt: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
