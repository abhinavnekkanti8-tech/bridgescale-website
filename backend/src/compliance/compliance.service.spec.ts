import { NotFoundException } from '@nestjs/common';
import { ComplianceService } from './compliance.service';

describe('ComplianceService', () => {
  function createService(prismaOverrides?: Record<string, unknown>) {
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue(null), update: jest.fn() },
      application: {
        findMany: jest.fn().mockResolvedValue([]),
        update: jest.fn(),
      },
      statementOfWork: { findMany: jest.fn().mockResolvedValue([]) },
      engagement: { findMany: jest.fn().mockResolvedValue([]) },
      workspaceNote: {
        findMany: jest.fn().mockResolvedValue([]),
        updateMany: jest.fn(),
      },
      engagementRating: {
        findMany: jest.fn().mockResolvedValue([]),
        updateMany: jest.fn(),
      },
      escalationCase: { updateMany: jest.fn() },
      oAuthIdentity: { deleteMany: jest.fn() },
      emailActionToken: { deleteMany: jest.fn() },
      operatorProfile: { updateMany: jest.fn() },
      startupProfile: { updateMany: jest.fn() },
      dataSubjectRequest: {
        create: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
      $transaction: jest.fn(),
      ...prismaOverrides,
    };

    return { service: new ComplianceService(prisma as any), prisma };
  }

  it('rejects export requests when no subject data exists', async () => {
    const { service } = createService();

    await expect(
      service.exportSubjectData('nobody@example.com', {
        id: 'admin_1',
        email: 'admin@example.com',
        name: 'Admin',
        orgId: 'org_admin',
        role: 'PLATFORM_ADMIN' as any,
        status: 'ACTIVE' as any,
        stage: 'ACTIVE' as any,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('anonymizes stored records during a delete request', async () => {
    const user = {
      id: 'user_1',
      name: 'Priya',
      email: 'priya@example.com',
      status: 'ACTIVE',
      onboardingStage: 'ACTIVE',
      createdAt: new Date(),
      memberships: [],
      authIdentities: [],
    };
    const applications = [
      {
        id: 'app_1',
        type: 'TALENT',
        status: 'SUBMITTED',
        name: 'Priya',
        email: 'priya@example.com',
        cvFileUrl: null,
        createdAt: new Date(),
      },
    ];

    const userUpdate = jest.fn();
    const applicationUpdate = jest.fn();
    const requestCreate = jest.fn().mockResolvedValue({ id: 'req_1', type: 'DELETE' });

    const { service, prisma } = createService({
      user: {
        findUnique: jest.fn().mockResolvedValue(user),
        update: userUpdate,
      },
      application: {
        findMany: jest.fn().mockResolvedValue(applications),
        update: applicationUpdate,
      },
      $transaction: jest.fn(async (callback: any) =>
        callback({
          oAuthIdentity: { deleteMany: jest.fn() },
          emailActionToken: { deleteMany: jest.fn() },
          workspaceNote: { updateMany: jest.fn() },
          escalationCase: { updateMany: jest.fn() },
          engagementRating: { updateMany: jest.fn() },
          user: { update: userUpdate },
          operatorProfile: { updateMany: jest.fn() },
          startupProfile: { updateMany: jest.fn() },
          application: { update: applicationUpdate },
          dataSubjectRequest: { create: requestCreate },
        }),
      ),
    });

    const result = await service.deleteSubjectData('priya@example.com', {
      id: 'admin_1',
      email: 'admin@example.com',
      name: 'Admin',
      orgId: 'org_admin',
      role: 'PLATFORM_ADMIN' as any,
      status: 'ACTIVE' as any,
      stage: 'ACTIVE' as any,
    });

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(userUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'Deleted User',
          email: 'deleted+user_1@redacted.local',
        }),
      }),
    );
    expect(applicationUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'Deleted Applicant',
          email: 'deleted+user_1@redacted.local',
          cvFileName: null,
          cvFileUrl: null,
        }),
      }),
    );
    expect(result.summary).toEqual(
      expect.objectContaining({
        anonymizedUser: true,
        anonymizedApplications: 1,
      }),
    );
  });
});
