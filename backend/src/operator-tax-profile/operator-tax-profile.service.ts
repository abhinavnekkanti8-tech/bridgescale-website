import { Injectable, NotFoundException } from '@nestjs/common';
import { TaxFormStatus, TaxFormType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertOperatorTaxProfileDto } from './dto/operator-tax-profile.dto';

/**
 * Returned to the operator-facing UI. Summarises which forms exist on file
 * for the current operator and the overall gating status:
 *   - "basic" → enough info to enter the matching pool (residency + payout pref)
 *   - "full"  → enough docs collected to allow MSA generation
 *   - "verified" → all docs verified by ops, ready for payout
 */
export interface TaxProfileStatus {
  forms: Array<{
    formType: TaxFormType;
    formStatus: TaxFormStatus;
    taxResidencyCountry?: string | null;
    payoutCountry?: string | null;
    payoutCurrency?: string | null;
    individualOrEntity?: string | null;
    expiresAt?: Date | null;
    verifiedAt?: Date | null;
    updatedAt: Date;
  }>;
  /** True once at least one form is COLLECTED with residency + payout fields filled. */
  basicComplete: boolean;
  /** True once at least one form is COLLECTED or VERIFIED — required before MSA generation. */
  msaReady: boolean;
  /** True once at least one form is VERIFIED — required before payout. */
  payoutReady: boolean;
  /** Forms still expected based on payout country (W-9 for US, W-8BEN for non-US, etc.). */
  expectedForms: TaxFormType[];
}

@Injectable()
export class OperatorTaxProfileService {
  constructor(private readonly prisma: PrismaService) {}

  /** List all tax profiles for the operator org with gating-status summary. */
  async getStatusForOperatorOrg(operatorOrgId: string): Promise<TaxProfileStatus> {
    const profile = await this.prisma.operatorProfile.findUnique({
      where: { operatorId: operatorOrgId },
    });
    if (!profile) throw new NotFoundException('Operator profile not found.');

    const rows = await this.prisma.operatorTaxProfile.findMany({
      where: { operatorProfileId: profile.id },
      orderBy: { updatedAt: 'desc' },
    });

    // Take the latest row per formType (rows are already sorted descending by updatedAt).
    const seen = new Set<TaxFormType>();
    const latestPerType = rows.filter((r) => {
      if (seen.has(r.formType)) return false;
      seen.add(r.formType);
      return true;
    });

    const basicComplete = latestPerType.some(
      (r) => r.taxResidencyCountry && r.payoutCountry && r.payoutCurrency,
    );
    const msaReady = latestPerType.some(
      (r) => r.formStatus === TaxFormStatus.COLLECTED || r.formStatus === TaxFormStatus.VERIFIED,
    );
    const payoutReady = latestPerType.some((r) => r.formStatus === TaxFormStatus.VERIFIED);

    // Heuristic for "expected forms" given payout country.
    // (Tax counsel will replace this with corridor-specific rules in P5.4.)
    const payoutCountry =
      latestPerType.find((r) => !!r.payoutCountry)?.payoutCountry?.toUpperCase() ?? null;
    const expectedForms: TaxFormType[] = [];
    if (payoutCountry === 'US') expectedForms.push(TaxFormType.W9);
    else if (payoutCountry) expectedForms.push(TaxFormType.W8BEN);
    if (payoutCountry === 'IN') expectedForms.push(TaxFormType.GST_PAN);
    if (['DE', 'FR', 'NL', 'ES', 'IE', 'IT', 'PT', 'GB', 'UK'].includes(payoutCountry ?? '')) {
      expectedForms.push(TaxFormType.VAT);
    }

    return {
      forms: latestPerType.map((r) => ({
        formType: r.formType,
        formStatus: r.formStatus,
        taxResidencyCountry: r.taxResidencyCountry,
        payoutCountry: r.payoutCountry,
        payoutCurrency: r.payoutCurrency,
        individualOrEntity: r.individualOrEntity,
        expiresAt: r.expiresAt,
        verifiedAt: r.verifiedAt,
        updatedAt: r.updatedAt,
      })),
      basicComplete,
      msaReady,
      payoutReady,
      expectedForms,
    };
  }

  async upsertForOperatorOrg(operatorOrgId: string, dto: UpsertOperatorTaxProfileDto) {
    const profile = await this.prisma.operatorProfile.findUnique({
      where: { operatorId: operatorOrgId },
    });
    if (!profile) throw new NotFoundException('Operator profile not found.');

    const existing = await this.prisma.operatorTaxProfile.findFirst({
      where: { operatorProfileId: profile.id, formType: dto.formType },
      orderBy: { createdAt: 'desc' },
    });

    const data = {
      formType: dto.formType,
      formStatus: dto.formStatus ?? 'COLLECTED',
      taxResidencyCountry: dto.taxResidencyCountry,
      payoutCountry: dto.payoutCountry,
      payoutCurrency: dto.payoutCurrency,
      individualOrEntity: dto.individualOrEntity,
      encryptedBlobRef: dto.encryptedBlobRef,
      verifiedAt: dto.formStatus === 'VERIFIED' ? new Date() : undefined,
    };

    if (existing) {
      return this.prisma.operatorTaxProfile.update({
        where: { id: existing.id },
        data,
      });
    }

    return this.prisma.operatorTaxProfile.create({
      data: {
        operatorProfileId: profile.id,
        ...data,
      },
    });
  }
}

