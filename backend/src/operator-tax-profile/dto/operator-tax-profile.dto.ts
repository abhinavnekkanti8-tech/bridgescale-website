import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TaxFormStatus, TaxFormType } from '@prisma/client';

export class UpsertOperatorTaxProfileDto {
  @IsEnum(TaxFormType)
  formType: TaxFormType;

  @IsOptional()
  @IsEnum(TaxFormStatus)
  formStatus?: TaxFormStatus;

  @IsOptional()
  @IsString()
  taxResidencyCountry?: string;

  @IsOptional()
  @IsString()
  payoutCountry?: string;

  @IsOptional()
  @IsString()
  payoutCurrency?: string;

  @IsOptional()
  @IsString()
  individualOrEntity?: string;

  @IsOptional()
  @IsString()
  encryptedBlobRef?: string;
}

