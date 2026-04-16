import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Headers,
  RawBodyRequest,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { VerifyRazorpayDto, DummyConfirmDto } from './dto/payment.dto';
import { CompleteAssessmentDto } from './dto/complete-assessment.dto';
import { CompleteReferencesDto } from './dto/complete-references.dto';
import { UnlockMatchingRazorpayDto } from './dto/unlock-matching.dto';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SessionUser } from '../common/types/session.types';
import { MembershipRole, ApplicationStatus } from '@prisma/client';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

const UPLOADS_DIR = join(process.cwd(), 'uploads', 'cv');
if (!existsSync(UPLOADS_DIR)) {
  mkdirSync(UPLOADS_DIR, { recursive: true });
}

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  /**
   * POST /api/v1/applications
   * PUBLIC — Submit a new application.
   * Creates account immediately, returns session data for auto-login.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createApplication(
    @Req() req: Request,
    @Body() dto: CreateApplicationDto,
  ) {
    const result = await this.applicationsService.createApplication(dto);

    // Set session for auto-login
    if (result.session && req.session) {
      (req.session as any).user = {
        id: result.session.userId,
        name: dto.name,
        email: dto.email,
        role: result.session.role,
        orgId: result.session.orgId,
        status: 'PENDING_APPROVAL',
      };
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    return result;
  }

  /**
   * GET /api/v1/applications/my-application
   * AUTHENTICATED — Get the current user's application.
   * Used by the dashboard to show application status + diagnosis.
   */
  @Get('my-application')
  @UseGuards(SessionAuthGuard)
  async getMyApplication(@CurrentUser() user: SessionUser) {
    if (!user) throw new BadRequestException('User not authenticated.');
    return this.applicationsService.getMyApplication(user.email);
  }

  /**
   * POST /api/v1/applications/payment/razorpay/verify
   * PUBLIC — Verify Razorpay payment after frontend modal success.
   */
  @Post('payment/razorpay/verify')
  @HttpCode(HttpStatus.OK)
  async verifyRazorpayPayment(@Body() dto: VerifyRazorpayDto) {
    return this.applicationsService.verifyRazorpayPayment({
      applicationId: dto.applicationId,
      razorpayOrderId: dto.razorpayOrderId,
      razorpayPaymentId: dto.razorpayPaymentId,
      razorpaySignature: dto.razorpaySignature,
    });
  }

  /**
   * POST /api/v1/applications/payment/dummy-confirm
   * PUBLIC (dev only) — Instantly confirm a PENDING_PAYMENT application.
   * Only works when DUMMY_PAYMENT_MODE=true.
   */
  @Post('payment/dummy-confirm')
  @HttpCode(HttpStatus.OK)
  async dummyConfirmPayment(@Body() dto: DummyConfirmDto) {
    return this.applicationsService.dummyConfirmPayment(dto.applicationId);
  }

  /**
   * POST /api/v1/applications/payment/razorpay/webhook
   * PUBLIC — Razorpay server-to-server webhook (payment.captured).
   * Reads raw body for signature verification.
   */
  @Post('payment/razorpay/webhook')
  @HttpCode(HttpStatus.OK)
  async handleRazorpayWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-razorpay-signature') signature: string,
    @Body() payload: any,
  ) {
    const rawBody = (req.rawBody ?? Buffer.alloc(0)).toString('utf-8');
    return this.applicationsService.handleRazorpayWebhook(rawBody, signature ?? '', payload);
  }

  /**
   * GET /api/v1/applications/:id/status
   * PUBLIC — Check application status (used by post-payment confirmation page).
   */
  @Get(':id/status')
  async getApplicationStatus(@Param('id') id: string) {
    return this.applicationsService.getApplicationStatus(id);
  }

  /**
   * GET /api/v1/applications
   * ADMIN — List all applications, optionally filtered by status.
   */
  @Get()
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async listApplications(@Query('status') status?: ApplicationStatus) {
    return this.applicationsService.listApplications(status);
  }

  /**
   * PATCH /api/v1/applications/:id/status
   * ADMIN — Update application status.
   */
  @Patch(':id/status')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async updateApplicationStatus(
    @Param('id') id: string,
    @Body('status') status: ApplicationStatus,
  ) {
    if (!Object.values(ApplicationStatus).includes(status)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }
    return this.applicationsService.updateApplicationStatus(id, status);
  }

  /**
   * POST /api/v1/applications/:id/upload-cv
   * PUBLIC — Upload a CV/resume file. Max 5MB. PDF/DOC/DOCX only.
   */
  @Post(':id/upload-cv')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('cv', {
      storage: diskStorage({
        destination: UPLOADS_DIR,
        filename: (_req, file, cb) => {
          cb(null, `${uuidv4()}${extname(file.originalname).toLowerCase()}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only PDF, DOC, and DOCX files are allowed.'), false);
        }
      },
    }),
  )
  async uploadCv(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file uploaded.');
    return this.applicationsService.attachCv(id, file.originalname, `/uploads/cv/${file.filename}`);
  }

  /**
   * POST /api/v1/applications/webhook
   * PUBLIC — Stripe webhook for checkout.session.completed events.
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleStripeWebhook(@Body() payload: any) {
    if (!payload || payload.type !== 'checkout.session.completed') return { received: true };

    const session = payload.data?.object;
    if (!session?.id) return { received: true };

    return this.applicationsService.handleCheckoutCompleted(
      session.id,
      session.payment_intent || '',
    );
  }

  /**
   * POST /api/v1/applications/:id/schedule-interview
   * ADMIN — Schedule an interview, sets status to INTERVIEW_SCHEDULED.
   * Body: { scheduledAt: ISO date, location?: string, notes?: string }
   */
  @Post(':id/schedule-interview')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async scheduleInterview(
    @Param('id') id: string,
    @Body() body: { scheduledAt: string; location?: string; notes?: string },
  ) {
    if (!body?.scheduledAt) {
      throw new BadRequestException('scheduledAt is required.');
    }
    return this.applicationsService.scheduleInterview(id, body);
  }

  /**
   * POST /api/v1/applications/:id/approve
   * ADMIN — Final approval, sets status to APPROVED and activates the user.
   * Body: { reason?: string }
   */
  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async approveApplication(
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    return this.applicationsService.approveApplication(id, body?.reason);
  }

  /**
   * POST /api/v1/applications/:id/reject
   * ADMIN — Final rejection, sets status to REJECTED with reason.
   * Body: { reason: string }
   */
  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async rejectApplication(
    @Param('id') id: string,
    @Body() body: { reason: string },
  ) {
    if (!body?.reason) {
      throw new BadRequestException('Rejection reason is required.');
    }
    return this.applicationsService.rejectApplication(id, body.reason);
  }

  // ── Dashboard: Free Signup + Completion ────────────────────────────────────

  /**
   * POST /api/v1/applications/complete-assessment
   * AUTHENTICATED — Talent completes assessment from dashboard.
   * Updates application with assessment data, triggers AI pre-screen.
   */
  @Post('complete-assessment')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SessionAuthGuard)
  async completeAssessment(
    @CurrentUser() user: SessionUser,
    @Body() dto: CompleteAssessmentDto,
  ) {
    if (!user) throw new BadRequestException('User not authenticated.');
    return this.applicationsService.completeAssessment(user.email, dto);
  }

  /**
   * POST /api/v1/applications/complete-references
   * AUTHENTICATED — Talent completes references from dashboard.
   * Updates application with references, triggers cross-verification.
   */
  @Post('complete-references')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SessionAuthGuard)
  async completeReferences(
    @CurrentUser() user: SessionUser,
    @Body() dto: CompleteReferencesDto,
  ) {
    if (!user) throw new BadRequestException('User not authenticated.');
    return this.applicationsService.completeReferences(user.email, dto);
  }

  /**
   * GET /api/v1/applications/completion-status
   * AUTHENTICATED — Get completion status for current user's application.
   * Used by dashboard to show checklist and enable/disable payment button.
   */
  @Get('completion-status')
  @UseGuards(SessionAuthGuard)
  async getCompletionStatus(@CurrentUser() user: SessionUser) {
    if (!user) throw new BadRequestException('User not authenticated.');
    return this.applicationsService.getCompletionStatus(user.email);
  }

  /**
   * POST /api/v1/applications/initiate-unlock
   * AUTHENTICATED — Initiate "unlock matching" payment from dashboard.
   * Company → Razorpay order. Talent → Stripe session.
   * Only allowed when all required steps are complete.
   */
  @Post('initiate-unlock')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SessionAuthGuard)
  async initiateUnlockPayment(@CurrentUser() user: SessionUser) {
    if (!user) throw new BadRequestException('User not authenticated.');
    return this.applicationsService.initiateUnlockPayment(user.email);
  }

  /**
   * POST /api/v1/applications/verify-unlock
   * PUBLIC — Verify Razorpay payment for unlock-matching flow.
   * Called after Razorpay modal success callback during unlock.
   */
  @Post('verify-unlock')
  @HttpCode(HttpStatus.OK)
  async verifyUnlockPayment(@Body() dto: UnlockMatchingRazorpayDto) {
    return this.applicationsService.verifyUnlockPayment({
      applicationId: dto.applicationId,
      razorpayOrderId: dto.razorpayOrderId,
      razorpayPaymentId: dto.razorpayPaymentId,
      razorpaySignature: dto.razorpaySignature,
    });
  }
}
