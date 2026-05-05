import { Injectable } from '@nestjs/common';
import {
  ContractStatus,
  EorEnrollmentStatus,
  MsaStatus,
  PaymentLedgerStatus,
  PreSowSummaryStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Admin/deal-desk read aggregator. One service that backs every queue surface
 * an ops user needs to triage:
 *   - Pre-SOW summaries needing edit/approval
 *   - MSAs at each stage of the 3-party signing flow
 *   - Contracts (SOW signing) at each stage
 *   - Compliance decisions (EOR-required / blocked / under review)
 *   - EOR enrolments needing partner-side action
 *   - Payment ledgers requiring review
 *
 * All queries cap at the 200 most recent rows for a given filter — these are
 * triage queues, not exports.
 */
@Injectable()
export class AdminOpsService {
  constructor(private readonly prisma: PrismaService) {}

  listPreSowSummaries(status?: PreSowSummaryStatus) {
    return this.prisma.preSowCommercialSummary.findMany({
      where: status ? { status } : undefined,
      orderBy: { updatedAt: 'desc' },
      take: 200,
      include: {
        startup: { select: { id: true, industry: true } },
        operator: { select: { id: true, operatorId: true } },
      },
    });
  }

  listMsas(status?: MsaStatus) {
    return this.prisma.masterServiceAgreement.findMany({
      where: status ? { status } : undefined,
      orderBy: { updatedAt: 'desc' },
      take: 200,
      include: {
        startup: { select: { id: true, industry: true } },
        operator: { select: { id: true, operatorId: true } },
      },
    });
  }

  listContracts(status?: ContractStatus) {
    return this.prisma.contract.findMany({
      where: status ? { status } : undefined,
      orderBy: { updatedAt: 'desc' },
      take: 200,
      include: {
        sow: { select: { id: true, title: true, totalPriceUsd: true, startupProfileId: true, operatorId: true } },
      },
    });
  }

  listComplianceDecisions() {
    return this.prisma.complianceDecisionLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        operatorProfile: { select: { id: true, operatorId: true } },
      },
    });
  }

  listEorEnrollments(status?: EorEnrollmentStatus) {
    return this.prisma.operatorEorEnrollment.findMany({
      where: status ? { status } : undefined,
      orderBy: { updatedAt: 'desc' },
      take: 200,
      include: {
        operatorProfile: { select: { id: true, operatorId: true } },
      },
    });
  }

  listPaymentLedgers(status?: PaymentLedgerStatus) {
    return this.prisma.paymentLedger.findMany({
      where: status ? { status } : undefined,
      orderBy: { updatedAt: 'desc' },
      take: 200,
      include: {
        contract: { select: { id: true, sow: { select: { title: true } } } },
        payoutAttempts: true,
      },
    });
  }

  /**
   * One-shot dashboard counts for the admin landing page. Returns counts of
   * actionable items per queue so the dashboard can show badges.
   */
  async getQueueCounts() {
    const [
      preSowAwaiting,
      msaPending,
      contractsPending,
      complianceRecent,
      eorPending,
      ledgersReview,
    ] = await Promise.all([
      this.prisma.preSowCommercialSummary.count({ where: { status: PreSowSummaryStatus.SHARED } }),
      this.prisma.masterServiceAgreement.count({ where: { status: { in: [MsaStatus.PENDING_SIGNATURES, MsaStatus.PARTIALLY_SIGNED] } } }),
      this.prisma.contract.count({ where: { status: { in: [ContractStatus.PENDING_SIGNATURES, ContractStatus.STARTUP_SIGNED, ContractStatus.OPERATOR_SIGNED] } } }),
      this.prisma.complianceDecisionLog.count({ where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
      this.prisma.operatorEorEnrollment.count({ where: { status: EorEnrollmentStatus.PENDING } }),
      this.prisma.paymentLedger.count({ where: { status: { in: [PaymentLedgerStatus.DRAFT] } } }),
    ]);
    return {
      preSowAwaitingConfirmation: preSowAwaiting,
      msaPendingSignatures: msaPending,
      contractsPendingSignatures: contractsPending,
      complianceDecisionsLast30d: complianceRecent,
      eorEnrolmentsPending: eorPending,
      ledgersAwaitingReview: ledgersReview,
    };
  }
}
