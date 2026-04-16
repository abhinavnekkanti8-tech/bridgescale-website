# Phase 2 — Task Breakdown for Haiku/Sonnet

These are **structural changes** that modify the signup flow, authentication, backend logic, and dashboard. They depend on each other and must be implemented in order.

**Prerequisites:** Phase 1 tasks should be completed first (especially 1.4 and 1.7 which update copy and add skip buttons).

**Repo root:** The working directory for all paths below.
**Frontend:** `frontend/src/`
**Backend:** `backend/src/`

---

## Task 2.1 — Schema Migration: Add Free Signup Fields

**Files to modify:**
- `backend/prisma/schema.prisma`

**What to do:**

### 2.1a — Add fields to the Application model

Find the `Application` model (around line 912) and add these fields after the `preferredStructures` field (around line 972) and before the `// Payment` comment:

```prisma
  // Signup flow control
  assessmentSkipped   Boolean           @default(false)
  referencesSkipped   Boolean           @default(false)
  assessmentCompletedAt DateTime?
  referencesCompletedAt DateTime?
  matchingUnlocked    Boolean           @default(false)
  matchingUnlockedAt  DateTime?
```

### 2.1b — Add new ApplicationStatus value

Find the `ApplicationStatus` enum (around line 895) and add a new value after `PENDING_PAYMENT`:

```prisma
enum ApplicationStatus {
  PENDING_PAYMENT
  PAYMENT_FAILED
  SUBMITTED
  AWAITING_COMPLETION    // NEW — talent account created but refs/assessment incomplete
  UNDER_REVIEW
  // ... rest stays the same
}
```

### 2.1c — Run the migration

```bash
cd backend
npx prisma migrate dev --name add-free-signup-fields
```

**Expected outcome:** New columns exist on the `applications` table. The `AWAITING_COMPLETION` status is available for talent who skipped assessment/references.

**Test:** Run `npx prisma studio` → open the `applications` table → confirm new columns appear.

---

## Task 2.2 — Backend: Add Password Field to Application DTO

**Files to modify:**
- `backend/src/applications/dto/create-application.dto.ts`

**What to do:**

1. Find the `CreateApplicationDto` class and add a `password` field:
   ```typescript
   @IsOptional()
   @IsString()
   @MinLength(8, { message: 'Password must be at least 8 characters.' })
   password?: string;
   ```
   Import `MinLength` from `class-validator` if not already imported.

2. Add the `assessmentSkipped` field:
   ```typescript
   @IsOptional()
   @IsBoolean()
   assessmentSkipped?: boolean;
   ```
   Import `IsBoolean` from `class-validator` if not already imported.

3. Add the `referencesSkipped` field:
   ```typescript
   @IsOptional()
   @IsBoolean()
   referencesSkipped?: boolean;
   ```

**Expected outcome:** The application endpoint now accepts `password`, `assessmentSkipped`, and `referencesSkipped` fields.

---

## Task 2.3 — Backend: Free Signup Flow (Remove Payment from Application Creation)

**Files to modify:**
- `backend/src/applications/applications.service.ts`

**What to do:**

This is the biggest change. The `createApplication()` method currently creates an application as `PENDING_PAYMENT` and initiates Razorpay/Stripe. It needs to instead:
1. Create the application as `SUBMITTED` (or `AWAITING_COMPLETION` for talent with skipped steps)
2. Create user + org + membership immediately (no payment)
3. Hash and store the password
4. Return a session-compatible response (so the frontend can auto-login)
5. NOT initiate any payment

### Step-by-step changes:

#### 2.3a — Add bcrypt import
At the top of the file, add:
```typescript
import * as bcrypt from 'bcryptjs';
```

#### 2.3b — Rewrite createApplication()

Replace the entire `createApplication()` method with:

```typescript
async createApplication(dto: CreateApplicationDto) {
  // Duplicate guard: same email within 24h (excluding REJECTED)
  const recentDuplicate = await this.prisma.application.findFirst({
    where: {
      email: dto.email.toLowerCase(),
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      status: { not: ApplicationStatus.REJECTED },
    },
  });

  if (recentDuplicate) {
    throw new BadRequestException(
      'An application with this email was already submitted recently. Please check your inbox or try again later.',
    );
  }

  // Determine status based on type and skipped steps
  const isTalent = dto.type === ApplicationTypeDto.TALENT;
  const assessmentSkipped = isTalent && (dto.assessmentSkipped ?? false);
  const referencesSkipped = isTalent && (dto.referencesSkipped ?? false);

  const initialStatus = (isTalent && (assessmentSkipped || referencesSkipped))
    ? ApplicationStatus.AWAITING_COMPLETION
    : ApplicationStatus.SUBMITTED;

  // Fee info (stored for future unlock-matching payment)
  const fee = this.getFeeMinor(dto.type);

  const applicationData = {
    type: dto.type,
    name: dto.name,
    email: dto.email.toLowerCase(),
    notes: dto.notes,

    // Company — mandatory
    companyName: dto.companyName,
    companyWebsite: dto.companyWebsite,
    companyStage: dto.companyStage,
    needArea: dto.needArea,
    targetMarkets: dto.targetMarkets,
    engagementModel: dto.engagementModel,
    budgetRange: dto.budgetRange,
    urgency: dto.urgency,

    // Company — optional
    salesMotion: dto.salesMotion,
    teamStructure: dto.teamStructure,
    hasDeck: dto.hasDeck,
    hasDemo: dto.hasDemo,
    hasCrm: dto.hasCrm,
    previousAttempts: dto.previousAttempts,
    idealOutcome90d: dto.idealOutcome90d,
    specificTargets: dto.specificTargets,

    // Talent — profile
    location: dto.location,
    talentCategory: dto.talentCategory,
    currentRole: dto.currentRole,
    currentEmployer: dto.currentEmployer,
    employmentStatus: dto.employmentStatus as any,
    yearsExperience: dto.yearsExperience,
    seniorityLevel: dto.seniorityLevel as any,
    seniority: dto.seniority,

    // Talent — track record
    engagementPref: dto.engagementPref,
    markets: dto.markets,
    dealHistory: dto.dealHistory ? (dto.dealHistory as object[]) : undefined,
    confidenceMarkets: dto.confidenceMarkets ? (dto.confidenceMarkets as object[]) : undefined,
    languagesSpoken: dto.languagesSpoken ?? [],

    // Talent — references
    linkedInUrl: dto.linkedInUrl,
    references: dto.references ? (dto.references as object[]) : undefined,

    // Talent — assessment & commercials
    caseStudyResponse: dto.caseStudyResponse,
    availabilityHours: dto.availabilityHours as any,
    earliestStart: dto.earliestStart ? new Date(dto.earliestStart) : undefined,
    rateExpectationMin: dto.rateExpectationMin,
    rateExpectationMax: dto.rateExpectationMax,
    rateCurrency: dto.rateCurrency ?? 'USD',
    preferredStructures: dto.preferredStructures ?? [],

    // Signup flow control
    assessmentSkipped,
    referencesSkipped,
    assessmentCompletedAt: (isTalent && !assessmentSkipped && dto.caseStudyResponse) ? new Date() : undefined,
    referencesCompletedAt: (isTalent && !referencesSkipped && dto.references?.length >= 2) ? new Date() : undefined,

    // Payment meta (stored for later unlock — no payment at signup)
    paymentProvider: fee.provider,
    feeAmountMinor: fee.amount,
    feeCurrency: fee.currency,
    feeAmountUsd: this.getFeeAmount(dto.type),
  };

  // Create application with correct initial status (NOT PENDING_PAYMENT)
  const application = await this.prisma.application.create({
    data: { ...applicationData, status: initialStatus },
  });

  this.logger.log(`Application ${application.id} created (${initialStatus}) for ${dto.email} — FREE SIGNUP`);

  // Send confirmation email
  this.emailService
    .sendApplicationReceived({
      id: application.id,
      name: application.name,
      email: application.email,
      type: application.type,
    })
    .catch((err) => this.logger.error(`Failed to send confirmation email: ${err.message}`));

  // Provision account immediately (user + org + membership)
  const sessionData = await this.provisionAccountWithPassword({
    id: application.id,
    name: application.name,
    email: application.email,
    type: application.type,
    companyName: dto.companyName ?? null,
    password: dto.password,
  });

  // For companies: trigger internal matching in background
  if (dto.type === ApplicationTypeDto.COMPANY) {
    this.triggerInternalMatching(application.id).catch((err) =>
      this.logger.error(`Failed to trigger internal matching: ${err.message}`),
    );
  }

  // For talent with assessment data: trigger AI pre-screen
  if (isTalent && !assessmentSkipped && dto.caseStudyResponse) {
    this.aiWorkflow
      .generatePreScreenForApplication(application.id)
      .catch((err) => this.logger.error(`Failed to trigger pre-screen: ${err.message}`));
  }

  return {
    applicationId: application.id,
    status: initialStatus,
    provider: 'NONE',
    dummyMode: this.isDummyMode(),
    // Session data for auto-login
    session: sessionData,
  };
}
```

#### 2.3c — Add provisionAccountWithPassword() method

Add this new private method (after the existing `provisionAccount` method):

```typescript
/**
 * Provision a User + Organization + Membership during FREE signup.
 * Hashes password if provided. Returns session data for auto-login.
 */
private async provisionAccountWithPassword(application: {
  id: string;
  name: string;
  email: string;
  type: string;
  companyName?: string | null;
  password?: string;
}): Promise<{ userId: string; orgId: string; role: string } | null> {
  try {
    const existing = await this.prisma.user.findUnique({
      where: { email: application.email },
    });

    if (existing) {
      // Account already exists — return existing data for session
      const membership = await this.prisma.membership.findFirst({
        where: { userId: existing.id },
      });
      return {
        userId: existing.id,
        orgId: membership?.orgId ?? '',
        role: membership?.membershipRole ?? 'OPERATOR',
      };
    }

    const isCompany = application.type === 'COMPANY';
    const orgType: OrgType = isCompany ? OrgType.STARTUP : OrgType.OPERATOR_ENTITY;
    const orgName = isCompany
      ? (application.companyName ?? `${application.name}'s Company`)
      : `${application.name} (Operator)`;
    const membershipRole: MembershipRole = isCompany
      ? MembershipRole.STARTUP_ADMIN
      : MembershipRole.OPERATOR;

    // Hash password if provided
    const passwordHash = application.password
      ? await bcrypt.hash(application.password, 10)
      : null;

    const result = await this.prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: { name: orgName, orgType, country: isCompany ? 'IN' : undefined },
      });

      const user = await tx.user.create({
        data: {
          name: application.name,
          email: application.email,
          passwordHash,
          status: UserStatus.PENDING_APPROVAL,
        },
      });

      await tx.membership.create({
        data: {
          userId: user.id,
          orgId: org.id,
          membershipRole,
          status: 'ACTIVE', // Active immediately (not PENDING — no payment gate)
        },
      });

      return { userId: user.id, orgId: org.id, role: membershipRole };
    });

    this.logger.log(`Account provisioned (free signup) for ${application.email} (${application.type})`);

    // Cross-verify references if talent provided them
    this.runCrossVerifyForApplication(application.id).catch((err) =>
      this.logger.error(`Cross-verify pipeline failed: ${err.message}`),
    );

    return result;
  } catch (err: any) {
    this.logger.error(`Failed to provision account for ${application.email}: ${err.message}`);
    return null;
  }
}
```

#### 2.3d — Add triggerInternalMatching() method

Add this private method (after `provisionAccountWithPassword`):

```typescript
/**
 * Trigger internal matching for a company application.
 * Creates a StartupProfile from the application data, then runs the matching algorithm.
 * Results are stored but NOT revealed until payment.
 */
private async triggerInternalMatching(applicationId: string): Promise<void> {
  const app = await this.prisma.application.findUnique({
    where: { id: applicationId },
  });
  if (!app || app.type !== 'COMPANY') return;

  // Check if a startup profile already exists for this company's org
  const user = await this.prisma.user.findUnique({
    where: { email: app.email },
    include: { memberships: { include: { organization: true } } },
  });
  if (!user) return;

  const org = user.memberships[0]?.organization;
  if (!org) return;

  // Check if startup profile already exists
  const existingProfile = await this.prisma.startupProfile.findUnique({
    where: { startupId: org.id },
  });

  if (existingProfile) {
    this.logger.log(`Startup profile already exists for org ${org.id} — skipping creation`);
    return;
  }

  // Map application data to startup profile fields
  const targetMarketMap: Record<string, string> = {
    'EU': 'EU', 'US': 'US', 'UK': 'EU', 'Australia': 'AU', 'AU': 'AU',
    'Middle East': 'REST_OF_WORLD', 'Southeast Asia': 'REST_OF_WORLD',
    'Rest of World': 'REST_OF_WORLD',
  };

  const targetMarkets = (app.targetMarkets?.split(',') ?? [])
    .map(m => targetMarketMap[m.trim()] ?? 'REST_OF_WORLD')
    .filter((v, i, arr) => arr.indexOf(v) === i) as any[];

  const stageMap: Record<string, string> = {
    'Pre-Seed': 'PRE_SEED', 'Seed': 'SEED', 'Series A': 'SERIES_A',
    'Series B+': 'SERIES_B_PLUS', 'Bootstrapped': 'BOOTSTRAPPED',
  };

  const budgetMap: Record<string, string> = {
    '$2,000\u2013$5,000': 'TWO_TO_5K', '$5,000\u2013$10,000': 'FIVE_TO_10K',
    '$10,000\u2013$25,000': 'ABOVE_10K', '$25,000+': 'ABOVE_10K',
  };

  const motionMap: Record<string, string> = {
    'Outbound': 'OUTBOUND', 'Inbound': 'INBOUND', 'Partner-led': 'PARTNER_LED',
    'Product-led': 'PRODUCT_LED', 'Blended': 'BLENDED',
  };

  try {
    const profile = await this.prisma.startupProfile.create({
      data: {
        startupId: org.id,
        industry: app.needArea ?? 'General',
        stage: (stageMap[app.companyStage ?? ''] ?? 'BOOTSTRAPPED') as any,
        targetMarkets: targetMarkets.length > 0 ? targetMarkets : ['REST_OF_WORLD'],
        salesMotion: (motionMap[app.salesMotion ?? ''] ?? 'OUTBOUND') as any,
        budgetBand: (budgetMap[app.budgetRange ?? ''] ?? 'TWO_TO_5K') as any,
        hasDeck: app.hasDeck ?? false,
        hasProductDemo: app.hasDemo ?? false,
        status: 'SUBMITTED',
      },
    });

    this.logger.log(`StartupProfile created (${profile.id}) from application ${applicationId}`);

    // NOTE: Matching will only run if there are verified operators in the DB.
    // In dev/early-stage, this may return no results — that's expected.
    // The matching algorithm is in MatchingService.generateShortlist().
    // We do NOT call it here yet because it requires verified operators.
    // When operators exist, an admin or cron job should trigger matching.
  } catch (err: any) {
    this.logger.error(`Failed to create startup profile from application: ${err.message}`);
  }
}
```

#### 2.3e — Update getFeeMinor() amounts

Update the company fee from ₹15,000 to ₹8,500:

```typescript
private getFeeMinor(type: ApplicationTypeDto): { amount: number; currency: string; provider: PaymentProvider } {
  if (type === ApplicationTypeDto.COMPANY) {
    return { amount: 850000, currency: 'INR', provider: PaymentProvider.RAZORPAY };
  }
  return { amount: 5000, currency: 'USD', provider: PaymentProvider.STRIPE };
}

private getFeeAmount(type: ApplicationTypeDto): number {
  return type === ApplicationTypeDto.COMPANY ? 100 : 50;
}
```

**DO NOT** delete the existing payment verification methods (`verifyRazorpayPayment`, `dummyConfirmPayment`, `handleRazorpayWebhook`, `handleCheckoutCompleted`). They will be reused for the "unlock matching" payment in Task 2.5.

**Expected outcome:** `POST /api/v1/applications` now creates a free account immediately with no payment. Returns session data for auto-login. Companies get internal matching triggered. Talent with skipped steps get `AWAITING_COMPLETION` status.

---

## Task 2.4 — Backend: New Endpoints for Dashboard Completion + Unlock Matching

**Files to create:**
- `backend/src/applications/dto/complete-assessment.dto.ts`
- `backend/src/applications/dto/complete-references.dto.ts`
- `backend/src/applications/dto/unlock-matching.dto.ts`

**Files to modify:**
- `backend/src/applications/applications.service.ts`
- `backend/src/applications/applications.controller.ts`

**What to do:**

### 2.4a — Create DTOs

Create `backend/src/applications/dto/complete-assessment.dto.ts`:
```typescript
import { IsString, IsOptional, IsInt, IsArray, MinLength } from 'class-validator';

export class CompleteAssessmentDto {
  @IsString()
  @MinLength(100, { message: 'Case study response must be at least 100 characters.' })
  caseStudyResponse: string;

  @IsOptional()
  @IsString()
  availabilityHours?: string;

  @IsOptional()
  @IsString()
  earliestStart?: string;

  @IsOptional()
  @IsInt()
  rateExpectationMin?: number;

  @IsOptional()
  @IsInt()
  rateExpectationMax?: number;

  @IsOptional()
  @IsString()
  rateCurrency?: string;

  @IsOptional()
  @IsArray()
  preferredStructures?: string[];
}
```

Create `backend/src/applications/dto/complete-references.dto.ts`:
```typescript
import { IsArray, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsEmail } from 'class-validator';

class ReferenceDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  relationship?: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  linkedIn?: string;
}

export class CompleteReferencesDto {
  @IsArray()
  @ArrayMinSize(2, { message: 'At least 2 references are required.' })
  @ValidateNested({ each: true })
  @Type(() => ReferenceDto)
  references: ReferenceDto[];
}
```

Create `backend/src/applications/dto/unlock-matching.dto.ts`:
```typescript
import { IsString } from 'class-validator';

export class UnlockMatchingRazorpayDto {
  @IsString()
  applicationId: string;

  @IsString()
  razorpayOrderId: string;

  @IsString()
  razorpayPaymentId: string;

  @IsString()
  razorpaySignature: string;
}

export class UnlockMatchingStripeDto {
  @IsString()
  applicationId: string;
}
```

### 2.4b — Add service methods

Add these methods to `applications.service.ts`:

```typescript
/**
 * Complete assessment for a talent application (from dashboard).
 * Updates the application with assessment data and marks assessmentSkipped = false.
 */
async completeAssessment(email: string, dto: CompleteAssessmentDto) {
  const application = await this.prisma.application.findFirst({
    where: { email: email.toLowerCase(), type: 'TALENT' },
  });
  if (!application) throw new NotFoundException('No talent application found.');

  const updated = await this.prisma.application.update({
    where: { id: application.id },
    data: {
      caseStudyResponse: dto.caseStudyResponse,
      availabilityHours: dto.availabilityHours as any,
      earliestStart: dto.earliestStart ? new Date(dto.earliestStart) : undefined,
      rateExpectationMin: dto.rateExpectationMin,
      rateExpectationMax: dto.rateExpectationMax,
      rateCurrency: dto.rateCurrency ?? 'USD',
      preferredStructures: dto.preferredStructures ?? [],
      assessmentSkipped: false,
      assessmentCompletedAt: new Date(),
      // If references are also complete, move to SUBMITTED
      status: application.referencesCompletedAt
        ? ApplicationStatus.SUBMITTED
        : ApplicationStatus.AWAITING_COMPLETION,
    },
  });

  this.logger.log(`Assessment completed for application ${application.id}`);

  // Trigger AI pre-screen now that assessment is available
  this.aiWorkflow
    .generatePreScreenForApplication(application.id)
    .catch((err) => this.logger.error(`Failed to trigger pre-screen: ${err.message}`));

  return { applicationId: updated.id, status: updated.status };
}

/**
 * Complete references for a talent application (from dashboard).
 * Updates the application with reference data and marks referencesSkipped = false.
 */
async completeReferences(email: string, dto: CompleteReferencesDto) {
  const application = await this.prisma.application.findFirst({
    where: { email: email.toLowerCase(), type: 'TALENT' },
  });
  if (!application) throw new NotFoundException('No talent application found.');

  const updated = await this.prisma.application.update({
    where: { id: application.id },
    data: {
      references: dto.references as any,
      referencesSkipped: false,
      referencesCompletedAt: new Date(),
      // If assessment is also complete, move to SUBMITTED
      status: application.assessmentCompletedAt
        ? ApplicationStatus.SUBMITTED
        : ApplicationStatus.AWAITING_COMPLETION,
    },
  });

  this.logger.log(`References completed for application ${application.id}`);

  // Trigger cross-verification
  this.runCrossVerifyForApplication(application.id).catch((err) =>
    this.logger.error(`Cross-verify pipeline failed: ${err.message}`),
  );

  return { applicationId: updated.id, status: updated.status };
}

/**
 * Get the completion status for the current user's application.
 * Used by the dashboard to show the checklist and enable/disable the payment button.
 */
async getCompletionStatus(email: string) {
  const application = await this.prisma.application.findFirst({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      type: true,
      status: true,
      assessmentSkipped: true,
      referencesSkipped: true,
      assessmentCompletedAt: true,
      referencesCompletedAt: true,
      matchingUnlocked: true,
      matchingUnlockedAt: true,
      feeAmountMinor: true,
      feeCurrency: true,
      paymentProvider: true,
    },
  });
  if (!application) throw new NotFoundException('No application found.');

  const isTalent = application.type === 'TALENT';
  const assessmentComplete = !isTalent || !!application.assessmentCompletedAt;
  const referencesComplete = !isTalent || !!application.referencesCompletedAt;
  const canPay = assessmentComplete && referencesComplete && !application.matchingUnlocked;

  return {
    ...application,
    assessmentComplete,
    referencesComplete,
    canPay,
  };
}

/**
 * Initiate the "unlock matching" payment.
 * Company → Razorpay order. Talent → Stripe checkout session.
 * Only allowed when all required steps are complete.
 */
async initiateUnlockPayment(email: string) {
  const application = await this.prisma.application.findFirst({
    where: { email: email.toLowerCase() },
  });
  if (!application) throw new NotFoundException('No application found.');

  if (application.matchingUnlocked) {
    throw new BadRequestException('Matching is already unlocked.');
  }

  // For talent: check that assessment and references are complete
  if (application.type === 'TALENT') {
    if (!application.assessmentCompletedAt) {
      throw new BadRequestException('Please complete your assessment before unlocking matching.');
    }
    if (!application.referencesCompletedAt) {
      throw new BadRequestException('Please complete your references before unlocking matching.');
    }
  }

  const fee = this.getFeeMinor(application.type as ApplicationTypeDto);

  // ── Company → Razorpay order ──────────────────────────────────
  if (application.type === 'COMPANY') {
    // In dummy mode: auto-confirm
    if (this.isDummyMode()) {
      await this.unlockMatching(application.id);
      return {
        applicationId: application.id,
        provider: 'RAZORPAY',
        dummyMode: true,
        unlocked: true,
      };
    }

    const order = await this.razorpay.createOrder({
      amountPaisa: fee.amount,
      currency: fee.currency,
      receipt: `unlock_${application.id.slice(0, 30)}`,
      notes: { applicationId: application.id, purpose: 'unlock_matching' },
    });

    // Store order ID for verification
    await this.prisma.application.update({
      where: { id: application.id },
      data: { razorpayOrderId: order.id },
    });

    return {
      applicationId: application.id,
      provider: 'RAZORPAY',
      keyId: this.razorpay.publishableKeyId,
      orderId: order.id,
      amount: fee.amount,
      currency: fee.currency,
      prefill: { name: application.name, email: application.email },
      dummyMode: false,
    };
  }

  // ── Talent → Stripe ───────────────────────────────────────────
  if (this.isDummyMode()) {
    await this.unlockMatching(application.id);
    return {
      applicationId: application.id,
      provider: 'STRIPE',
      dummyMode: true,
      unlocked: true,
    };
  }

  // TODO: Create real Stripe Checkout session when Stripe is fully integrated
  const dummySessionId = `cs_unlock_${Date.now()}`;
  await this.prisma.application.update({
    where: { id: application.id },
    data: { stripeSessionId: dummySessionId },
  });

  const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:3001');
  return {
    applicationId: application.id,
    provider: 'STRIPE',
    checkoutUrl: `${frontendUrl}/dashboard/unlock?session=${dummySessionId}`,
    amount: fee.amount,
    currency: fee.currency,
    dummyMode: false,
  };
}

/**
 * Mark matching as unlocked after payment is confirmed.
 * This is the "moment of truth" — reveals match data.
 */
private async unlockMatching(applicationId: string): Promise<void> {
  const updated = await this.prisma.application.update({
    where: { id: applicationId },
    data: {
      matchingUnlocked: true,
      matchingUnlockedAt: new Date(),
      paidAt: new Date(),
    },
  });

  this.logger.log(`Matching unlocked for application ${applicationId}`);

  // For companies: trigger full AI diagnosis now
  if (updated.type === 'COMPANY') {
    this.aiWorkflow
      .generateDiagnosisForApplication(applicationId)
      .catch((err) => this.logger.error(`Failed to trigger diagnosis: ${err.message}`));
  }
}

/**
 * Verify Razorpay payment for unlock-matching flow.
 * Similar to verifyRazorpayPayment but calls unlockMatching instead of provisionAccount.
 */
async verifyUnlockPayment(params: {
  applicationId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const application = await this.prisma.application.findUnique({
    where: { id: params.applicationId },
  });
  if (!application) throw new NotFoundException('Application not found.');

  if (application.matchingUnlocked) {
    return { success: true, applicationId: params.applicationId, unlocked: true };
  }

  const isValid = this.razorpay.verifyPaymentSignature({
    orderId: params.razorpayOrderId,
    paymentId: params.razorpayPaymentId,
    signature: params.razorpaySignature,
  });

  if (!isValid) {
    throw new BadRequestException('Payment verification failed — invalid signature.');
  }

  // Store payment ID
  await this.prisma.application.update({
    where: { id: params.applicationId },
    data: { razorpayPaymentId: params.razorpayPaymentId },
  });

  await this.unlockMatching(params.applicationId);

  return { success: true, applicationId: params.applicationId, unlocked: true };
}
```

Import the new DTOs at the top:
```typescript
import { CompleteAssessmentDto } from './dto/complete-assessment.dto';
import { CompleteReferencesDto } from './dto/complete-references.dto';
```

### 2.4c — Add controller endpoints

Add these routes to `applications.controller.ts`:

```typescript
@Post('complete-assessment')
@UseGuards(AuthGuard)
async completeAssessment(@Req() req: any, @Body() dto: CompleteAssessmentDto) {
  return this.applicationsService.completeAssessment(req.session?.user?.email, dto);
}

@Post('complete-references')
@UseGuards(AuthGuard)
async completeReferences(@Req() req: any, @Body() dto: CompleteReferencesDto) {
  return this.applicationsService.completeReferences(req.session?.user?.email, dto);
}

@Get('completion-status')
@UseGuards(AuthGuard)
async getCompletionStatus(@Req() req: any) {
  return this.applicationsService.getCompletionStatus(req.session?.user?.email);
}

@Post('initiate-unlock')
@UseGuards(AuthGuard)
async initiateUnlockPayment(@Req() req: any) {
  return this.applicationsService.initiateUnlockPayment(req.session?.user?.email);
}

@Post('verify-unlock')
async verifyUnlockPayment(@Body() dto: UnlockMatchingRazorpayDto) {
  return this.applicationsService.verifyUnlockPayment(dto);
}
```

Import the new DTOs and ensure `AuthGuard` is imported.

**Expected outcome:** New endpoints:
- `POST /api/v1/applications/complete-assessment` — talent submits assessment from dashboard
- `POST /api/v1/applications/complete-references` — talent submits references from dashboard
- `GET /api/v1/applications/completion-status` — dashboard checks what's left to do
- `POST /api/v1/applications/initiate-unlock` — initiates payment for matching unlock
- `POST /api/v1/applications/verify-unlock` — verifies Razorpay payment for unlock

---

## Task 2.5 — Frontend: Auto-Login After Free Signup

**Files to modify:**
- `frontend/src/app/for-companies/apply/page.tsx`
- `frontend/src/app/for-talent/apply/page.tsx`

**What to do:**

### For BOTH forms:

#### 2.5a — Add password field to the form

Add a `password` field to the form state:
```typescript
// In the FormState type:
password: string;

// In INITIAL:
password: '',
```

Add a password input field to Step 0 (after the email field):
```tsx
<div className={styles.field}>
  <label>Password <span className={styles.req}>*</span></label>
  <input type="password" required value={form.password}
    onChange={e => set('password', e.target.value)}
    placeholder="At least 8 characters"
    minLength={8}
    disabled={loading} />
</div>
```

#### 2.5b — Include password in the submit payload

In `handleSubmit`, add `password: form.password` to the payload sent to the API.

#### 2.5c — Auto-login after successful submission

Replace the current post-submit logic (which shows a success message and/or redirects to a payment page) with:

```typescript
// After successful API response:
const data = await res.json();
if (!res.ok) {
  const msg = Array.isArray(data?.message) ? data.message[0] : data?.message;
  throw new Error(msg || 'Submission failed.');
}

// Auto-login: the backend has created the session.
// Redirect to the appropriate dashboard.
if (data.session) {
  // Store session data if using client-side auth context
  // (depends on your auth implementation — may need to call /api/v1/auth/me to refresh)
  window.location.href = form.type === 'COMPANY'
    ? '/startup/dashboard'
    : '/operator/dashboard';
} else {
  setSubmitted(true);
  setTimeout(() => router.push(`/application/status?id=${data.applicationId}`), 1500);
}
```

**For the talent form specifically:**
- Also update `handleSubmitWithoutAssessment()` (from Phase 1 Task 1.7) to include the password field and use the same auto-login redirect.

#### 2.5d — Update form validation to include password

Add `form.password && form.password.length >= 8` to the validation checks (e.g. `isFormValid` or `isStep0Valid`).

#### 2.5e — Remove payment modal code

**Company form:** Remove the Razorpay modal initialization code. The `handleSubmit` no longer needs to open a payment modal — it just submits the form and redirects.

Search for:
- `razorpay` references in the component
- `window.Razorpay` or `new Razorpay`
- The payment modal callback handler
- The Razorpay script tag loading

Comment these out or remove them. Add a `// TODO: Payment moved to dashboard unlock flow` comment.

**Talent form:** Remove any Stripe checkout redirect logic. Same approach.

**Expected outcome:** Both signup forms now include a password field. After submission, the user is automatically logged in and redirected to their dashboard. No payment is initiated during signup.

---

## Task 2.6 — Frontend: Session Handling After Free Signup

**Files to modify:**
- `backend/src/applications/applications.controller.ts`
- `frontend/src/app/for-companies/apply/page.tsx`
- `frontend/src/app/for-talent/apply/page.tsx`

**What to do:**

The auto-login needs the backend to set a session cookie when the application is created.

### 2.6a — Backend: Set session on createApplication response

In the `applications.controller.ts`, find the `create` method (the POST handler for `/api/v1/applications`). After calling `this.applicationsService.createApplication(dto)`, set the session:

```typescript
@Post()
async create(@Req() req: any, @Body() dto: CreateApplicationDto) {
  const result = await this.applicationsService.createApplication(dto);

  // Set session for auto-login
  if (result.session && req.session) {
    req.session.user = {
      id: result.session.userId,
      name: dto.name,
      email: dto.email,
      role: result.session.role,
      orgId: result.session.orgId,
      status: 'PENDING_APPROVAL',
    };
  }

  return result;
}
```

### 2.6b — Frontend: Use window.location for hard redirect

In both signup forms, after the successful API call, use `window.location.href` (not `router.push`) to force a full page reload that picks up the new session cookie:

```typescript
// Company form
window.location.href = '/startup/dashboard';

// Talent form
window.location.href = '/operator/dashboard';
```

**Expected outcome:** After free signup, the session cookie is set server-side and the user is redirected to their dashboard with full authentication.

---

## Task 2.7 — Frontend: Dashboard Paywall with Blurred Preview Cards

**Files to create:**
- `frontend/src/components/BlurredMatchCard.tsx`
- `frontend/src/components/BlurredMatchCard.module.css`
- `frontend/src/components/UnlockMatchingCTA.tsx`
- `frontend/src/components/UnlockMatchingCTA.module.css`

**Files to modify:**
- `frontend/src/app/startup/dashboard/page.tsx`

**What to do:**

### 2.7a — Create BlurredMatchCard component

Create `frontend/src/components/BlurredMatchCard.tsx`:
```tsx
'use client';

import styles from './BlurredMatchCard.module.css';

interface BlurredMatchCardProps {
  matchScore: number;
  region: string;
  lane: string;
  yearsExperience: number;
  locked: boolean;
}

export function BlurredMatchCard({ matchScore, region, lane, yearsExperience, locked }: BlurredMatchCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.scoreRow}>
        <span className={styles.scoreLabel}>Match</span>
        <span className={styles.scoreValue}>{matchScore}/100</span>
      </div>
      <div className={styles.meta}>
        <span className={styles.tag}>{region}</span>
        <span className={styles.tag}>{lane.replace(/_/g, ' ').toLowerCase()}</span>
      </div>
      <div className={styles.experience}>{yearsExperience}+ years experience</div>
      {locked && (
        <div className={styles.lockedOverlay}>
          <div className={styles.blurredName}>████████ ██████</div>
          <div className={styles.blurredCompany}>████████████</div>
          <div className={styles.lockIcon}>🔒</div>
        </div>
      )}
      {!locked && (
        <div className={styles.unlockedBadge}>Unlocked</div>
      )}
    </div>
  );
}
```

Create `frontend/src/components/BlurredMatchCard.module.css`:
```css
.card {
  border: 1px solid var(--color-border);
  padding: 1.25rem;
  background: var(--color-bg);
  position: relative;
  overflow: hidden;
}

.scoreRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.scoreLabel {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

.scoreValue {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.meta {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.tag {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.2rem 0.5rem;
  background: var(--color-surface, #f0ece6);
  color: var(--color-text-secondary);
  text-transform: capitalize;
}

.experience {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
}

.lockedOverlay {
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
}

.blurredName {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-muted);
  filter: blur(4px);
  user-select: none;
  margin-bottom: 0.25rem;
}

.blurredCompany {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  filter: blur(4px);
  user-select: none;
  margin-bottom: 0.5rem;
}

.lockIcon {
  font-size: 1rem;
  text-align: center;
}

.unlockedBadge {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-accent, #2e7d32);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-border);
}
```

### 2.7b — Create UnlockMatchingCTA component

Create `frontend/src/components/UnlockMatchingCTA.tsx`:
```tsx
'use client';

import { useState } from 'react';
import styles from './UnlockMatchingCTA.module.css';

interface UnlockMatchingCTAProps {
  canPay: boolean;
  amount: string;         // e.g. "₹8,500" or "$50"
  provider: string;       // "RAZORPAY" or "STRIPE"
  onUnlock: () => Promise<void>;
  reason?: string;        // Why payment is disabled (e.g. "Complete your assessment first")
}

export function UnlockMatchingCTA({ canPay, amount, provider, onUnlock, reason }: UnlockMatchingCTAProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!canPay || loading) return;
    setLoading(true);
    try {
      await onUnlock();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.cta}>
      <div className={styles.lockRow}>
        <span className={styles.lockIcon}>🔒</span>
        <span className={styles.lockText}>Unlock matching — {amount} one-time</span>
      </div>
      <button
        className={styles.payBtn}
        disabled={!canPay || loading}
        onClick={handleClick}
      >
        {loading ? 'Processing...' : `Pay ${amount}`}
      </button>
      {!canPay && reason && (
        <p className={styles.disabledNote}>{reason}</p>
      )}
    </div>
  );
}
```

Create `frontend/src/components/UnlockMatchingCTA.module.css`:
```css
.cta {
  border: 1px solid var(--color-border);
  padding: 1.5rem;
  text-align: center;
  background: var(--color-bg);
}

.lockRow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.lockIcon {
  font-size: 1.25rem;
}

.lockText {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.payBtn {
  display: inline-block;
  padding: 0.75rem 2rem;
  background: var(--color-text-primary, #0f0f0f);
  color: var(--color-bg, #f5f3ef);
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.payBtn:hover:not(:disabled) {
  opacity: 0.85;
}

.payBtn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.disabledNote {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-top: 0.75rem;
}
```

### 2.7c — Update startup dashboard to show blurred previews

Modify `frontend/src/app/startup/dashboard/page.tsx`:

1. Import the new components:
```tsx
import { BlurredMatchCard } from '@/components/BlurredMatchCard';
import { UnlockMatchingCTA } from '@/components/UnlockMatchingCTA';
```

2. Add state for completion status and matches:
```tsx
const [completionStatus, setCompletionStatus] = useState<any>(null);
const [matchPreviews, setMatchPreviews] = useState<any[]>([]);
```

3. Fetch completion status on mount:
```tsx
useEffect(() => {
  fetch('/api/v1/applications/completion-status', { credentials: 'include' })
    .then(res => res.json())
    .then(data => setCompletionStatus(data))
    .catch(err => console.error('Failed to load completion status:', err));
}, []);
```

4. Add a "Your top matches" section after the existing KPI stats:
```tsx
{/* ── Matching Preview ── */}
<section className={styles.section}>
  <h3 className={styles.sectionTitle}>Your top matches</h3>
  {matchPreviews.length > 0 ? (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
      {matchPreviews.map((match, i) => (
        <BlurredMatchCard
          key={i}
          matchScore={match.matchScore}
          region={match.region || 'TBD'}
          lane={match.lane || 'General'}
          yearsExperience={match.yearsExperience || 0}
          locked={!completionStatus?.matchingUnlocked}
        />
      ))}
    </div>
  ) : (
    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
      We&apos;re preparing your matches. Check back soon.
    </p>
  )}

  {completionStatus && !completionStatus.matchingUnlocked && (
    <UnlockMatchingCTA
      canPay={completionStatus.canPay}
      amount={completionStatus.feeCurrency === 'INR' ? '₹8,500' : '$100'}
      provider={completionStatus.paymentProvider || 'RAZORPAY'}
      onUnlock={async () => {
        const res = await fetch('/api/v1/applications/initiate-unlock', {
          method: 'POST',
          credentials: 'include',
        });
        const data = await res.json();
        if (data.dummyMode && data.unlocked) {
          window.location.reload();
          return;
        }
        // TODO: Open Razorpay modal with data.orderId, data.keyId, etc.
        // For now, show a message
        alert('Payment flow coming soon. In dev mode, set DUMMY_PAYMENT_MODE=true.');
      }}
      reason={!completionStatus.canPay ? 'Complete all required steps first.' : undefined}
    />
  )}
</section>
```

**Expected outcome:** Startup dashboard shows blurred match preview cards with scores, regions, and experience visible but names/details hidden. An "Unlock matching" CTA with the payment button appears below. In dummy mode, clicking pay unlocks immediately.

---

## Task 2.8 — Frontend: Talent Dashboard Completion Checklist

**Files to create:**
- `frontend/src/components/CompletionChecklist.tsx`
- `frontend/src/components/CompletionChecklist.module.css`

**Files to modify:**
- `frontend/src/app/operator/dashboard/page.tsx`

**What to do:**

### 2.8a — Create CompletionChecklist component

Create `frontend/src/components/CompletionChecklist.tsx`:
```tsx
'use client';

import styles from './CompletionChecklist.module.css';

interface ChecklistItem {
  label: string;
  complete: boolean;
  actionLabel?: string;
  actionHref?: string;
  onClick?: () => void;
}

export function CompletionChecklist({ items, title = 'Profile completion' }: { items: ChecklistItem[]; title?: string }) {
  const completedCount = items.filter(i => i.complete).length;
  const totalCount = items.length;

  return (
    <div className={styles.checklist}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        <span className={styles.progress}>{completedCount}/{totalCount} complete</span>
      </div>
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${(completedCount / totalCount) * 100}%` }} />
      </div>
      <div className={styles.items}>
        {items.map((item, i) => (
          <div key={i} className={`${styles.item} ${item.complete ? styles.itemComplete : ''}`}>
            <span className={styles.icon}>{item.complete ? '✅' : '⬜'}</span>
            <span className={styles.label}>{item.label}</span>
            {!item.complete && item.actionLabel && (
              item.actionHref ? (
                <a href={item.actionHref} className={styles.action}>{item.actionLabel}</a>
              ) : (
                <button type="button" className={styles.action} onClick={item.onClick}>{item.actionLabel}</button>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

Create `frontend/src/components/CompletionChecklist.module.css`:
```css
.checklist {
  border: 1px solid var(--color-border);
  padding: 1.5rem;
  background: var(--color-bg);
  margin-bottom: 1.5rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.progress {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.progressBar {
  height: 4px;
  background: var(--color-border);
  margin-bottom: 1.25rem;
  overflow: hidden;
}

.progressFill {
  height: 100%;
  background: var(--color-text-primary, #0f0f0f);
  transition: width 0.3s ease;
}

.items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.itemComplete .label {
  color: var(--color-text-muted);
}

.icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.label {
  font-size: 0.9rem;
  color: var(--color-text-primary);
  flex: 1;
}

.action {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-primary);
  text-decoration: underline;
  text-underline-offset: 3px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.action:hover {
  color: var(--color-accent, #2e7d32);
}
```

### 2.8b — Update operator dashboard

Modify `frontend/src/app/operator/dashboard/page.tsx`:

1. Import new components:
```tsx
import { CompletionChecklist } from '@/components/CompletionChecklist';
import { UnlockMatchingCTA } from '@/components/UnlockMatchingCTA';
```

2. Add state for completion status:
```tsx
const [completionStatus, setCompletionStatus] = useState<any>(null);
```

3. Fetch completion status on mount:
```tsx
useEffect(() => {
  fetch('/api/v1/applications/completion-status', { credentials: 'include' })
    .then(res => res.json())
    .then(data => setCompletionStatus(data))
    .catch(err => console.error('Failed to load completion status:', err));
}, []);
```

4. Add the completion checklist at the top of the dashboard content (before the scoring section):
```tsx
{completionStatus && !completionStatus.matchingUnlocked && (
  <>
    <CompletionChecklist
      items={[
        {
          label: 'Profile basics',
          complete: true,  // Always true if they're on the dashboard
        },
        {
          label: 'Track record',
          complete: true,  // Always true — was required during signup
        },
        {
          label: 'References',
          complete: completionStatus.referencesComplete,
          actionLabel: 'Complete now',
          actionHref: '/operator/dashboard/references',
        },
        {
          label: 'Assessment',
          complete: completionStatus.assessmentComplete,
          actionLabel: 'Complete now',
          actionHref: '/operator/dashboard/assessment',
        },
      ]}
    />

    <UnlockMatchingCTA
      canPay={completionStatus.canPay}
      amount="$50"
      provider="STRIPE"
      onUnlock={async () => {
        const res = await fetch('/api/v1/applications/initiate-unlock', {
          method: 'POST',
          credentials: 'include',
        });
        const data = await res.json();
        if (data.dummyMode && data.unlocked) {
          window.location.reload();
          return;
        }
        // TODO: Stripe checkout redirect
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        }
      }}
      reason={
        !completionStatus.assessmentComplete && !completionStatus.referencesComplete
          ? 'Complete your references and assessment to unlock matching.'
          : !completionStatus.assessmentComplete
          ? 'Complete your assessment to unlock matching.'
          : !completionStatus.referencesComplete
          ? 'Complete your references to unlock matching.'
          : undefined
      }
    />
  </>
)}
```

**Expected outcome:** Talent dashboard shows a completion checklist with progress bar. Items that are incomplete have "Complete now" links. The "Unlock matching — $50" payment button is disabled until all items are complete.

---

## Task 2.9 — Frontend: Talent Dashboard — Complete References + Assessment Pages

**Files to create:**
- `frontend/src/app/operator/dashboard/references/page.tsx`
- `frontend/src/app/operator/dashboard/assessment/page.tsx`

**What to do:**

These are standalone pages where talent can complete their skipped references and assessment from the dashboard.

### 2.9a — References completion page

Create `frontend/src/app/operator/dashboard/references/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Reference {
  name: string;
  title: string;
  company: string;
  relationship: string;
  email: string;
  linkedIn: string;
}

export default function CompleteReferencesPage() {
  const router = useRouter();
  const [references, setReferences] = useState<Reference[]>([
    { name: '', title: '', company: '', relationship: '', email: '', linkedIn: '' },
    { name: '', title: '', company: '', relationship: '', email: '', linkedIn: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const updateRef = (index: number, field: keyof Reference, value: string) => {
    const updated = [...references];
    updated[index] = { ...updated[index], [field]: value };
    setReferences(updated);
  };

  const addReference = () => {
    setReferences([...references, { name: '', title: '', company: '', relationship: '', email: '', linkedIn: '' }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const filledRefs = references.filter(r => r.name && r.email);
    if (filledRefs.length < 2) {
      setError('Please provide at least 2 references with name and email.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/v1/applications/complete-references', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ references: filledRefs }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save references.');

      setSuccess(true);
      setTimeout(() => router.push('/operator/dashboard'), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>References saved</h2>
        <p>Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '640px', margin: '3rem auto', padding: '0 1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Complete your references</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
        Provide at least 2 professional references. This is required before you can unlock matching.
      </p>

      {error && (
        <div style={{ padding: '0.75rem', background: '#fef2f2', color: '#b91c1c', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {references.map((ref, i) => (
          <div key={i} style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>Reference {i + 1}{i < 2 ? ' *' : ' (optional)'}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Full name</label>
                <input type="text" value={ref.name} onChange={e => updateRef(i, 'name', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Email</label>
                <input type="email" value={ref.email} onChange={e => updateRef(i, 'email', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Title / Role</label>
                <input type="text" value={ref.title} onChange={e => updateRef(i, 'title', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Company</label>
                <input type="text" value={ref.company} onChange={e => updateRef(i, 'company', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Relationship</label>
                <input type="text" value={ref.relationship} onChange={e => updateRef(i, 'relationship', e.target.value)}
                  placeholder="e.g. Direct manager, Client"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem' }}>LinkedIn</label>
                <input type="url" value={ref.linkedIn} onChange={e => updateRef(i, 'linkedIn', e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)' }} />
              </div>
            </div>
          </div>
        ))}

        <button type="button" onClick={addReference}
          style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline', marginBottom: '2rem' }}>
          + Add another reference
        </button>

        <div>
          <button type="submit" disabled={loading}
            style={{ padding: '0.75rem 2rem', background: 'var(--color-text-primary)', color: 'var(--color-bg)', border: 'none', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>
            {loading ? 'Saving...' : 'Save references'}
          </button>
        </div>
      </form>
    </div>
  );
}
```

### 2.9b — Assessment completion page

Create `frontend/src/app/operator/dashboard/assessment/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CompleteAssessmentPage() {
  const router = useRouter();
  const [caseStudyResponse, setCaseStudyResponse] = useState('');
  const [availabilityHours, setAvailabilityHours] = useState('');
  const [earliestStart, setEarliestStart] = useState('');
  const [rateMin, setRateMin] = useState('');
  const [rateMax, setRateMax] = useState('');
  const [preferredStructures, setPreferredStructures] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const structures = ['Sprint', 'Retainer', 'Success fee', 'Hybrid (cash + equity)', 'Advisory'];

  const toggleStructure = (s: string) => {
    setPreferredStructures(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (caseStudyResponse.length < 100) {
      setError('Your case study response must be at least 100 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/v1/applications/complete-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          caseStudyResponse,
          availabilityHours: availabilityHours || undefined,
          earliestStart: earliestStart || undefined,
          rateExpectationMin: rateMin ? parseInt(rateMin, 10) : undefined,
          rateExpectationMax: rateMax ? parseInt(rateMax, 10) : undefined,
          rateCurrency: 'USD',
          preferredStructures,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save assessment.');

      setSuccess(true);
      setTimeout(() => router.push('/operator/dashboard'), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>Assessment saved</h2>
        <p>Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '640px', margin: '3rem auto', padding: '0 1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Complete your assessment</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
        This assessment helps us match you with the right companies. Take your time — there&apos;s no pressure.
      </p>

      {error && (
        <div style={{ padding: '0.75rem', background: '#fef2f2', color: '#b91c1c', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Case study */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            Case study response <span style={{ color: 'var(--color-text-muted)' }}>*</span>
          </label>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
            You are advising an Indian B2B SaaS startup ($500K ARR, 50 domestic clients) that wants to enter the EU market.
            They have no international presence, no EU team, and a $5,000/month budget for their first 90 days.
            Outline your recommended approach. (Minimum 100 words)
          </p>
          <textarea
            rows={8}
            value={caseStudyResponse}
            onChange={e => setCaseStudyResponse(e.target.value)}
            placeholder="Describe your approach..."
            style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', fontFamily: 'inherit', fontSize: '0.9rem', lineHeight: 1.6 }}
          />
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            {caseStudyResponse.split(/\s+/).filter(Boolean).length} words ({caseStudyResponse.length} characters)
          </div>
        </div>

        {/* Availability */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            Weekly availability
          </label>
          <select value={availabilityHours} onChange={e => setAvailabilityHours(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}>
            <option value="">Select...</option>
            <option value="H5_10">5-10 hours/week</option>
            <option value="H10_20">10-20 hours/week</option>
            <option value="H20_30">20-30 hours/week</option>
            <option value="FULL_FRACTIONAL">Full fractional (30+ hours)</option>
          </select>
        </div>

        {/* Earliest start */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            Earliest available start date
          </label>
          <input type="date" value={earliestStart} onChange={e => setEarliestStart(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', fontFamily: 'inherit' }} />
        </div>

        {/* Rate expectations */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            Rate expectations (USD/month)
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Min</label>
              <input type="number" value={rateMin} onChange={e => setRateMin(e.target.value)} placeholder="e.g. 3000"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Max</label>
              <input type="number" value={rateMax} onChange={e => setRateMax(e.target.value)} placeholder="e.g. 8000"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)' }} />
            </div>
          </div>
        </div>

        {/* Preferred structures */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem' }}>
            Preferred engagement structures
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {structures.map(s => (
              <button key={s} type="button" onClick={() => toggleStructure(s)}
                style={{
                  padding: '0.4rem 0.75rem',
                  border: '1px solid var(--color-border)',
                  background: preferredStructures.includes(s) ? 'var(--color-text-primary)' : 'transparent',
                  color: preferredStructures.includes(s) ? 'var(--color-bg)' : 'var(--color-text-secondary)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <button type="submit" disabled={loading || caseStudyResponse.length < 100}
            style={{
              padding: '0.75rem 2rem',
              background: 'var(--color-text-primary)',
              color: 'var(--color-bg)',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
              opacity: (loading || caseStudyResponse.length < 100) ? 0.5 : 1,
            }}>
            {loading ? 'Saving...' : 'Save assessment'}
          </button>
        </div>
      </form>
    </div>
  );
}
```

**Expected outcome:** Two new pages at `/operator/dashboard/references` and `/operator/dashboard/assessment`. Talent can complete skipped steps from their dashboard. After saving, they're redirected back to the main dashboard where the checklist updates.

---

## Summary — Phase 2 Tasks

| Task | Description | Files Changed | Depends On | Risk |
|------|-------------|---------------|------------|------|
| 2.1 | Schema migration (new fields + status) | schema.prisma | None | Low |
| 2.2 | Add password + skip fields to DTO | create-application.dto.ts | 2.1 | Low |
| 2.3 | Free signup flow (rewrite createApplication) | applications.service.ts | 2.1, 2.2 | **High** |
| 2.4 | Dashboard completion + unlock endpoints | 5 new files + 2 modified | 2.1, 2.3 | Medium |
| 2.5 | Frontend: password field + auto-login redirect | 2 form pages | 2.3 | Medium |
| 2.6 | Session handling (set cookie on signup) | controller + forms | 2.3, 2.5 | Medium |
| 2.7 | Startup dashboard: blurred previews + unlock CTA | 4 new + 1 modified | 2.4 | Medium |
| 2.8 | Talent dashboard: completion checklist | 2 new + 1 modified | 2.4 | Low |
| 2.9 | Talent dashboard: references + assessment pages | 2 new pages | 2.4 | Low |

**Implementation order:** 2.1 → 2.2 → 2.3 → 2.4 → (2.5 + 2.6 in parallel) → (2.7 + 2.8 + 2.9 in parallel)

**Tasks 2.7, 2.8, 2.9 are frontend-only** and can be implemented in parallel once the backend is ready.

**Task 2.3 is the highest risk** — it rewrites the core signup flow. Test thoroughly with both COMPANY and TALENT application types.

### Testing Plan

After all Phase 2 tasks are complete:

1. **Company signup (happy path):**
   - Fill company form → submit → auto-login → lands on `/startup/dashboard`
   - Dashboard shows blurred match preview cards
   - "Unlock matching" button visible with ₹8,500 price
   - In dummy mode: click unlock → matches revealed

2. **Talent signup with all steps:**
   - Fill all 4 steps → submit → auto-login → lands on `/operator/dashboard`
   - Dashboard shows all checklist items as complete
   - "Unlock matching" button enabled ($50)

3. **Talent signup with skipped steps:**
   - Fill Steps 0-1 → skip 2-3 → submit → auto-login → `/operator/dashboard`
   - Checklist shows refs + assessment incomplete
   - "Unlock matching" button disabled with explanation
   - Click "Complete now" → fill references → save → redirected back
   - Click "Complete now" → fill assessment → save → redirected back
   - Payment button now enabled

4. **Duplicate guard:** Try signing up with the same email twice → should get error

5. **Login:** After signup, try logging in with email + password at `/auth/login` → should work
