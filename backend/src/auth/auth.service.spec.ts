import { BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CURRENT_NOTICE_VERSION } from '../legal/legal.constants';

describe('AuthService.registerTalentWithPassword', () => {
  const usersService = {
    findByEmail: jest.fn(),
    touchLoginTimestamp: jest.fn(),
  };

  const configService = {
    get: jest.fn(),
  };

  const accountSecurityService = {
    sendEmailVerification: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    usersService.findByEmail.mockResolvedValue(null);
  });

  function createService(prismaOverrides?: Record<string, unknown>) {
    const prisma = {
      $transaction: jest.fn(),
      ...prismaOverrides,
    };

    return {
      service: new AuthService(
        usersService as any,
        prisma as any,
        configService as any,
        accountSecurityService as any,
      ),
      prisma,
    };
  }

  it('rejects talent signup when legal acceptance is missing', async () => {
    const { service } = createService();

    await expect(
      service.registerTalentWithPassword({
        name: 'Priya',
        email: 'priya@example.com',
        password: 'Password!123',
        privacyAccepted: false,
        termsAccepted: true,
        noticeVersion: CURRENT_NOTICE_VERSION,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('persists consent timestamps and notice version on the created user', async () => {
    let createdUserPayload: Record<string, unknown> | undefined;

    const { service, prisma } = createService({
      $transaction: jest.fn(async (callback: any) =>
        callback({
          organization: {
            create: jest.fn().mockResolvedValue({ id: 'org_1' }),
          },
          user: {
            create: jest.fn(async ({ data }: any) => {
              createdUserPayload = data;
              return {
                id: 'user_1',
                name: data.name,
                email: data.email,
              };
            }),
          },
          membership: {
            create: jest.fn().mockResolvedValue({ id: 'membership_1' }),
          },
        }),
      ),
    });

    await service.registerTalentWithPassword({
      name: 'Priya',
      email: 'priya@example.com',
      password: 'Password!123',
      privacyAccepted: true,
      termsAccepted: true,
      noticeVersion: CURRENT_NOTICE_VERSION,
    });

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(createdUserPayload).toEqual(
      expect.objectContaining({
        noticeVersion: CURRENT_NOTICE_VERSION,
      }),
    );
    expect(createdUserPayload?.privacyAcceptedAt).toBeInstanceOf(Date);
    expect(createdUserPayload?.termsAcceptedAt).toBeInstanceOf(Date);
  });
});
