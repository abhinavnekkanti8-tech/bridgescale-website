import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { MembershipRole, ApplicationStatus } from '@prisma/client';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Ensure uploads directory exists
const UPLOADS_DIR = join(process.cwd(), 'uploads', 'cv');
if (!existsSync(UPLOADS_DIR)) {
  mkdirSync(UPLOADS_DIR, { recursive: true });
}

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  /**
   * POST /api/v1/applications
   * PUBLIC — Submit a new application (company or talent).
   * Returns applicationId + checkoutUrl (if Stripe is active).
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createApplication(@Body() dto: CreateApplicationDto) {
    return this.applicationsService.createApplication(dto);
  }

  /**
   * GET /api/v1/applications/:id/status
   * PUBLIC — Check application status (used by post-payment success page).
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
   * ADMIN — Update application status (approve, reject, under review).
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
   * PUBLIC — Upload a CV/resume file for an application.
   * Max file size: 5MB. Accepts PDF, DOC, DOCX.
   */
  @Post(':id/upload-cv')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('cv', {
      storage: diskStorage({
        destination: UPLOADS_DIR,
        filename: (_req, file, cb) => {
          const uniqueSuffix = uuidv4();
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (_req, file, cb) => {
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (allowedTypes.includes(file.mimetype)) {
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
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }
    return this.applicationsService.attachCv(id, file.originalname, `/uploads/cv/${file.filename}`);
  }

  /**
   * POST /api/v1/applications/webhook
   * PUBLIC — Stripe webhook for checkout.session.completed events.
   * In production, verify the Stripe signature before processing.
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleStripeWebhook(@Body() payload: any) {
    if (!payload || payload.type !== 'checkout.session.completed') {
      return { received: true };
    }

    const session = payload.data?.object;
    if (!session?.id) return { received: true };

    return this.applicationsService.handleCheckoutCompleted(
      session.id,
      session.payment_intent || '',
    );
  }
}
