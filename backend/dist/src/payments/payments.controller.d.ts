import { PaymentsService } from './payments.service';
import { CreatePaymentPlanDto, IssueInvoiceDto } from './dto/payments.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    createPaymentPlan(dto: CreatePaymentPlanDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        contractId: string;
        planType: import(".prisma/client").$Enums.PaymentPlanType;
        totalAmountUsd: number;
    }>;
    getPaymentPlan(contractId: string): Promise<({
        invoices: {
            id: string;
            status: import(".prisma/client").$Enums.InvoiceStatus;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            paymentPlanId: string;
            amountUsd: number;
            dueDate: Date;
            stripeUrl: string | null;
            stripeId: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            issuedAt: Date | null;
            paidAt: Date | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        contractId: string;
        planType: import(".prisma/client").$Enums.PaymentPlanType;
        totalAmountUsd: number;
    }) | null>;
    issueInvoice(dto: IssueInvoiceDto): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        paymentPlanId: string;
        amountUsd: number;
        dueDate: Date;
        stripeUrl: string | null;
        stripeId: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        issuedAt: Date | null;
        paidAt: Date | null;
    }>;
    getAllInvoices(): Promise<({
        paymentPlan: {
            contract: {
                sow: {
                    id: string;
                    status: import(".prisma/client").$Enums.SowStatus;
                    createdAt: Date;
                    updatedAt: Date;
                    operatorId: string;
                    title: string;
                    shortlistId: string;
                    startupProfileId: string;
                    packageType: import(".prisma/client").$Enums.PackageType;
                    scope: string;
                    deliverables: string;
                    timeline: string;
                    weeklyHours: number;
                    totalPriceUsd: number;
                    nonCircumvention: boolean;
                    currentVersion: number;
                    promptVersion: string | null;
                    modelName: string | null;
                };
            } & {
                id: string;
                status: import(".prisma/client").$Enums.ContractStatus;
                createdAt: Date;
                updatedAt: Date;
                sowId: string;
                startupSignedAt: Date | null;
                operatorSignedAt: Date | null;
                startupSignatureId: string | null;
                operatorSignatureId: string | null;
                fullySignedAt: Date | null;
                contactsUnlocked: boolean;
                watermarked: boolean;
                idempotencyKey: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            currency: string;
            contractId: string;
            planType: import(".prisma/client").$Enums.PaymentPlanType;
            totalAmountUsd: number;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        paymentPlanId: string;
        amountUsd: number;
        dueDate: Date;
        stripeUrl: string | null;
        stripeId: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        issuedAt: Date | null;
        paidAt: Date | null;
    })[]>;
    getStartupInvoices(id: string): Promise<({
        paymentPlan: {
            contract: {
                sow: {
                    id: string;
                    status: import(".prisma/client").$Enums.SowStatus;
                    createdAt: Date;
                    updatedAt: Date;
                    operatorId: string;
                    title: string;
                    shortlistId: string;
                    startupProfileId: string;
                    packageType: import(".prisma/client").$Enums.PackageType;
                    scope: string;
                    deliverables: string;
                    timeline: string;
                    weeklyHours: number;
                    totalPriceUsd: number;
                    nonCircumvention: boolean;
                    currentVersion: number;
                    promptVersion: string | null;
                    modelName: string | null;
                };
            } & {
                id: string;
                status: import(".prisma/client").$Enums.ContractStatus;
                createdAt: Date;
                updatedAt: Date;
                sowId: string;
                startupSignedAt: Date | null;
                operatorSignedAt: Date | null;
                startupSignatureId: string | null;
                operatorSignatureId: string | null;
                fullySignedAt: Date | null;
                contactsUnlocked: boolean;
                watermarked: boolean;
                idempotencyKey: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            currency: string;
            contractId: string;
            planType: import(".prisma/client").$Enums.PaymentPlanType;
            totalAmountUsd: number;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        paymentPlanId: string;
        amountUsd: number;
        dueDate: Date;
        stripeUrl: string | null;
        stripeId: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        issuedAt: Date | null;
        paidAt: Date | null;
    })[]>;
    markInvoicePaid(id: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        paymentPlanId: string;
        amountUsd: number;
        dueDate: Date;
        stripeUrl: string | null;
        stripeId: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        issuedAt: Date | null;
        paidAt: Date | null;
    }>;
    markInvoiceOverdue(id: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        paymentPlanId: string;
        amountUsd: number;
        dueDate: Date;
        stripeUrl: string | null;
        stripeId: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        issuedAt: Date | null;
        paidAt: Date | null;
    }>;
    handleWebhook(payload: any): Promise<{
        received: boolean;
    }>;
}
