const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const runId = Date.now();

async function main() {
  const companyOrg = await prisma.organization.create({
    data: {
      orgType: 'STARTUP',
      name: `E2E Company ${runId}`,
      country: 'IN',
      website: 'https://e2e.example.com',
    },
  });

  const operatorOrg = await prisma.organization.create({
    data: {
      orgType: 'OPERATOR_ENTITY',
      name: `E2E Operator ${runId}`,
      country: 'US',
    },
  });

  const startup = await prisma.startupProfile.create({
    data: {
      startupId: companyOrg.id,
      industry: 'SaaS',
      stage: 'SEED',
      targetMarkets: ['US'],
      salesMotion: 'OUTBOUND',
      budgetBand: 'FIVE_TO_10K',
      hasProductDemo: true,
      hasDeck: true,
      toolingReady: true,
      responsivenessCommit: true,
      status: 'APPROVED',
    },
  });

  const operator = await prisma.operatorProfile.create({
    data: {
      operatorId: operatorOrg.id,
      lanes: ['PIPELINE_SPRINT'],
      roles: ['BD_LEAD'],
      regions: ['US'],
      functions: [],
      experienceTags: ['SaaS'],
      verification: 'VERIFIED',
      tier: 'TIER_A',
    },
  });

  await prisma.operatorTaxProfile.create({
    data: {
      operatorProfileId: operator.id,
      formType: 'W9',
      formStatus: 'VERIFIED',
      taxResidencyCountry: 'US',
      payoutCountry: 'US',
      payoutCurrency: 'USD',
      individualOrEntity: 'INDIVIDUAL',
      encryptedBlobRef: `dummy-tax-ref-${runId}`,
      verifiedAt: new Date(),
    },
  });

  const call = await prisma.engagementCall.create({
    data: {
      startupProfileId: startup.id,
      operatorId: operatorOrg.id,
      requestedBy: 'E2E_SCRIPT',
      status: 'COMPLETED',
      scheduledAt: new Date(),
      completedAt: new Date(),
      meetingLink: 'https://meet.example.com/e2e',
    },
  });

  await prisma.engagementIntent.createMany({
    data: [
      {
        callId: call.id,
        startupProfileId: startup.id,
        operatorId: operatorOrg.id,
        party: 'STARTUP',
        status: 'INTERESTED',
      },
      {
        callId: call.id,
        startupProfileId: startup.id,
        operatorId: operatorOrg.id,
        party: 'OPERATOR',
        status: 'INTERESTED',
      },
    ],
  });

  const summary = await prisma.preSowCommercialSummary.create({
    data: {
      callId: call.id,
      startupProfileId: startup.id,
      operatorId: operatorOrg.id,
      serviceTemplate: 'PIPELINE_SPRINT',
      engagementType: 'SPRINT',
      compensationMode: 'CASH',
      indicativePrice: 5000,
      currency: 'USD',
      weeklyHours: 15,
      durationDays: 30,
      status: 'CONFIRMED',
      startupConfirmedAt: new Date(),
      operatorConfirmedAt: new Date(),
    },
  });

  const msa = await prisma.masterServiceAgreement.create({
    data: {
      startupProfileId: startup.id,
      operatorId: operatorOrg.id,
      platformSignedAt: new Date(),
      startupSignedAt: new Date(),
      operatorSignedAt: new Date(),
      platformSignatureId: `DUMMY_PLATFORM_${runId}`,
      startupSignatureId: `DUMMY_COMPANY_${runId}`,
      operatorSignatureId: `DUMMY_OPERATOR_${runId}`,
      status: 'FULLY_EXECUTED',
      fullyExecutedAt: new Date(),
    },
  });

  await prisma.preSowCommercialSummary.update({
    where: { id: summary.id },
    data: { masterAgreementId: msa.id },
  });

  const sow = await prisma.statementOfWork.create({
    data: {
      shortlistId: call.id,
      startupProfileId: startup.id,
      operatorId: operatorOrg.id,
      masterAgreementId: msa.id,
      packageType: 'PIPELINE_SPRINT',
      serviceTemplate: 'PIPELINE_SPRINT',
      engagementType: 'SPRINT',
      title: 'E2E Pipeline Sprint - Dummy SOW',
      scope: 'Dummy scope for review build.',
      deliverables: 'Dummy deliverables for review build.',
      timeline: '30 days.',
      weeklyHours: 15,
      totalPriceUsd: 5000,
      status: 'LOCKED',
    },
  });

  const contract = await prisma.contract.create({
    data: {
      sowId: sow.id,
      status: 'FULLY_SIGNED',
      startupSignedAt: new Date(),
      operatorSignedAt: new Date(),
      startupSignatureId: `DUMMY_CONTRACT_COMPANY_${runId}`,
      operatorSignatureId: `DUMMY_CONTRACT_OPERATOR_${runId}`,
      fullySignedAt: new Date(),
      contactsUnlocked: true,
    },
  });

  const plan = await prisma.paymentPlan.create({
    data: {
      contractId: contract.id,
      planType: 'CASH_SPRINT_FEE',
      totalAmountUsd: 5000,
      currency: 'USD',
      billingCurrency: 'USD',
      payoutCurrency: 'USD',
      fxRateAtSigning: 1,
    },
  });

  const invoice = await prisma.invoice.create({
    data: {
      paymentPlanId: plan.id,
      amountUsd: 5000,
      description: 'Dummy sprint invoice',
      dueDate: new Date(),
      status: 'PAID',
      issuedAt: new Date(),
      paidAt: new Date(),
      stripeId: `dummy_invoice_${runId}`,
      stripeUrl: 'https://pay.example.com/dummy',
    },
  });

  const ledger = await prisma.paymentLedger.create({
    data: {
      paymentPlanId: plan.id,
      contractId: contract.id,
      invoiceAmount: 5000,
      billingCurrency: 'USD',
      platformFeeAmount: 500,
      operatorPayoutAmount: 4500,
      eorFeeAmount: 0,
      payoutCurrency: 'USD',
      fxRateAtSigning: 1,
      complianceMode: 'CONTRACTOR',
      taxReady: true,
      payoutReady: true,
      status: 'READY_FOR_PAYOUT',
    },
  });

  const payout = await prisma.payoutAttempt.create({
    data: {
      ledgerId: ledger.id,
      provider: 'DUMMY',
      status: 'PLANNED',
      amount: 4500,
      currency: 'USD',
      providerRef: `dummy_payout_${runId}`,
      dummyMode: true,
    },
  });

  const engagement = await prisma.engagement.create({
    data: {
      contractId: contract.id,
      startupId: startup.id,
      operatorId: operator.id,
      status: 'ACTIVE',
      startDate: new Date(),
    },
  });

  console.log(
    JSON.stringify(
      {
        runId,
        companyOrg: companyOrg.id,
        operatorOrg: operatorOrg.id,
        startup: startup.id,
        operatorProfile: operator.id,
        call: call.id,
        preSowSummary: summary.id,
        msa: msa.id,
        sow: sow.id,
        contract: contract.id,
        paymentPlan: plan.id,
        invoice: invoice.id,
        ledger: ledger.id,
        payoutAttempt: payout.id,
        engagement: engagement.id,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
