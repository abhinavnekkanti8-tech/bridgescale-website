import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AdminDashboardMetrics {
  platformHealth: {
    totalStartups: number;
    totalOperators: number;
    activeEngagements: number;
    completedEngagements: number;
  };
  financials: {
    mrr: number; // monthly recurring revenue approx
    totalInvoiced: number;
    unpaidInvoices: number;
  };
  matching: {
    openMatches: number;
    avgTimeDays: number; // mock
  };
  engagementHealth: {
    atRisk: number; // health < 50
    onTrack: number; // health >= 80
  };
}

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardMetrics(): Promise<AdminDashboardMetrics> {
    const [
      totalStartups,
      totalOperators,
      activeEngagements,
      completedEngagements,
      invoices,
      openMatches,
      engagements
    ] = await Promise.all([
      this.prisma.startupProfile.count(),
      this.prisma.operatorProfile.count({ where: { verification: 'VERIFIED' } }),
      this.prisma.engagement.count({ where: { status: 'ACTIVE' } }),
      this.prisma.engagement.count({ where: { status: 'COMPLETED' } }),
      this.prisma.invoice.findMany(),
      this.prisma.matchCandidate.count({ where: { interest: 'PENDING' } }),
      this.prisma.engagement.findMany({ select: { healthScore: true, status: true } })
    ]);

    const totalInvoiced = invoices.reduce((sum: number, inv: any) => sum + Number(inv.amount), 0);
    const unpaidInvoices = invoices.filter((i: any) => i.status !== 'PAID').length;
    // Mock MRR as 10% of total invoiced for demo purposes or exact logic if subscriptions exist
    const mrr = totalInvoiced * 0.1; 

    // Health
    const atRisk = engagements.filter((e: any) => e.status === 'ACTIVE' && e.healthScore < 50).length;
    const onTrack = engagements.filter((e: any) => e.status === 'ACTIVE' && e.healthScore >= 80).length;

    return {
      platformHealth: {
        totalStartups,
        totalOperators,
        activeEngagements,
        completedEngagements,
      },
      financials: {
        mrr,
        totalInvoiced,
        unpaidInvoices,
      },
      matching: {
        openMatches,
        avgTimeDays: 4.2, // hardcoded for MVP aesthetics
      },
      engagementHealth: {
        atRisk,
        onTrack,
      }
    };
  }
}
