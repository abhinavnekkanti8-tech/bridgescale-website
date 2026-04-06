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
   * Returns payment initiation data (Razorpay order or Stripe session).
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createApplication(@Body() dto: CreateApplicationDto) {
    return this.applicationsService.createApplication(dto);
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
}
