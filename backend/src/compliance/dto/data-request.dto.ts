import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class DataExportRequestDto {
  @IsEmail()
  subjectEmail: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}

export class DataDeleteRequestDto {
  @IsEmail()
  subjectEmail: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}
