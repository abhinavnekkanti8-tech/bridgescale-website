import { SowService } from './sow.service';
export declare class SowController {
    private readonly sowService;
    constructor(sowService: SowService);
    getTemplates(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        templateType: import(".prisma/client").$Enums.SowTemplateType;
        version: number;
        description: string;
        contentPlainText: string;
        placeholders: import("@prisma/client/runtime/library").JsonValue;
        durationDays: number;
        suggestedFeeMin: number;
        suggestedFeeMax: number;
        currency: string;
        isActive: boolean;
    }[]>;
    getTemplate(templateId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        templateType: import(".prisma/client").$Enums.SowTemplateType;
        version: number;
        description: string;
        contentPlainText: string;
        placeholders: import("@prisma/client/runtime/library").JsonValue;
        durationDays: number;
        suggestedFeeMin: number;
        suggestedFeeMax: number;
        currency: string;
        isActive: boolean;
    }>;
    getSoW(sowId: string): Promise<{
        versions: {
            id: string;
            createdAt: Date;
            version: number;
            sowId: string;
            content: import("@prisma/client/runtime/library").JsonValue;
            changeNote: string | null;
            changedBy: string;
        }[];
    } & {
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
    }>;
    generateSoW(params: {
        shortlistId: string;
        startupProfileId: string;
        operatorId: string;
        templateId: string;
        companyName: string;
        talentName: string;
        expectedDurationDays: number;
        feeUsd: number;
        weeklyHours?: number;
        packageType?: string;
        placeholderValues?: Record<string, string>;
    }): Promise<{
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
        version: {
            id: string;
            createdAt: Date;
            version: number;
            sowId: string;
            content: import("@prisma/client/runtime/library").JsonValue;
            changeNote: string | null;
            changedBy: string;
        };
    }>;
    updateSoW(sowId: string, body: {
        contentText: string;
        changedBy: string;
        changeNote?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        version: number;
        sowId: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        changeNote: string | null;
        changedBy: string;
    }>;
    approveSoW(sowId: string): Promise<{
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
    }>;
}
