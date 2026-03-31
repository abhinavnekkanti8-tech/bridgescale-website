import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  MinLength,
} from 'class-validator';
import { MilestoneStatus } from '@prisma/client';

export class UpdateEngagementStatusDto {
  @IsEnum(['NOT_STARTED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'TERMINATED'])
  status: 'NOT_STARTED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'TERMINATED';
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
