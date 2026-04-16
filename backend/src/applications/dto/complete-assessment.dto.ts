import { IsString, IsOptional, IsInt, IsArray, MinLength } from 'class-validator';

export class CompleteAssessmentDto {
  @IsString()
  @MinLength(100, { message: 'Case study response must be at least 100 characters.' })
  caseStudyResponse: string;

  @IsOptional()
  @IsString()
  availabilityHours?: string;

  @IsOptional()
  @IsString()
  earliestStart?: string;

  @IsOptional()
  @IsInt()
  rateExpectationMin?: number;

  @IsOptional()
  @IsInt()
  rateExpectationMax?: number;

  @IsOptional()
  @IsString()
  rateCurrency?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredStructures?: string[];
}
