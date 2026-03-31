import {
  IsString,
  IsDateString,
  IsInt,
  IsOptional,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class ScheduleDiscoveryDto {
  @IsString()
  startupProfileId: string;

  @IsDateString()
  scheduledAt: string;

  @IsInt()
  @Min(15)
  @Max(120)
  @IsOptional()
  durationMinutes?: number;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  meetingLink?: string;
}

export class AddNotesDto {
  @IsString()
  @MaxLength(10000)
  notes: string;
}

export class OverrideDiscoveryDto {
  @IsString()
  @MaxLength(5000)
  overrideSummary: string;

  @IsString()
  overrideReason: string;
}
