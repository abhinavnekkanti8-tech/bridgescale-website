import { BadRequestException } from '@nestjs/common';
import { createHmac } from 'crypto';
import { ApplicationsService } from './applications.service';
import { ApplicationTypeDto } from './dto/create-application.dto';
import { CURRENT_NOTICE_VERSION } from '../legal/legal.constants';

describe('ApplicationsService.verifyAndParseStripeWebhook', () => {
  function createService(webhookSecret: string) {
    return new ApplicationsService(
      {} as any,
      {
        get: jest.fn((key: string, defaultValue?: string) => {
          if (key === 'STRIPE_WEBHOOK_SECRET') {
            return webhookSecret;
          }

          return defaultValue;
        }),
      } as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );
  }

  function buildSignature(secret: string, rawBody: string, timestamp: number) {
    const signature = createHmac('sha256', secret)
      .update(`${timestamp}.${rawBody}`, 'utf8')
      .digest('hex');

    return `t=${timestamp},v1=${signature}`;
  }

  it('accepts a valid stripe webhook signature', () => {
    const secret = 'whsec_valid_secret_value_12345';
    const service = createService(secret);
    const rawBody = JSON.stringify({
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_test_123' } },
    });
    const timestamp = Math.floor(Date.now() / 1000);

    const event = service.verifyAndParseStripeWebhook(
      rawBody,
      buildSignature(secret, rawBody, timestamp),
    );

    expect(event.type).toBe('checkout.session.completed');
    expect(event.data?.object?.id).toBe('cs_test_123');
  });

  it('rejects missing stripe signatures', () => {
    const service = createService('whsec_valid_secret_value_12345');

    expect(() => service.verifyAndParseStripeWebhook('{"type":"checkout.session.completed"}', '')).toThrow(
      BadRequestException,
    );
  });

  it('rejects invalid stripe signatures', () => {
    const secret = 'whsec_valid_secret_value_12345';
    const service = createService(secret);
    const rawBody = JSON.stringify({
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_test_123' } },
    });
    const timestamp = Math.floor(Date.now() / 1000);

    expect(() =>
      service.verifyAndParseStripeWebhook(
        rawBody,
        `t=${timestamp},v1=definitely-not-valid`,
      ),
    ).toThrow(BadRequestException);
  });

  it('rejects malformed payloads even when the signature is valid', () => {
    const secret = 'whsec_valid_secret_value_12345';
    const service = createService(secret);
    const rawBody = '{"type":';
    const timestamp = Math.floor(Date.now() / 1000);

    expect(() =>
      service.verifyAndParseStripeWebhook(
        rawBody,
        buildSignature(secret, rawBody, timestamp),
      ),
    ).toThrow(BadRequestException);
  });
});

describe('ApplicationsService consent enforcement', () => {
  function createService(prismaOverrides?: Record<string, unknown>) {
    const prisma = {
      application: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
      },
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        update: jest.fn(),
      },
      organization: {
        create: jest.fn(),
      },
      membership: {
        create: jest.fn(),
      },
      $transaction: jest.fn(),
      ...prismaOverrides,
    };

    return {
      service: new ApplicationsService(
        prisma as any,
        { get: jest.fn((_: string, defaultValue?: string) => defaultValue) } as any,
        {
          sendApplicationReceived: jest.fn().mockResolvedValue(undefined),
          sendStatusUpdate: jest.fn().mockResolvedValue(undefined),
        } as any,
        {} as any,
        {} as any,
        {} as any,
        {
          sendEmailVerification: jest.fn().mockResolvedValue(undefined),
        } as any,
      ),
      prisma,
    };
  }

  it('rejects company application creation when legal acceptance is missing', async () => {
    const { service } = createService();

    await expect(
      service.createApplication({
        type: ApplicationTypeDto.COMPANY,
        name: 'Ravi Founder',
        email: 'ravi@example.com',
        password: 'Password!123',
        companyName: 'Acme',
        companyStage: 'Seed',
        needArea: 'Pipeline generation',
        targetMarkets: 'EU',
        budgetRange: 'INR 5L',
        urgency: 'Within a month',
        privacyAccepted: false,
        termsAccepted: true,
        noticeVersion: CURRENT_NOTICE_VERSION,
      } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('persists notice acceptance on a company application and user record', async () => {
    let createdUserPayload: Record<string, unknown> | undefined;
    let createdApplicationPayload: Record<string, unknown> | undefined;

    const { service } = createService({
      $transaction: jest.fn(async (callback: any) =>
        callback({
          organization: {
            create: jest.fn().mockResolvedValue({ id: 'org_1' }),
          },
          user: {
            create: jest.fn(async ({ data }: any) => {
              createdUserPayload = data;
              return { id: 'user_1', name: data.name, email: data.email };
            }),
          },
          membership: {
            create: jest.fn().mockResolvedValue({ id: 'membership_1' }),
          },
          application: {
            create: jest.fn(async ({ data }: any) => {
              createdApplicationPayload = data;
              return { id: 'app_1', ...data };
            }),
          },
        }),
      ),
    });

    await service.createApplication({
      type: ApplicationTypeDto.COMPANY,
      name: 'Ravi Founder',
      email: 'ravi@example.com',
      password: 'Password!123',
      companyName: 'Acme',
      companyStage: 'Seed',
      needArea: 'Pipeline generation',
      targetMarkets: 'EU',
      budgetRange: 'INR 5L',
      urgency: 'Within a month',
      privacyAccepted: true,
      termsAccepted: true,
      noticeVersion: CURRENT_NOTICE_VERSION,
    } as any);

    expect(createdUserPayload?.privacyAcceptedAt).toBeInstanceOf(Date);
    expect(createdUserPayload?.termsAcceptedAt).toBeInstanceOf(Date);
    expect(createdUserPayload?.noticeVersion).toBe(CURRENT_NOTICE_VERSION);
    expect(createdApplicationPayload?.privacyAcceptedAt).toBeInstanceOf(Date);
    expect(createdApplicationPayload?.termsAcceptedAt).toBeInstanceOf(Date);
    expect(createdApplicationPayload?.noticeVersion).toBe(CURRENT_NOTICE_VERSION);
  });
});
