/**
 * Unit tests — ContractsService (equity methods)
 *
 * Covers the full equity engagement path introduced in the
 * add_equity_engagement migration:
 *
 *   generateEquitySow        — cross-field validation & auto-review flag
 *   acknowledgeEquityLegal   — per-party gate, PLATFORM_ADMIN sets both
 *   requestEquityReview      — manual trigger
 *   approveEquityReview      — admin unblocks review gate (idempotent)
 *   approveSow (gates)       — legal-ack + equity-review block approval
 *   recordVestingEvent       — cumulative vestedPct, auto-FULLY_VESTED
 *   lapseEquityGrant         — retains vested portion, rejects terminal states
 *   accelerateEquityGrant    — sets 100% + ACCELERATED
 *   dummyVestGrant           — DUMMY_PAYMENT_MODE guard + activate + 33.33%
 *
 * Run: cd backend && npm test -- --testPathPattern contracts.service
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ContractsService } from './contracts.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { BadRequestException } from '@nestjs/common';
import { EquityTypeDto } from './dto/contracts.dto';

// ── Mock factories ────────────────────────────────────────────────────────────

function makeMockPrisma() {
  return {
    statementOfWork: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    sowVersion: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    contract: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    equityGrant: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    documentLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };
}

function makeMockAiService(): jest.Mocked<Pick<AiService, 'getModelName'>> {
  return {
    getModelName: jest.fn().mockReturnValue('mock-model'),
  };
}

function makeMockConfig(dummyMode = false): jest.Mocked<Pick<ConfigService, 'get'>> {
  return {
    get: jest.fn().mockReturnValue(dummyMode ? 'true' : 'false'),
  };
}

// ── SOW fixtures ──────────────────────────────────────────────────────────────

const BASE_SOW = {
  id: 'sow_001',
  packageType: 'HYBRID_EQUITY',
  status: 'REVIEW',
  currentVersion: 1,
  startupLegalAck: true,
  operatorLegalAck: true,
  equityReviewRequired: false,
  equityReviewApprovedAt: null,
  equityType: 'FAST',
  equityPct: null,
  fastValueUsd: 3_000_000,        // $30k — below $50k threshold
  equityCliffMonths: 6,
  equityVestingMonths: 36,
  versions: [],
  contract: null,
};

const BASE_EQUITY_GRANT = {
  id: 'grant_001',
  contractId: 'contract_001',
  equityType: 'FAST',
  equityPct: null,
  fastValueUsd: 3_000_000,
  vestingStartDate: null,
  cliffMonths: 6,
  vestingMonths: 36,
  status: 'PENDING',
  vestedPct: 0,
  lastEventAt: null,
  notes: null,
};

// ── Test suite ────────────────────────────────────────────────────────────────

describe('ContractsService — equity path', () => {
  let service: ContractsService;
  let prisma: ReturnType<typeof makeMockPrisma>;
  let aiService: ReturnType<typeof makeMockAiService>;
  let configService: ReturnType<typeof makeMockConfig>;

  async function buildModule(dummyMode = false) {
    prisma = makeMockPrisma();
    aiService = makeMockAiService();
    configService = makeMockConfig(dummyMode);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AiService, useValue: aiService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<ContractsService>(ContractsService);
  }

  beforeEach(() => buildModule(false));
  afterEach(() => jest.clearAllMocks());

  // ── generateEquitySow ──────────────────────────────────────────────────────

  describe('generateEquitySow', () => {
    const BASE_DTO = {
      shortlistId: 'sl_001',
      startupProfileId: 'sp_001',
      operatorId: 'op_001',
      equityCashComponentUsd: 300_000,
      equityType: EquityTypeDto.FAST,
      fastValueUsd: 3_000_000,       // $30k — below review threshold
      vestingSchedule: '6-month cliff, monthly over 30 months',
      weeklyHours: 20,
      totalCashUsd: 18_000_00,
    };

    beforeEach(() => {
      prisma.statementOfWork.create.mockResolvedValue({ id: 'sow_new', ...BASE_SOW });
      prisma.sowVersion.create.mockResolvedValue({ id: 'ver_001' });
    });

    it('throws BadRequestException when FAST type is missing fastValueUsd', async () => {
      const dto = { ...BASE_DTO, fastValueUsd: undefined };
      await expect(service.generateEquitySow(dto as any)).rejects.toThrow(BadRequestException);
      expect(prisma.statementOfWork.create).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when DIRECT type is missing equityPct', async () => {
      const dto = { ...BASE_DTO, equityType: EquityTypeDto.DIRECT, fastValueUsd: undefined };
      await expect(service.generateEquitySow(dto as any)).rejects.toThrow(BadRequestException);
    });

    it('does NOT flag equityReviewRequired when FAST notional is below $50k threshold', async () => {
      await service.generateEquitySow(BASE_DTO);

      const createCall = prisma.statementOfWork.create.mock.calls[0][0];
      expect(createCall.data.equityReviewRequired).toBe(false);
    });

    it('auto-sets equityReviewRequired when FAST notional exceeds $50k', async () => {
      const dto = { ...BASE_DTO, fastValueUsd: 5_100_000 }; // $51k
      await service.generateEquitySow(dto);

      const createCall = prisma.statementOfWork.create.mock.calls[0][0];
      expect(createCall.data.equityReviewRequired).toBe(true);
    });

    it('auto-sets equityReviewRequired when DIRECT equity exceeds 2%', async () => {
      const dto = {
        ...BASE_DTO,
        equityType: EquityTypeDto.DIRECT,
        fastValueUsd: undefined,
        equityPct: 2.5,
      };
      await service.generateEquitySow(dto as any);

      const createCall = prisma.statementOfWork.create.mock.calls[0][0];
      expect(createCall.data.equityReviewRequired).toBe(true);
    });

    it('does NOT flag review when DIRECT equity is exactly at the 2% threshold', async () => {
      const dto = {
        ...BASE_DTO,
        equityType: EquityTypeDto.DIRECT,
        fastValueUsd: undefined,
        equityPct: 2.0,   // exactly 2%, not exceeding
      };
      await service.generateEquitySow(dto as any);

      const createCall = prisma.statementOfWork.create.mock.calls[0][0];
      expect(createCall.data.equityReviewRequired).toBe(false);
    });

    it('creates a version snapshot alongside the SOW', async () => {
      await service.generateEquitySow(BASE_DTO);

      expect(prisma.sowVersion.create).toHaveBeenCalledTimes(1);
      const versionCall = prisma.sowVersion.create.mock.calls[0][0];
      expect(versionCall.data.version).toBe(1);
      expect(versionCall.data.changedBy).toBe('SYSTEM');
    });

    it('persists equity fields on the created SOW', async () => {
      await service.generateEquitySow(BASE_DTO);

      const createCall = prisma.statementOfWork.create.mock.calls[0][0];
      expect(createCall.data.equityType).toBe(EquityTypeDto.FAST);
      expect(createCall.data.fastValueUsd).toBe(BASE_DTO.fastValueUsd);
      expect(createCall.data.vestingSchedule).toBe(BASE_DTO.vestingSchedule);
      expect(createCall.data.equityCliffMonths).toBe(6);   // default applied
      expect(createCall.data.equityVestingMonths).toBe(36); // default applied
    });
  });

  // ── acknowledgeEquityLegal ─────────────────────────────────────────────────

  describe('acknowledgeEquityLegal', () => {
    beforeEach(() => {
      prisma.statementOfWork.findUnique.mockResolvedValue({
        ...BASE_SOW,
        startupLegalAck: false,
        operatorLegalAck: false,
      });
      prisma.statementOfWork.update.mockImplementation(({ data }) =>
        Promise.resolve({ ...BASE_SOW, ...data }),
      );
    });

    it('sets only startupLegalAck for STARTUP role', async () => {
      await service.acknowledgeEquityLegal('sow_001', 'STARTUP');

      const updateCall = prisma.statementOfWork.update.mock.calls[0][0];
      expect(updateCall.data.startupLegalAck).toBe(true);
      expect(updateCall.data.operatorLegalAck).toBeUndefined();
    });

    it('sets only operatorLegalAck for OPERATOR role', async () => {
      await service.acknowledgeEquityLegal('sow_001', 'OPERATOR');

      const updateCall = prisma.statementOfWork.update.mock.calls[0][0];
      expect(updateCall.data.operatorLegalAck).toBe(true);
      expect(updateCall.data.startupLegalAck).toBeUndefined();
    });

    it('sets both acks for PLATFORM_ADMIN role', async () => {
      await service.acknowledgeEquityLegal('sow_001', 'PLATFORM_ADMIN');

      const updateCall = prisma.statementOfWork.update.mock.calls[0][0];
      expect(updateCall.data.startupLegalAck).toBe(true);
      expect(updateCall.data.operatorLegalAck).toBe(true);
    });

    it('throws BadRequestException for a non-equity SOW', async () => {
      prisma.statementOfWork.findUnique.mockResolvedValue({
        ...BASE_SOW,
        packageType: 'PIPELINE_SPRINT',
      });

      await expect(
        service.acknowledgeEquityLegal('sow_001', 'STARTUP'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException for a locked SOW', async () => {
      prisma.statementOfWork.findUnique.mockResolvedValue({
        ...BASE_SOW,
        status: 'LOCKED',
      });

      await expect(
        service.acknowledgeEquityLegal('sow_001', 'STARTUP'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── requestEquityReview ────────────────────────────────────────────────────

  describe('requestEquityReview', () => {
    beforeEach(() => {
      prisma.statementOfWork.findUnique.mockResolvedValue({
        ...BASE_SOW,
        equityReviewRequired: false,
        status: 'REVIEW',
      });
      prisma.statementOfWork.update.mockResolvedValue({
        ...BASE_SOW,
        equityReviewRequired: true,
      });
    });

    it('sets equityReviewRequired to true', async () => {
      await service.requestEquityReview('sow_001');

      const updateCall = prisma.statementOfWork.update.mock.calls[0][0];
      expect(updateCall.data.equityReviewRequired).toBe(true);
    });

    it('throws BadRequestException for a non-equity SOW', async () => {
      prisma.statementOfWork.findUnique.mockResolvedValue({
        ...BASE_SOW,
        packageType: 'BD_SPRINT',
      });

      await expect(service.requestEquityReview('sow_001')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ── approveEquityReview ────────────────────────────────────────────────────

  describe('approveEquityReview', () => {
    beforeEach(() => {
      prisma.statementOfWork.findUnique.mockResolvedValue({
        ...BASE_SOW,
        equityReviewRequired: true,
        equityReviewApprovedAt: null,
      });
      prisma.statementOfWork.update.mockImplementation(({ data }) =>
        Promise.resolve({ ...BASE_SOW, ...data }),
      );
    });

    it('sets equityReviewApprovedAt to a Date', async () => {
      await service.approveEquityReview('sow_001');

      const updateCall = prisma.statementOfWork.update.mock.calls[0][0];
      expect(updateCall.data.equityReviewApprovedAt).toBeInstanceOf(Date);
    });

    it('is idempotent — returns immediately if already approved', async () => {
      prisma.statementOfWork.findUnique.mockResolvedValue({
        ...BASE_SOW,
        equityReviewRequired: true,
        equityReviewApprovedAt: new Date('2026-01-01'),
      });

      await service.approveEquityReview('sow_001');

      expect(prisma.statementOfWork.update).not.toHaveBeenCalled();
    });

    it('throws if equity review was not required', async () => {
      prisma.statementOfWork.findUnique.mockResolvedValue({
        ...BASE_SOW,
        equityReviewRequired: false,
      });

      await expect(service.approveEquityReview('sow_001')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ── approveSow — equity gates ──────────────────────────────────────────────

  describe('approveSow (equity gates)', () => {
    beforeEach(() => {
      prisma.contract.create.mockResolvedValue({ id: 'contract_001' });
    });

    it('throws when startupLegalAck is false', async () => {
      prisma.statementOfWork.findUnique.mockResolvedValue({
        ...BASE_SOW,
        startupLegalAck: false,
        operatorLegalAck: true,
      });

      await expect(service.approveSow('sow_001')).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.contract.create).not.toHaveBeenCalled();
    });

    it('throws when operatorLegalAck is false', async () => {
      prisma.statementOfWork.findUnique.mockResolvedValue({
        ...BASE_SOW,
        startupLegalAck: true,
        operatorLegalAck: false,
      });

      await expect(service.approveSow('sow_001')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws when equityReviewRequired and equityReviewApprovedAt is null', async () => {
      prisma.statementOfWork.findUnique.mockResolvedValue({
        ...BASE_SOW,
        startupLegalAck: true,
        operatorLegalAck: true,
        equityReviewRequired: true,
        equityReviewApprovedAt: null,
      });

      await expect(service.approveSow('sow_001')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('approves when both acks pass and review gate is not required', async () => {
      prisma.statementOfWork.findUnique.mockResolvedValue({
        ...BASE_SOW,
        startupLegalAck: true,
        operatorLegalAck: true,
        equityReviewRequired: false,
      });
      prisma.statementOfWork.update.mockResolvedValue({
        ...BASE_SOW,
        status: 'APPROVED',
      });

      await service.approveSow('sow_001');

      const contractCreate = prisma.contract.create.mock.calls[0][0];
      expect(contractCreate.data.hasEquityComponent).toBe(true);
    });

    it('approves when review was required AND approved', async () => {
      prisma.statementOfWork.findUnique.mockResolvedValue({
        ...BASE_SOW,
        startupLegalAck: true,
        operatorLegalAck: true,
        equityReviewRequired: true,
        equityReviewApprovedAt: new Date('2026-04-01'),
      });
      prisma.statementOfWork.update.mockResolvedValue({
        ...BASE_SOW,
        status: 'APPROVED',
      });

      await service.approveSow('sow_001');

      expect(prisma.contract.create).toHaveBeenCalledTimes(1);
    });

    it('does NOT set hasEquityComponent for non-equity SOW', async () => {
      prisma.statementOfWork.findUnique.mockResolvedValue({
        ...BASE_SOW,
        packageType: 'PIPELINE_SPRINT',
        status: 'REVIEW',
      });
      prisma.statementOfWork.update.mockResolvedValue({
        ...BASE_SOW,
        status: 'APPROVED',
      });

      await service.approveSow('sow_001');

      const contractCreate = prisma.contract.create.mock.calls[0][0];
      expect(contractCreate.data.hasEquityComponent).toBe(false);
    });
  });

  // ── recordVestingEvent ─────────────────────────────────────────────────────

  describe('recordVestingEvent', () => {
    const ACTIVE_GRANT = { ...BASE_EQUITY_GRANT, status: 'ACTIVE', vestedPct: 16.67 };

    beforeEach(() => {
      prisma.equityGrant.findUnique.mockResolvedValue(ACTIVE_GRANT);
      prisma.equityGrant.update.mockImplementation(({ data }) =>
        Promise.resolve({ ...ACTIVE_GRANT, ...data }),
      );
    });

    it('throws when grant is not ACTIVE', async () => {
      prisma.equityGrant.findUnique.mockResolvedValue({
        ...ACTIVE_GRANT,
        status: 'PENDING',
      });

      await expect(
        service.recordVestingEvent('contract_001', { vestedPct: 33.33 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws when new vestedPct is less than current value', async () => {
      await expect(
        service.recordVestingEvent('contract_001', { vestedPct: 10 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('records a vesting checkpoint and keeps status ACTIVE', async () => {
      await service.recordVestingEvent('contract_001', { vestedPct: 33.34 });

      const updateCall = prisma.equityGrant.update.mock.calls[0][0];
      expect(updateCall.data.vestedPct).toBe(33.34);
      expect(updateCall.data.status).toBe('ACTIVE');
    });

    it('auto-transitions to FULLY_VESTED when vestedPct reaches 100', async () => {
      await service.recordVestingEvent('contract_001', { vestedPct: 100 });

      const updateCall = prisma.equityGrant.update.mock.calls[0][0];
      expect(updateCall.data.status).toBe('FULLY_VESTED');
      expect(updateCall.data.vestedPct).toBe(100);
    });

    it('caps vestedPct at 100 even if caller sends > 100', async () => {
      await service.recordVestingEvent('contract_001', { vestedPct: 110 });

      const updateCall = prisma.equityGrant.update.mock.calls[0][0];
      expect(updateCall.data.vestedPct).toBe(100);
    });
  });

  // ── lapseEquityGrant ───────────────────────────────────────────────────────

  describe('lapseEquityGrant', () => {
    const ACTIVE_GRANT = { ...BASE_EQUITY_GRANT, status: 'ACTIVE', vestedPct: 33.33 };

    beforeEach(() => {
      prisma.equityGrant.findUnique.mockResolvedValue(ACTIVE_GRANT);
      prisma.equityGrant.update.mockImplementation(({ data }) =>
        Promise.resolve({ ...ACTIVE_GRANT, ...data }),
      );
    });

    it('transitions to LAPSED and retains vestedPct', async () => {
      await service.lapseEquityGrant('contract_001', {
        notes: 'Engagement terminated by startup',
      });

      const updateCall = prisma.equityGrant.update.mock.calls[0][0];
      expect(updateCall.data.status).toBe('LAPSED');
      // vestedPct is NOT zeroed out — retained as-is
      expect(updateCall.data.vestedPct).toBeUndefined();
    });

    it('records the lapse reason in notes', async () => {
      const reason = 'Mutual termination 2026-07-01';
      await service.lapseEquityGrant('contract_001', { notes: reason });

      const updateCall = prisma.equityGrant.update.mock.calls[0][0];
      expect(updateCall.data.notes).toBe(reason);
    });

    it('also lapses a PENDING grant', async () => {
      prisma.equityGrant.findUnique.mockResolvedValue({
        ...ACTIVE_GRANT,
        status: 'PENDING',
      });

      await expect(
        service.lapseEquityGrant('contract_001', { notes: 'Never started' }),
      ).resolves.toBeDefined();
    });

    it('throws when grant is already in a terminal state', async () => {
      for (const terminalStatus of ['FULLY_VESTED', 'LAPSED', 'ACCELERATED']) {
        prisma.equityGrant.findUnique.mockResolvedValue({
          ...ACTIVE_GRANT,
          status: terminalStatus,
        });

        await expect(
          service.lapseEquityGrant('contract_001', { notes: 'test' }),
        ).rejects.toThrow(BadRequestException);
      }
    });
  });

  // ── accelerateEquityGrant ──────────────────────────────────────────────────

  describe('accelerateEquityGrant', () => {
    const ACTIVE_GRANT = { ...BASE_EQUITY_GRANT, status: 'ACTIVE', vestedPct: 50 };

    beforeEach(() => {
      prisma.equityGrant.findUnique.mockResolvedValue(ACTIVE_GRANT);
      prisma.equityGrant.update.mockImplementation(({ data }) =>
        Promise.resolve({ ...ACTIVE_GRANT, ...data }),
      );
    });

    it('sets vestedPct to 100 and status to ACCELERATED', async () => {
      await service.accelerateEquityGrant('contract_001', { notes: 'Acquisition by Acme' });

      const updateCall = prisma.equityGrant.update.mock.calls[0][0];
      expect(updateCall.data.vestedPct).toBe(100);
      expect(updateCall.data.status).toBe('ACCELERATED');
    });

    it('throws when grant is already in a terminal state', async () => {
      prisma.equityGrant.findUnique.mockResolvedValue({
        ...ACTIVE_GRANT,
        status: 'FULLY_VESTED',
      });

      await expect(
        service.accelerateEquityGrant('contract_001', { notes: 'test' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── dummyVestGrant ─────────────────────────────────────────────────────────

  describe('dummyVestGrant', () => {
    describe('when DUMMY_PAYMENT_MODE is false', () => {
      it('throws BadRequestException in production mode', async () => {
        // default module is production mode (dummyMode=false)
        prisma.equityGrant.findUnique.mockResolvedValue({
          ...BASE_EQUITY_GRANT,
          status: 'PENDING',
        });

        await expect(service.dummyVestGrant('contract_001')).rejects.toThrow(
          BadRequestException,
        );
        expect(prisma.equityGrant.update).not.toHaveBeenCalled();
      });
    });

    describe('when DUMMY_PAYMENT_MODE is true', () => {
      beforeEach(() => buildModule(true)); // rebuild with dummy mode ON

      it('activates a PENDING grant before vesting', async () => {
        prisma.equityGrant.findUnique
          .mockResolvedValueOnce({ ...BASE_EQUITY_GRANT, status: 'PENDING' })   // getEquityGrant
          .mockResolvedValueOnce({ ...BASE_EQUITY_GRANT, status: 'PENDING' })   // activateEquityGrant → getEquityGrant
          .mockResolvedValueOnce({ ...BASE_EQUITY_GRANT, status: 'ACTIVE' });   // recordVestingEvent → getEquityGrant

        prisma.equityGrant.update
          .mockResolvedValueOnce({ ...BASE_EQUITY_GRANT, status: 'ACTIVE', vestingStartDate: new Date() })
          .mockResolvedValueOnce({ ...BASE_EQUITY_GRANT, status: 'ACTIVE', vestedPct: 33.33 });

        await service.dummyVestGrant('contract_001');

        // First update call must be the activate call
        const activateCall = prisma.equityGrant.update.mock.calls[0][0];
        expect(activateCall.data.status).toBe('ACTIVE');
        expect(activateCall.data.vestingStartDate).toBeInstanceOf(Date);
      });

      it('adds 33.33% to current vestedPct on each dummy vest', async () => {
        // Grant already at 33.33 (one prior cliff event)
        const halfVested = { ...BASE_EQUITY_GRANT, status: 'ACTIVE', vestedPct: 33.33 };
        prisma.equityGrant.findUnique
          .mockResolvedValueOnce(halfVested)   // dummyVestGrant initial fetch
          .mockResolvedValueOnce(halfVested);  // recordVestingEvent fetch

        prisma.equityGrant.update.mockImplementation(({ data }) =>
          Promise.resolve({ ...halfVested, ...data }),
        );

        await service.dummyVestGrant('contract_001');

        const vestCall = prisma.equityGrant.update.mock.calls[0][0];
        // 33.33 + 33.33 = 66.66
        expect(vestCall.data.vestedPct).toBeCloseTo(66.66, 1);
      });

      it('caps dummy vest at 100 even on multiple calls', async () => {
        // Grant already at 80%
        const nearFull = { ...BASE_EQUITY_GRANT, status: 'ACTIVE', vestedPct: 80 };
        prisma.equityGrant.findUnique
          .mockResolvedValueOnce(nearFull)
          .mockResolvedValueOnce(nearFull);

        prisma.equityGrant.update.mockImplementation(({ data }) =>
          Promise.resolve({ ...nearFull, ...data }),
        );

        await service.dummyVestGrant('contract_001');

        const vestCall = prisma.equityGrant.update.mock.calls[0][0];
        expect(vestCall.data.vestedPct).toBe(100); // 80 + 33.33 > 100 → capped
      });
    });
  });
});
