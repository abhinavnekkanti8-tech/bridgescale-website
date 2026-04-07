import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { DiagnosisStatus } from '@prisma/client';

@Injectable()
export class DiagnosesService {
  private readonly logger = new Logger(DiagnosesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Get a specific diagnosis by ID.
   * Admin-only — shows full AI content, human-edited content, and review status.
   */
  async getDiagnosis(diagnosisId: string) {
    const diagnosis = await this.prisma.needDiagnosis.findUnique({
      where: { id: diagnosisId },
      include: { application: true },
    });

    if (!diagnosis) throw new NotFoundException('Diagnosis not found.');
    return diagnosis;
  }

  /**
   * List diagnoses with optional filtering by status.
   * Admin-only — shows paginated results with application summary.
   */
  async listDiagnoses(status?: DiagnosisStatus, limit = 20, offset = 0) {
    const diagnoses = await this.prisma.needDiagnosis.findMany({
      where: status ? { status } : undefined,
      include: {
        application: {
          select: {
            id: true,
            name: true,
            email: true,
            type: true,
            companyName: true,
            createdAt: true,
          },
        },
      },
      orderBy: { generatedAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await this.prisma.needDiagnosis.count({
      where: status ? { status } : undefined,
    });

    return { diagnoses, total, limit, offset };
  }

  /**
   * Update diagnosis: approve or request revisions.
   * Transitions DRAFT_AI → APPROVED or REVISION_REQUESTED.
   * Admin can also provide reviewer notes or revised content.
   */
  async updateDiagnosis(
    diagnosisId: string,
    params: {
      status?: DiagnosisStatus;
      humanEditedContent?: Record<string, any>;
      clientFacingContent?: Record<string, any>;
      reviewerNotes?: string;
      revisionNotes?: string;
    },
  ) {
    const diagnosis = await this.prisma.needDiagnosis.findUnique({
      where: { id: diagnosisId },
      include: { application: true },
    });

    if (!diagnosis) throw new NotFoundException('Diagnosis not found.');

    // Build update data
    const updateData: Record<string, any> = {};

    if (params.status) {
      // Validate status transition
      if (!['DRAFT_AI', 'UNDER_REVIEW', 'READY_FOR_CLIENT', 'APPROVED', 'REVISION_REQUESTED'].includes(params.status)) {
        throw new BadRequestException(`Invalid status: ${params.status}`);
      }
      updateData.status = params.status;

      // Mark approval time when transitioning to APPROVED
      if (params.status === 'APPROVED') {
        updateData.finalizedAt = new Date();
      }
    }

    if (params.humanEditedContent) {
      updateData.humanEditedContent = params.humanEditedContent;
    }

    if (params.clientFacingContent) {
      updateData.clientFacingContent = params.clientFacingContent;
    }

    if (params.reviewerNotes !== undefined) {
      updateData.reviewerNotes = params.reviewerNotes;
    }

    if (params.revisionNotes !== undefined) {
      updateData.revisionNotes = params.revisionNotes;
    }

    const updated = await this.prisma.needDiagnosis.update({
      where: { id: diagnosisId },
      data: updateData,
      include: { application: true },
    });

    this.logger.log(`Diagnosis ${diagnosisId} updated: status → ${updated.status}`);

    // Send notification email if approved
    if (params.status === 'APPROVED' && diagnosis.application) {
      this.emailService
        .sendDiagnosisApproved({
          email: diagnosis.application.email,
          name: diagnosis.application.name,
          type: diagnosis.application.type,
        })
        .catch((err) =>
          this.logger.error(
            `Failed to send approval email to ${diagnosis.application.email}: ${err.message}`,
          ),
        );
    }

    return updated;
  }

  /**
   * Get all diagnoses awaiting review (DRAFT_AI status).
   * Used by admin dashboard to show pending reviews.
   */
  async getPendingDiagnoses() {
    return this.prisma.needDiagnosis.findMany({
      where: { status: 'DRAFT_AI' },
      include: {
        application: {
          select: {
            id: true,
            name: true,
            email: true,
            type: true,
            createdAt: true,
          },
        },
      },
      orderBy: { generatedAt: 'asc' },
    });
  }

  /**
   * ADMIN — Finalize a diagnosis and send it to the client for sign-off.
   * Transitions DRAFT_AI / UNDER_REVIEW → READY_FOR_CLIENT and sets the
   * client-facing payload (defaults to humanEditedContent if not given).
   */
  async finalizeDiagnosis(
    diagnosisId: string,
    params?: {
      clientFacingContent?: Record<string, any>;
      reviewerNotes?: string;
    },
  ) {
    const diagnosis = await this.prisma.needDiagnosis.findUnique({
      where: { id: diagnosisId },
      include: { application: true },
    });

    if (!diagnosis) throw new NotFoundException('Diagnosis not found.');
    if (
      diagnosis.status !== 'DRAFT_AI' &&
      diagnosis.status !== 'UNDER_REVIEW' &&
      diagnosis.status !== 'REVISION_REQUESTED'
    ) {
      throw new BadRequestException(
        `Cannot finalize diagnosis in status ${diagnosis.status}.`,
      );
    }

    const clientFacing =
      params?.clientFacingContent ??
      diagnosis.humanEditedContent ??
      diagnosis.aiContent;

    const updated = await this.prisma.needDiagnosis.update({
      where: { id: diagnosisId },
      data: {
        status: 'READY_FOR_CLIENT',
        clientFacingContent: clientFacing as any,
        finalizedAt: new Date(),
        ...(params?.reviewerNotes !== undefined
          ? { reviewerNotes: params.reviewerNotes }
          : {}),
      },
      include: { application: true },
    });

    // Bump the parent application status so the company sees it under review
    if (diagnosis.application) {
      await this.prisma.application.update({
        where: { id: diagnosis.application.id },
        data: { status: 'DIAGNOSIS_UNDER_REVIEW' },
      });
    }

    this.logger.log(
      `Diagnosis ${diagnosisId} finalized → READY_FOR_CLIENT (application ${diagnosis.application?.id})`,
    );

    if (diagnosis.application) {
      this.emailService
        .sendDiagnosisApproved({
          email: diagnosis.application.email,
          name: diagnosis.application.name,
          type: diagnosis.application.type,
        })
        .catch((err) =>
          this.logger.error(
            `Failed to send finalize email to ${diagnosis.application.email}: ${err.message}`,
          ),
        );
    }

    return updated;
  }

  /**
   * CLIENT — Approve the diagnosis. Bumps application to DIAGNOSIS_APPROVED
   * so the brief generation pipeline can pick it up.
   */
  async clientApproveDiagnosis(diagnosisId: string, applicationId: string) {
    const diagnosis = await this.prisma.needDiagnosis.findUnique({
      where: { id: diagnosisId },
      include: { application: true },
    });

    if (!diagnosis) throw new NotFoundException('Diagnosis not found.');
    if (diagnosis.applicationId !== applicationId) {
      throw new BadRequestException('You do not have access to this diagnosis.');
    }
    if (diagnosis.status !== 'READY_FOR_CLIENT') {
      throw new BadRequestException(
        `Cannot approve diagnosis in status ${diagnosis.status}.`,
      );
    }

    const updated = await this.prisma.needDiagnosis.update({
      where: { id: diagnosisId },
      data: {
        status: 'APPROVED',
        clientApprovedAt: new Date(),
      },
      include: { application: true },
    });

    await this.prisma.application.update({
      where: { id: applicationId },
      data: { status: 'DIAGNOSIS_APPROVED' },
    });

    this.logger.log(`Diagnosis ${diagnosisId} client-approved → APPROVED`);
    return updated;
  }

  /**
   * CLIENT — Request a revision on the diagnosis. Bumps the diagnosis back
   * to REVISION_REQUESTED and stores the client's notes for the admin to
   * see during re-review.
   */
  async clientRequestRevision(
    diagnosisId: string,
    applicationId: string,
    notes: string,
  ) {
    const diagnosis = await this.prisma.needDiagnosis.findUnique({
      where: { id: diagnosisId },
      include: { application: true },
    });

    if (!diagnosis) throw new NotFoundException('Diagnosis not found.');
    if (diagnosis.applicationId !== applicationId) {
      throw new BadRequestException('You do not have access to this diagnosis.');
    }
    if (diagnosis.status !== 'READY_FOR_CLIENT') {
      throw new BadRequestException(
        `Cannot request revision on diagnosis in status ${diagnosis.status}.`,
      );
    }
    if (!notes || notes.trim().length === 0) {
      throw new BadRequestException('Revision notes are required.');
    }

    const updated = await this.prisma.needDiagnosis.update({
      where: { id: diagnosisId },
      data: {
        status: 'REVISION_REQUESTED',
        revisionNotes: notes,
      },
      include: { application: true },
    });

    this.logger.log(
      `Diagnosis ${diagnosisId} revision requested by client (application ${applicationId})`,
    );
    return updated;
  }
}
