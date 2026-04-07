import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SowStatus, PackageType } from '@prisma/client';

/**
 * SoW (Statement of Work) Service: Generate and manage engagement documents.
 * Creates SoW from templates and manages versioning.
 */
@Injectable()
export class SowService {
  private readonly logger = new Logger(SowService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get available SoW templates.
   */
  async getTemplates() {
    const templates = await this.prisma.sowTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return templates;
  }

  /**
   * Get a specific SoW template.
   */
  async getTemplate(templateId: string) {
    const template = await this.prisma.sowTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) throw new NotFoundException('SoW template not found.');
    return template;
  }

  /**
   * Generate a SoW from a template.
   * Creates a Statement of Work record and initial version.
   */
  async generateSoW(params: {
    shortlistId: string;
    startupProfileId: string;
    operatorId: string;
    templateId: string;
    companyName: string;
    talentName: string;
    expectedDurationDays: number;
    feeUsd: number;
    weeklyHours?: number;
    packageType?: PackageType;
    placeholderValues?: Record<string, string>;
  }) {
    const template = await this.prisma.sowTemplate.findUnique({
      where: { id: params.templateId },
    });

    if (!template) throw new NotFoundException('SoW template not found.');

    // Fill placeholders in template content
    let contentText = template.contentPlainText;
    const substitutions = {
      '[COMPANY_NAME]': params.companyName,
      '[TALENT_NAME]': params.talentName,
      '[DURATION_DAYS]': String(params.expectedDurationDays),
      '[FEE_USD]': String(params.feeUsd),
      '[WEEKLY_HOURS]': String(params.weeklyHours || 40),
      '[START_DATE]': new Date().toLocaleDateString('en-GB'),
      '[END_DATE]': new Date(Date.now() + params.expectedDurationDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'),
      ...params.placeholderValues,
    };

    for (const [key, value] of Object.entries(substitutions)) {
      contentText = contentText.replaceAll(key, value);
    }

    // Create the Statement of Work record
    const sow = await this.prisma.statementOfWork.create({
      data: {
        shortlistId: params.shortlistId,
        startupProfileId: params.startupProfileId,
        operatorId: params.operatorId,
        packageType: params.packageType || PackageType.PIPELINE_SPRINT,
        title: `${params.companyName} - ${params.talentName}`,
        scope: contentText.substring(0, 500),
        deliverables: 'As per SoW',
        timeline: `${params.expectedDurationDays} days`,
        weeklyHours: params.weeklyHours || 40,
        totalPriceUsd: params.feeUsd,
        status: SowStatus.DRAFT,
      },
    });

    // Create initial version
    const version = await this.prisma.sowVersion.create({
      data: {
        sowId: sow.id,
        version: 1,
        content: { text: contentText, placeholders: substitutions },
        changedBy: 'SYSTEM',
        changeNote: 'Initial version from template',
      },
    });

    this.logger.log(`SoW generated: ${sow.id} (v${version.version})`);
    return { sow, version };
  }

  /**
   * Update SoW content and create new version.
   */
  async updateSoW(sowId: string, contentText: string, changedBy: string, changeNote?: string) {
    const sow = await this.prisma.statementOfWork.findUnique({
      where: { id: sowId },
      include: { versions: { orderBy: { version: 'desc' }, take: 1 } },
    });

    if (!sow) throw new NotFoundException('SoW not found.');

    // Get the latest version number
    const latestVersion = sow.versions[0];
    const nextVersion = (latestVersion?.version || 0) + 1;

    // Create new version
    const newVersion = await this.prisma.sowVersion.create({
      data: {
        sowId,
        version: nextVersion,
        content: { text: contentText },
        changedBy,
        changeNote,
      },
    });

    // Update SoW's currentVersion
    await this.prisma.statementOfWork.update({
      where: { id: sowId },
      data: { currentVersion: nextVersion },
    });

    this.logger.log(`SoW updated: ${sowId} → v${nextVersion}`);
    return newVersion;
  }

  /**
   * Approve SoW for signing (status → APPROVED).
   */
  async approveSoW(sowId: string) {
    const sow = await this.prisma.statementOfWork.findUnique({
      where: { id: sowId },
    });

    if (!sow) throw new NotFoundException('SoW not found.');
    if (sow.status !== SowStatus.DRAFT) {
      throw new BadRequestException('Only draft SoWs can be approved.');
    }

    const updated = await this.prisma.statementOfWork.update({
      where: { id: sowId },
      data: { status: SowStatus.APPROVED },
    });

    this.logger.log(`SoW approved: ${sowId}`);
    return updated;
  }

  /**
   * Get SoW by ID with versions.
   */
  async getSoW(sowId: string) {
    const sow = await this.prisma.statementOfWork.findUnique({
      where: { id: sowId },
      include: { versions: { orderBy: { version: 'asc' } } },
    });

    if (!sow) throw new NotFoundException('SoW not found.');
    return sow;
  }
}
