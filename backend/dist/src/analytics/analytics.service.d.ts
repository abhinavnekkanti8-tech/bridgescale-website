import { PrismaService } from '../prisma/prisma.service';
export interface AdminDashboardMetrics {
    platformHealth: {
        totalStartups: number;
        totalOperators: number;
        activeEngagements: number;
        completedEngagements: number;
    };
    financials: {
        mrr: number;
        totalInvoiced: number;
        unpaidInvoices: number;
    };
    matching: {
        openMatches: number;
        avgTimeDays: number;
    };
    engagementHealth: {
        atRisk: number;
        onTrack: number;
    };
}
export declare class AnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardMetrics(): Promise<AdminDashboardMetrics>;
}
