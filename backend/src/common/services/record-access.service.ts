import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MembershipRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SessionUser } from '../types/session.types';

@Injectable()
export class RecordAccessService {
  constructor(private readonly prisma: PrismaService) {}

  private isPlatformAdmin(user: SessionUser): boolean {
    return user.role === MembershipRole.PLATFORM_ADMIN;
  }

  private isStartupUser(user: SessionUser): boolean {
    return (
      user.role === MembershipRole.STARTUP_ADMIN ||
      user.role === MembershipRole.STARTUP_MEMBER
    );
  }

  private isOperatorUser(user: SessionUser): boolean {
    return user.role === MembershipRole.OPERATOR;
  }

  private async getStartupProfileByOrgId(orgId: string) {
    return this.prisma.startupProfile.findUnique({
      where: { startupId: orgId },
      select: { id: true, startupId: true },
    });
  }

  private async getOperatorProfileByOrgId(orgId: string) {
    return this.prisma.operatorProfile.findUnique({
      where: { operatorId: orgId },
      select: { id: true, operatorId: true },
    });
  }

  async getStartupProfileIdForUser(user: SessionUser): Promise<string> {
    if (this.isPlatformAdmin(user)) {
      throw new ForbiddenException(
        'Platform admins must specify a startup profile explicitly.',
      );
    }

    if (!this.isStartupUser(user)) {
      throw new ForbiddenException('Startup access is required for this resource.');
    }

    const profile = await this.getStartupProfileByOrgId(user.orgId);
    if (!profile) {
      throw new NotFoundException('Startup profile not found for this organization.');
    }

    return profile.id;
  }

  async getOperatorProfileIdForUser(user: SessionUser): Promise<string> {
    if (this.isPlatformAdmin(user)) {
      throw new ForbiddenException(
        'Platform admins must specify an operator profile explicitly.',
      );
    }

    if (!this.isOperatorUser(user)) {
      throw new ForbiddenException('Operator access is required for this resource.');
    }

    const profile = await this.getOperatorProfileByOrgId(user.orgId);
    if (!profile) {
      throw new NotFoundException('Operator profile not found for this organization.');
    }

    return profile.id;
  }

  async resolveStartupProfileIdForAccess(
    user: SessionUser,
    requestedIdentifier: string,
  ): Promise<string> {
    if (this.isPlatformAdmin(user)) {
      const profile =
        (await this.prisma.startupProfile.findUnique({
          where: { id: requestedIdentifier },
          select: { id: true },
        })) ??
        (await this.prisma.startupProfile.findUnique({
          where: { startupId: requestedIdentifier },
          select: { id: true },
        }));

      if (!profile) {
        throw new NotFoundException('Startup profile not found.');
      }

      return profile.id;
    }

    const ownProfile = await this.getStartupProfileByOrgId(user.orgId);
    if (!ownProfile) {
      throw new NotFoundException('Startup profile not found for this organization.');
    }

    if (
      requestedIdentifier !== ownProfile.id &&
      requestedIdentifier !== ownProfile.startupId
    ) {
      throw new ForbiddenException('You do not have access to this startup profile.');
    }

    return ownProfile.id;
  }

  async resolveOperatorOrgIdForAccess(
    user: SessionUser,
    requestedIdentifier: string,
  ): Promise<string> {
    if (this.isPlatformAdmin(user)) {
      const profile =
        (await this.prisma.operatorProfile.findUnique({
          where: { id: requestedIdentifier },
          select: { operatorId: true },
        })) ??
        (await this.prisma.operatorProfile.findUnique({
          where: { operatorId: requestedIdentifier },
          select: { operatorId: true },
        }));

      if (!profile) {
        throw new NotFoundException('Operator profile not found.');
      }

      return profile.operatorId;
    }

    const ownProfile = await this.getOperatorProfileByOrgId(user.orgId);
    if (!ownProfile) {
      throw new NotFoundException('Operator profile not found for this organization.');
    }

    if (
      requestedIdentifier !== ownProfile.id &&
      requestedIdentifier !== ownProfile.operatorId
    ) {
      throw new ForbiddenException('You do not have access to this operator profile.');
    }

    return ownProfile.operatorId;
  }

  async assertStartupProfileAccess(user: SessionUser, startupProfileId: string) {
    const profile = await this.prisma.startupProfile.findUnique({
      where: { id: startupProfileId },
      select: { id: true, startupId: true },
    });

    if (!profile) {
      throw new NotFoundException('Startup profile not found.');
    }

    if (this.isPlatformAdmin(user)) {
      return profile;
    }

    if (!this.isStartupUser(user) || profile.startupId !== user.orgId) {
      throw new ForbiddenException('You do not have access to this startup profile.');
    }

    return profile;
  }

  async assertOperatorProfileAccess(user: SessionUser, operatorProfileId: string) {
    const profile = await this.prisma.operatorProfile.findUnique({
      where: { id: operatorProfileId },
      select: { id: true, operatorId: true },
    });

    if (!profile) {
      throw new NotFoundException('Operator profile not found.');
    }

    if (this.isPlatformAdmin(user)) {
      return profile;
    }

    if (!this.isOperatorUser(user) || profile.operatorId !== user.orgId) {
      throw new ForbiddenException('You do not have access to this operator profile.');
    }

    return profile;
  }

  async assertStartupApplicationAccess(user: SessionUser, applicationId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      select: { id: true, email: true, type: true },
    });

    if (!application) {
      throw new NotFoundException('Application not found.');
    }

    if (this.isPlatformAdmin(user)) {
      return application;
    }

    if (!this.isStartupUser(user)) {
      throw new ForbiddenException('You do not have access to this application.');
    }

    const owner = await this.prisma.user.findUnique({
      where: { email: application.email.toLowerCase() },
      select: {
        memberships: {
          where: { orgId: user.orgId, status: 'ACTIVE' },
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!owner?.memberships.length) {
      throw new ForbiddenException('You do not have access to this application.');
    }

    return application;
  }

  async assertDiscoveryCallAccess(user: SessionUser, callId: string) {
    const call = await this.prisma.discoveryCall.findUnique({
      where: { id: callId },
      select: { id: true, startupProfileId: true },
    });

    if (!call) {
      throw new NotFoundException('Discovery call not found.');
    }

    await this.assertStartupProfileAccess(user, call.startupProfileId);
    return call;
  }

  async assertShortlistAccess(user: SessionUser, shortlistId: string) {
    const shortlist = await this.prisma.matchShortlist.findUnique({
      where: { id: shortlistId },
      select: { id: true, startupProfileId: true },
    });

    if (!shortlist) {
      throw new NotFoundException('Shortlist not found.');
    }

    await this.assertStartupProfileAccess(user, shortlist.startupProfileId);
    return shortlist;
  }

  async assertCandidateAccess(user: SessionUser, candidateId: string) {
    const candidate = await this.prisma.matchCandidate.findUnique({
      where: { id: candidateId },
      select: {
        id: true,
        shortlistId: true,
        operatorId: true,
        shortlist: {
          select: {
            startupProfileId: true,
          },
        },
      },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found.');
    }

    if (this.isPlatformAdmin(user)) {
      return candidate;
    }

    if (this.isStartupUser(user)) {
      await this.assertStartupProfileAccess(user, candidate.shortlist.startupProfileId);
      return candidate;
    }

    if (this.isOperatorUser(user)) {
      const operatorProfile = await this.getOperatorProfileByOrgId(user.orgId);
      if (!operatorProfile || operatorProfile.operatorId !== candidate.operatorId) {
        throw new ForbiddenException('You do not have access to this candidate.');
      }

      return candidate;
    }

    throw new ForbiddenException('You do not have access to this candidate.');
  }

  async assertSowAccess(user: SessionUser, sowId: string) {
    const sow = await this.prisma.statementOfWork.findUnique({
      where: { id: sowId },
      select: {
        id: true,
        startupProfileId: true,
        operatorId: true,
      },
    });

    if (!sow) {
      throw new NotFoundException('Statement of Work not found.');
    }

    await this.assertStartupOrOperatorOrgSideAccess(
      user,
      sow.startupProfileId,
      sow.operatorId,
      'Statement of Work',
    );

    return sow;
  }

  async assertContractAccess(user: SessionUser, contractId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      select: {
        id: true,
        sowId: true,
        sow: {
          select: {
            startupProfileId: true,
            operatorId: true,
          },
        },
      },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found.');
    }

    await this.assertStartupOrOperatorOrgSideAccess(
      user,
      contract.sow.startupProfileId,
      contract.sow.operatorId,
      'Contract',
    );

    return contract;
  }

  async assertEngagementAccess(user: SessionUser, engagementId: string) {
    const engagement = await this.prisma.engagement.findUnique({
      where: { id: engagementId },
      select: {
        id: true,
        startupId: true,
        operatorId: true,
      },
    });

    if (!engagement) {
      throw new NotFoundException('Engagement not found.');
    }

    await this.assertStartupOrOperatorProfileSideAccess(
      user,
      engagement.startupId,
      engagement.operatorId,
      'Engagement',
    );

    return engagement;
  }

  async assertMilestoneAccess(user: SessionUser, milestoneId: string) {
    const milestone = await this.prisma.engagementMilestone.findUnique({
      where: { id: milestoneId },
      select: { id: true, engagementId: true, title: true },
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found.');
    }

    await this.assertEngagementAccess(user, milestone.engagementId);
    return milestone;
  }

  async assertNudgeAccess(user: SessionUser, nudgeId: string) {
    const nudge = await this.prisma.systemNudge.findUnique({
      where: { id: nudgeId },
      select: { id: true, targetUserId: true, engagementId: true },
    });

    if (!nudge) {
      throw new NotFoundException('Nudge not found.');
    }

    if (!this.isPlatformAdmin(user) && nudge.targetUserId !== user.id) {
      throw new ForbiddenException('You do not have access to this nudge.');
    }

    return nudge;
  }

  async assertRatingParticipantAccess(
    user: SessionUser,
    engagementId: string,
    revieweeId: string,
  ) {
    const engagement = await this.prisma.engagement.findUnique({
      where: { id: engagementId },
      select: {
        id: true,
        startupId: true,
        operatorId: true,
      },
    });

    if (!engagement) {
      throw new NotFoundException('Engagement not found.');
    }

    await this.assertStartupOrOperatorProfileSideAccess(
      user,
      engagement.startupId,
      engagement.operatorId,
      'Engagement',
    );

    const [startupProfile, operatorProfile] = await Promise.all([
      this.prisma.startupProfile.findUnique({
        where: { id: engagement.startupId },
        select: { startupId: true },
      }),
      this.prisma.operatorProfile.findUnique({
        where: { id: engagement.operatorId },
        select: { operatorId: true },
      }),
    ]);

    if (!startupProfile || !operatorProfile) {
      throw new NotFoundException('Engagement participants could not be resolved.');
    }

    const participant = await this.prisma.membership.findFirst({
      where: {
        userId: revieweeId,
        status: 'ACTIVE',
        orgId: { in: [startupProfile.startupId, operatorProfile.operatorId] },
      },
      select: { id: true },
    });

    if (!participant) {
      throw new ForbiddenException(
        'The reviewee must be an active participant in this engagement.',
      );
    }

    return engagement;
  }

  private async assertStartupOrOperatorOrgSideAccess(
    user: SessionUser,
    startupProfileId: string,
    operatorOrgId: string,
    resourceName: string,
  ) {
    if (this.isPlatformAdmin(user)) {
      return;
    }

    if (this.isStartupUser(user)) {
      const startupProfile = await this.prisma.startupProfile.findUnique({
        where: { id: startupProfileId },
        select: { startupId: true },
      });

      if (!startupProfile) {
        throw new NotFoundException('Startup profile not found.');
      }

      if (startupProfile.startupId !== user.orgId) {
        throw new ForbiddenException(`You do not have access to this ${resourceName}.`);
      }

      return;
    }

    if (this.isOperatorUser(user)) {
      if (operatorOrgId !== user.orgId) {
        throw new ForbiddenException(`You do not have access to this ${resourceName}.`);
      }

      return;
    }

    throw new ForbiddenException(`You do not have access to this ${resourceName}.`);
  }

  private async assertStartupOrOperatorProfileSideAccess(
    user: SessionUser,
    startupProfileId: string,
    operatorProfileId: string,
    resourceName: string,
  ) {
    if (this.isPlatformAdmin(user)) {
      return;
    }

    if (this.isStartupUser(user)) {
      const startupProfile = await this.prisma.startupProfile.findUnique({
        where: { id: startupProfileId },
        select: { startupId: true },
      });

      if (!startupProfile) {
        throw new NotFoundException('Startup profile not found.');
      }

      if (startupProfile.startupId !== user.orgId) {
        throw new ForbiddenException(`You do not have access to this ${resourceName}.`);
      }

      return;
    }

    if (this.isOperatorUser(user)) {
      const operatorProfile = await this.prisma.operatorProfile.findUnique({
        where: { id: operatorProfileId },
        select: { operatorId: true },
      });

      if (!operatorProfile) {
        throw new NotFoundException('Operator profile not found.');
      }

      if (operatorProfile.operatorId !== user.orgId) {
        throw new ForbiddenException(`You do not have access to this ${resourceName}.`);
      }

      return;
    }

    throw new ForbiddenException(`You do not have access to this ${resourceName}.`);
  }
}
