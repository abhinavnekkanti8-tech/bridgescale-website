import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Req,
  Res,
  Headers,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  RawBodyRequest,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { CreateTalentApplicationDto } from './dto/create-talent-application.dto';
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
  async createApplication(@Body() dto: CreateApplicationDto) {
    return this.applicationsService.createApplication(dto);
  }

  @Post('talent')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(SessionAuthGuard)
  async createTalentApplication(
    @CurrentUser() user: SessionUser,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: CreateTalentApplicationDto,
  ) {
    if (!user) throw new BadRequestException('User not authenticated.');

    const result = await this.applicationsService.createTalentApplication(user.email, dto);
    req.session.user = { ...user, stage: 'PENDING_APPROVAL' as any };
    res.cookie('platform.user_stage', 'PENDING_APPROVAL', {
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });
    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

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

  @Post('my-application/upload-cv')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SessionAuthGuard)
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
  async uploadMyCv(
    @CurrentUser() user: SessionUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!user) throw new BadRequestException('User not authenticated.');
    if (!file) throw new BadRequestException('No file uploaded.');
    return this.applicationsService.attachCvForCurrentUser(
      user.email,
      file.originalname,
      `cv/${file.filename}`,
    );
  }

  @Get('my-application/cv')
  @UseGuards(SessionAuthGuard)
  async downloadMyCv(
    @CurrentUser() user: SessionUser,
    @Res() res: Response,
  ) {
    if (!user) throw new BadRequestException('User not authenticated.');
    const file = await this.applicationsService.getCurrentUserCv(user.email);
    return res.download(file.absolutePath, file.downloadName);
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
  @Get(':id/cv')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async downloadApplicationCv(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const file = await this.applicationsService.getApplicationCvForAdmin(id);
    return res.download(file.absolutePath, file.downloadName);
  }

  /**
   * POST /api/v1/applications/webhook
   * PUBLIC — Stripe webhook for checkout.session.completed events.
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = (req.rawBody ?? Buffer.alloc(0)).toString('utf-8');
    const payload = this.applicationsService.verifyAndParseStripeWebhook(
      rawBody,
      signature ?? '',
    );

    if (payload.type !== 'checkout.session.completed') return { received: true };

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
