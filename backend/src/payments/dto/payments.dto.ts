import {
  IsString,
  IsInt,
  IsEnum,
  Min,
  IsDateString,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { PaymentLedgerStatus, PayoutProvider } from '@prisma/client';

export enum PaymentPlanTypeDto {
  CASH_SPRINT_FEE = 'CASH_SPRINT_FEE',
  MONTHLY_RETAINER = 'MONTHLY_RETAINER',
  SUCCESS_FEE_ADDENDUM = 'SUCCESS_FEE_ADDENDUM',
}

export class CreatePaymentPlanDto {
  @IsString()
  contractId: string;

  @IsEnum(PaymentPlanTypeDto)
  planType: PaymentPlanTypeDto;

  @IsInt()
  @Min(100)
  totalAmountUsd: number;
}

export class IssueInvoiceDto {
  @IsString()
  paymentPlanId: string;

  @IsInt()
  @Min(1)
  amountUsd: number;

  @IsString()
  description: string;

  @IsDateString()
  dueDate: string;
}

export class UpdateInvoiceStatusDto {
  @IsEnum(['DRAFT', 'ISSUED', 'PAID', 'OVERDUE', 'CANCELLED'])
  status: 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE' | 'CANCELLED';
}

export class GenerateLedgerDto {
  @IsString()
  contractId: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  eorFeeAmount?: number;
}

export class UpdateLedgerReviewDto {
  @IsEnum(PaymentLedgerStatus)
  status: PaymentLedgerStatus;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reviewNotes?: string;
}

export class CreatePayoutAttemptDto {
  @IsEnum(PayoutProvider)
  provider: PayoutProvider;
}
