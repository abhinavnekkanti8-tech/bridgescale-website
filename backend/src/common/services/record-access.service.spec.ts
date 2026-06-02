import { ForbiddenException } from '@nestjs/common';
import { MembershipRole } from '@prisma/client';
import { RecordAccessService } from './record-access.service';

describe('RecordAccessService', () => {
  const startupUser = {
    id: 'user-startup',
    email: 'founder@example.com',
    name: 'Founder',
    role: MembershipRole.STARTUP_ADMIN,
    orgId: 'org-startup-a',
    status: 'ACTIVE',
    stage: 'ACTIVE',
  } as any;

  const operatorUser = {
    id: 'user-operator',
    email: 'operator@example.com',
    name: 'Operator',
    role: MembershipRole.OPERATOR,
    orgId: 'org-operator-a',
    status: 'ACTIVE',
    stage: 'ACTIVE',
  } as any;

  function createService(overrides: Partial<Record<string, any>> = {}) {
    const prisma = {
      startupProfile: {
        findUnique: jest.fn(),
      },
      operatorProfile: {
        findUnique: jest.fn(),
      },
      application: {
        findUnique: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
      discoveryCall: {
        findUnique: jest.fn(),
      },
      matchShortlist: {
        findUnique: jest.fn(),
      },
      matchCandidate: {
        findUnique: jest.fn(),
      },
      statementOfWork: {
        findUnique: jest.fn(),
      },
      contract: {
        findUnique: jest.fn(),
      },
      engagement: {
        findUnique: jest.fn(),
      },
      engagementMilestone: {
        findUnique: jest.fn(),
      },
      systemNudge: {
        findUnique: jest.fn(),
      },
      membership: {
        findFirst: jest.fn(),
      },
      ...overrides,
    };

    return {
      service: new RecordAccessService(prisma as any),
      prisma,
    };
  }

  it('allows startup users to access their own startup profile', async () => {
    const { service, prisma } = createService();
    prisma.startupProfile.findUnique.mockResolvedValue({
      id: 'startup-profile-a',
      startupId: 'org-startup-a',
    });

    await expect(
      service.assertStartupProfileAccess(startupUser, 'startup-profile-a'),
    ).resolves.toEqual({
      id: 'startup-profile-a',
      startupId: 'org-startup-a',
    });
  });

  it('blocks startup users from accessing another startup profile', async () => {
    const { service, prisma } = createService();
    prisma.startupProfile.findUnique.mockResolvedValue({
      id: 'startup-profile-b',
      startupId: 'org-startup-b',
    });

    await expect(
      service.assertStartupProfileAccess(startupUser, 'startup-profile-b'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows operators to access their own candidate records', async () => {
    const { service, prisma } = createService();
    prisma.matchCandidate.findUnique.mockResolvedValue({
      id: 'candidate-a',
      shortlistId: 'shortlist-a',
      operatorId: 'org-operator-a',
      shortlist: { startupProfileId: 'startup-profile-a' },
    });
    prisma.operatorProfile.findUnique.mockResolvedValue({
      id: 'operator-profile-a',
      operatorId: 'org-operator-a',
    });

    await expect(
      service.assertCandidateAccess(operatorUser, 'candidate-a'),
    ).resolves.toMatchObject({
      id: 'candidate-a',
      operatorId: 'org-operator-a',
    });
  });

  it('blocks operators from accessing another operator candidate record', async () => {
    const { service, prisma } = createService();
    prisma.matchCandidate.findUnique.mockResolvedValue({
      id: 'candidate-b',
      shortlistId: 'shortlist-a',
      operatorId: 'org-operator-b',
      shortlist: { startupProfileId: 'startup-profile-a' },
    });
    prisma.operatorProfile.findUnique.mockResolvedValue({
      id: 'operator-profile-a',
      operatorId: 'org-operator-a',
    });

    await expect(
      service.assertCandidateAccess(operatorUser, 'candidate-b'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('resolves a startup user route param to their own startup profile id', async () => {
    const { service, prisma } = createService();
    prisma.startupProfile.findUnique.mockResolvedValue({
      id: 'startup-profile-a',
      startupId: 'org-startup-a',
    });

    await expect(
      service.resolveStartupProfileIdForAccess(startupUser, 'org-startup-a'),
    ).resolves.toBe('startup-profile-a');
  });

  it('resolves an operator user route param to their own operator org id', async () => {
    const { service, prisma } = createService();
    prisma.operatorProfile.findUnique.mockResolvedValue({
      id: 'operator-profile-a',
      operatorId: 'org-operator-a',
    });

    await expect(
      service.resolveOperatorOrgIdForAccess(operatorUser, 'operator-profile-a'),
    ).resolves.toBe('org-operator-a');
  });

  it('allows operator access to SOWs keyed by operator organization id', async () => {
    const { service, prisma } = createService();
    prisma.statementOfWork.findUnique.mockResolvedValue({
      id: 'sow-a',
      startupProfileId: 'startup-profile-a',
      operatorId: 'org-operator-a',
    });

    await expect(service.assertSowAccess(operatorUser, 'sow-a')).resolves.toMatchObject({
      id: 'sow-a',
      operatorId: 'org-operator-a',
    });
  });
});
