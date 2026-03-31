import {
  IsString,
  IsInt,
  IsEnum,
  Min,
  IsOptional,
  IsDateString,
  IsNumber,
} from 'class-validator';

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
