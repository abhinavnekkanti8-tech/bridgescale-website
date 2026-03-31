import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ApplicationStatus } from '@prisma/client';
export declare class ApplicationsController {
    private readonly applicationsService;
    constructor(applicationsService: ApplicationsService);
    createApplication(dto: CreateApplicationDto): Promise<{
        applicationId: string;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        checkoutUrl: null;
        dummyMode: boolean;
    }>;
    getApplicationStatus(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        createdAt: Date;
        type: import(".prisma/client").$Enums.ApplicationType;
        feeAmountUsd: number;
    }>;
    listApplications(status?: ApplicationStatus): Promise<{
        id: string;
        email: string;
        name: string;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        type: import(".prisma/client").$Enums.ApplicationType;
        paidAt: Date | null;
        targetMarkets: string | null;
        references: import("@prisma/client/runtime/library").JsonValue | null;
        companyName: string | null;
        companyStage: string | null;
        needArea: string | null;
        engagementModel: string | null;
        budgetRange: string | null;
        urgency: string | null;
        location: string | null;
        talentCategory: string | null;
        seniority: string | null;
        engagementPref: string | null;
        markets: string | null;
        linkedInUrl: string | null;
        cvFileName: string | null;
        cvFileUrl: string | null;
        feeAmountUsd: number;
        stripeSessionId: string | null;
        stripePaymentId: string | null;
    }[]>;
    updateApplicationStatus(id: string, status: ApplicationStatus): Promise<{
        id: string;
        email: string;
        name: string;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        type: import(".prisma/client").$Enums.ApplicationType;
        paidAt: Date | null;
        targetMarkets: string | null;
        references: import("@prisma/client/runtime/library").JsonValue | null;
        companyName: string | null;
        companyStage: string | null;
        needArea: string | null;
        engagementModel: string | null;
        budgetRange: string | null;
        urgency: string | null;
        location: string | null;
        talentCategory: string | null;
        seniority: string | null;
        engagementPref: string | null;
        markets: string | null;
        linkedInUrl: string | null;
        cvFileName: string | null;
        cvFileUrl: string | null;
        feeAmountUsd: number;
        stripeSessionId: string | null;
        stripePaymentId: string | null;
    }>;
    uploadCv(id: string, file: Express.Multer.File): Promise<{
        applicationId: string;
        cvFileName: string | null;
        cvFileUrl: string | null;
    }>;
    handleStripeWebhook(payload: any): Promise<{
        received: boolean;
        applicationId: string;
    } | {
        received: boolean;
    }>;
}
