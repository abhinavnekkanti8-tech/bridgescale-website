import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ApplicationType,
  DataRequestStatus,
  DataRequestType,
  Prisma,
  UserStatus,
} from '@prisma/client';
import { existsSync, unlinkSync } from 'fs';
import { resolve, sep } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { SessionUser } from '../common/types/session.types';
import { DATA_RETENTION_POLICY, LIVE_PROCESSOR_REGISTER } from './compliance.constants';

@Injectable()
export class ComplianceService {
  constructor(private readonly prisma: PrismaService) {}

  getRetentionPolicy() {
    return DATA_RETENTION_POLICY;
  }

  getProcessorRegister() {
    return LIVE_PROCESSOR_REGISTER;
  }

  listRequests() {
    return this.prisma.dataSubjectRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async exportSubjectData(subjectEmail: string, actor: SessionUser, reason?: string) {
    const normalizedEmail = subjectEmail.toLowerCase().trim();
    const subjectData = await this.collectSubjectData(normalizedEmail);

    if (!subjectData.user && subjectData.applications.length === 0) {
      throw new NotFoundException('No personal data found for that email address.');
    }

    const request = await this.prisma.dataSubjectRequest.create({
      data: {
        type: DataRequestType.EXPORT,
        status: DataRequestStatus.COMPLETED,
        subjectEmail: normalizedEmail,
        subjectUserId: subjectData.user?.id,
        requestedBy: actor.id,
        reason,
        notes: 'Admin-initiated data export',
        metadata: {
          applicationCount: subjectData.applications.length,
          membershipCount: subjectData.memberships.length,
        } as Prisma.InputJsonValue,
        completedAt: new Date(),
      },
    });

    return { request, exportData: subjectData };
  }

  async deleteSubjectData(subjectEmail: string, actor: SessionUser, reason?: string) {
    const normalizedEmail = subjectEmail.toLowerCase().trim();
    const subjectData = await this.collectSubjectData(normalizedEmail);

    if (!subjectData.user && subjectData.applications.length === 0) {
      throw new NotFoundException('No personal data found for that email address.');
    }

    const redactedEmail = subjectData.user
      ? `deleted+${subjectData.user.id}@redacted.local`
      : `deleted+${Date.now()}@redacted.local`;
    const redactedApplicationName = 'Deleted Applicant';
    const cvPaths = subjectData.applications
      .map((application) => application.cvFileUrl)
      .filter((value): value is string => Boolean(value));

    const request = await this.prisma.$transaction(async (tx) => {
      if (subjectData.user) {
        await tx.oAuthIdentity.deleteMany({ where: { userId: subjectData.user.id } });
        await tx.emailActionToken.deleteMany({ where: { userId: subjectData.user.id } });

        await tx.workspaceNote.updateMany({
          where: { authorId: subjectData.user.id },
          data: { content: '[Removed during privacy deletion request]' },
        });

        await tx.escalationCase.updateMany({
          where: { reporterId: subjectData.user.id },
          data: { reason: '[Removed during privacy deletion request]' },
        });

        await tx.engagementRating.updateMany({
          where: { reviewerId: subjectData.user.id },
          data: {
            comments: '[Removed during privacy deletion request]',
            components: Prisma.DbNull,
          },
        });

        await tx.user.update({
          where: { id: subjectData.user.id },
          data: {
            name: 'Deleted User',
            email: redactedEmail,
            passwordHash: null,
            emailVerifiedAt: null,
            status: UserStatus.INACTIVE,
            privacyAcceptedAt: null,
            termsAcceptedAt: null,
            noticeVersion: null,
          },
        });
      }

      if (subjectData.orgIds.length > 0) {
        await tx.operatorProfile.updateMany({
          where: { operatorId: { in: subjectData.orgIds } },
          data: {
            linkedIn: null,
            references: Prisma.DbNull,
            bio: null,
          },
        });

        await tx.startupProfile.updateMany({
          where: { startupId: { in: subjectData.orgIds } },
          data: {
            executionOwner: null,
            additionalContext: null,
          },
        });
      }

      for (const application of subjectData.applications) {
        await tx.application.update({
          where: { id: application.id },
          data: {
            name: redactedApplicationName,
            email: redactedEmail,
            notes: null,
            companyName:
              application.type === ApplicationType.COMPANY ? 'Redacted Company' : null,
            companyWebsite: null,
            teamStructure: null,
            previousAttempts: null,
            idealOutcome90d: null,
            specificTargets: null,
            location: null,
            currentRole: null,
            currentEmployer: null,
            engagementPref: null,
            markets: null,
            dealHistory: Prisma.DbNull,
            confidenceMarkets: Prisma.DbNull,
            languagesSpoken: [],
            linkedInUrl: null,
            references: Prisma.DbNull,
            cvFileName: null,
            cvFileUrl: null,
            caseStudyResponse: null,
            preferredStructures: [],
            interviewLocation: null,
            interviewNotes: null,
            decisionReason: null,
          },
        });
      }

      return tx.dataSubjectRequest.create({
        data: {
          type: DataRequestType.DELETE,
          status: DataRequestStatus.COMPLETED,
          subjectEmail: normalizedEmail,
          subjectUserId: subjectData.user?.id,
          requestedBy: actor.id,
          reason,
          notes: 'Admin-initiated anonymization',
          metadata: {
            anonymizedApplications: subjectData.applications.length,
            removedCvFiles: cvPaths.length,
          } as Prisma.InputJsonValue,
          completedAt: new Date(),
        },
      });
    });

    this.deleteCvFiles(cvPaths);

    return {
      request,
      summary: {
        anonymizedUser: Boolean(subjectData.user),
        anonymizedApplications: subjectData.applications.length,
        removedCvFiles: cvPaths.length,
      },
    };
  }

  private async collectSubjectData(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          include: {
            organization: {
              include: {
                startupProfile: true,
                operatorProfile: true,
              },
            },
          },
        },
        authIdentities: true,
      },
    });

    const applications = await this.prisma.application.findMany({
      where: { email },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        status: true,
        name: true,
        email: true,
        cvFileUrl: true,
        createdAt: true,
      },
    });

    const memberships = user?.memberships ?? [];
    const orgIds = memberships.map((membership) => membership.orgId);
    const startupProfileIds = memberships
      .map((membership) => membership.organization.startupProfile?.id)
      .filter((value): value is string => Boolean(value));

    const statementOfWorks =
      startupProfileIds.length > 0 || orgIds.length > 0
        ? await this.prisma.statementOfWork.findMany({
            where: {
              OR: [
                startupProfileIds.length > 0
                  ? { startupProfileId: { in: startupProfileIds } }
                  : undefined,
                orgIds.length > 0 ? { operatorId: { in: orgIds } } : undefined,
              ].filter(Boolean) as Prisma.StatementOfWorkWhereInput[],
            },
            select: {
              id: true,
              status: true,
              packageType: true,
              currentVersion: true,
              createdAt: true,
            },
          })
        : [];

    const engagements =
      orgIds.length > 0
        ? await this.prisma.engagement.findMany({
            where: {
              OR: [{ startupId: { in: orgIds } }, { operatorId: { in: orgIds } }],
            },
            select: {
              id: true,
              status: true,
              startDate: true,
              endDate: true,
              createdAt: true,
            },
          })
        : [];

    const workspaceNotes = user
      ? await this.prisma.workspaceNote.findMany({
          where: { authorId: user.id },
          select: {
            id: true,
            engagementId: true,
            content: true,
            createdAt: true,
          },
        })
      : [];

    const ratings = user
      ? await this.prisma.engagementRating.findMany({
          where: {
            OR: [{ reviewerId: user.id }, { revieweeId: user.id }],
          },
          select: {
            id: true,
            engagementId: true,
            score: true,
            comments: true,
            createdAt: true,
          },
        })
      : [];

    return {
      subjectEmail: email,
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            status: user.status,
            onboardingStage: user.onboardingStage,
            createdAt: user.createdAt,
          }
        : null,
      memberships: memberships.map((membership) => ({
        membershipRole: membership.membershipRole,
        orgId: membership.orgId,
        organizationName: membership.organization.name,
        orgType: membership.organization.orgType,
        startupProfileId: membership.organization.startupProfile?.id ?? null,
        operatorProfileId: membership.organization.operatorProfile?.id ?? null,
      })),
      orgIds,
      applications,
      statementOfWorks,
      engagements,
      workspaceNotes,
      ratings,
    };
  }

  private deleteCvFiles(filePaths: string[]) {
    for (const filePath of filePaths) {
      const normalized = filePath.replace(/\\/g, '/').replace(/^\/+/, '').replace(/^uploads\//, '');
      const uploadsRoot = resolve(process.cwd(), 'uploads');
      const absolutePath = resolve(uploadsRoot, normalized);
      const allowedPrefix = `${uploadsRoot}${sep}`;

      if (absolutePath !== uploadsRoot && absolutePath.startsWith(allowedPrefix) && existsSync(absolutePath)) {
        unlinkSync(absolutePath);
      }
    }
  }
}
