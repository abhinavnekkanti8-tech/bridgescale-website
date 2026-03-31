export declare enum PaymentPlanTypeDto {
    CASH_SPRINT_FEE = "CASH_SPRINT_FEE",
    MONTHLY_RETAINER = "MONTHLY_RETAINER",
    SUCCESS_FEE_ADDENDUM = "SUCCESS_FEE_ADDENDUM"
}
export declare class CreatePaymentPlanDto {
    contractId: string;
    planType: PaymentPlanTypeDto;
    totalAmountUsd: number;
}
export declare class IssueInvoiceDto {
    paymentPlanId: string;
    amountUsd: number;
    description: string;
    dueDate: string;
}
export declare class UpdateInvoiceStatusDto {
    status: 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE' | 'CANCELLED';
}
