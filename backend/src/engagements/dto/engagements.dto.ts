import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  MinLength,
} from 'class-validator';
import { MilestoneStatus } from '@prisma/client';

export class UpdateEngagementStatusDto {
  @IsEnum(['NOT_STARTED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'TERMINATED', 'CONVERTED_TO_FULLTIME'])
  status: 'NOT_STARTED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'TERMINATED' | 'CONVERTED_TO_FULLTIME';
}

export class ConvertFulltimeDto {
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateMilestoneDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  description: string;

  @IsDateString()
  dueDate: string;
}

export class UpdateMilestoneDto {
  @IsOptional()
  @IsEnum(['PENDING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'])
  status?: MilestoneStatus;

  @IsOptional()
  @IsString()
  evidenceUrl?: string; // S3 link or similar
}

export class CreateNoteDto {
  @IsString()
  @MinLength(1)
  content: string;
}
