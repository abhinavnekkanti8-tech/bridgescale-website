/**
 * Integration test stubs — TalentPreScreenService
 *
 * These tests run entirely against DUMMY_AI_MODE (no live OpenAI calls).
 * Set DUMMY_AI_MODE=true in your test environment (or .env.test) to ensure
 * the mock path is always used here.
 *
 * Run: cd backend && npm test -- --testPathPattern talent-pre-screen
 */
import { Test, TestingModule } from '@nestjs/testing';
import { TalentPreScreenService } from './talent-pre-screen.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { NotFoundException } from '@nestjs/common';

// ── Shared mock factories ────────────────────────────────────────────────────

const MOCK_PRESCREEN_OUTPUT = {
  recommendation: 'PASS' as const,
  completenessScore: 75,
  consistencyScore: 80,
  referenceScore: 85,
  assessmentScore: 70,
  redFlags: [],
  suggestedProbeQuestions: [
    'How do you measure success in a fractional role?',
    'What type of founder environment brings out your best work?',
  ],
  linkedinVerification: { verified: true, confidence: 'medium' as const },
};

function makeMockAiService(): jest.Mocked<Pick<AiService, 'generateTalentPreScreen'>> {
  return {
    generateTalentPreScreen: jest.fn().mockResolvedValue(MOCK_PRESCREEN_OUTPUT),
  };
}

function makeMockPrisma() {
  return {
    application: {
      findUnique: jest.fn(),
    },
    talentPreScreen: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
}

// ── Test suite ───────────────────────────────────────────────────────────────

describe('TalentPreScreenService', () => {
  let service: TalentPreScreenService;
  let prisma: ReturnType<typeof makeMockPrisma>;
  let aiService: ReturnType<typeof makeMockAiService>;

  beforeEach(async () => {
    prisma = makeMockPrisma();
    aiService = makeMockAiService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TalentPreScreenService,
        { provide: PrismaService, useValue: prisma },
        { provide: AiService, useValue: aiService },
      ],
    }).compile();

    service = module.get<TalentPreScreenService>(TalentPreScreenService);
  });

  afterEach(() => jest.clearAllMocks());

  // ── generatePreScreen ──────────────────────────────────────────────────────

  describe('generatePreScreen', () => {
    const APPLICATION_ID = 'app_talent_001';

    const MOCK_APPLICATION = {
      id: APPLICATION_ID,
      type: 'TALENT',
      yearsExperience: 8,
      currentRole: 'VP Sales',
      linkedInUrl: 'https://linkedin.com/in/testuser',
      caseStudyResponse: 'I built a pipeline from scratch for a Series A SaaS company, achieving $2M ARR in 12 months through targeted outbound and partnership channels.',
      references: [
        { name: 'Jane Doe', email: 'jane@example.com' },
        { name: 'John Smith', email: 'john@example.com' },
      ],
      employmentStatus: 'AVAILABLE',
      earliestStart: new Date('2026-05-01'),
      rateExpectationMin: 5000,
      rateExpectationMax: 8000,
      markets: 'EU',
    };

    it('returns existing pre-screen without re-generating', async () => {
      const existing = { id: 'ps_001', applicationId: APPLICATION_ID };
      prisma.application.findUnique.mockResolvedValue(MOCK_APPLICATION);
      prisma.talentPreScreen.findUnique.mockResolvedValue(existing);

      const result = await service.generatePreScreen(APPLICATION_ID);

      expect(result).toEqual(existing);
      expect(aiService.generateTalentPreScreen).not.toHaveBeenCalled();
    });

    it('calls AiService.generateTalentPreScreen with the correct input shape', async () => {
      prisma.application.findUnique.mockResolvedValue(MOCK_APPLICATION);
      prisma.talentPreScreen.findUnique.mockResolvedValue(null);
      prisma.talentPreScreen.create.mockResolvedValue({
        id: 'ps_002',
        applicationId: APPLICATION_ID,
        ...MOCK_PRESCREEN_OUTPUT,
        application: MOCK_APPLICATION,
      });

      await service.generatePreScreen(APPLICATION_ID);

      expect(aiService.generateTalentPreScreen).toHaveBeenCalledTimes(1);
      const callArg = (aiService.generateTalentPreScreen as jest.Mock).mock.calls[0][0];
      expect(callArg).toMatchObject({
        yearsExperience: 8,
        currentRole: 'VP Sales',
        linkedInUrl: 'https://linkedin.com/in/testuser',
      });
    });

    it('persists the pre-screen record with all score fields', async () => {
      prisma.application.findUnique.mockResolvedValue(MOCK_APPLICATION);
      prisma.talentPreScreen.findUnique.mockResolvedValue(null);
      prisma.talentPreScreen.create.mockResolvedValue({
        id: 'ps_003',
        applicationId: APPLICATION_ID,
        ...MOCK_PRESCREEN_OUTPUT,
        application: MOCK_APPLICATION,
      });

      const result = await service.generatePreScreen(APPLICATION_ID);

      expect(prisma.talentPreScreen.create).toHaveBeenCalledTimes(1);
      const createCall = (prisma.talentPreScreen.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data).toMatchObject({
        applicationId: APPLICATION_ID,
        recommendation: 'PASS',
        completenessScore: 75,
        consistencyScore: 80,
        referenceScore: 85,
        assessmentScore: 70,
      });
      expect(result).toBeDefined();
    });

    it('maps application.markets string to array input', async () => {
      prisma.application.findUnique.mockResolvedValue(MOCK_APPLICATION);
      prisma.talentPreScreen.findUnique.mockResolvedValue(null);
      prisma.talentPreScreen.create.mockResolvedValue({
        id: 'ps_004',
        applicationId: APPLICATION_ID,
        ...MOCK_PRESCREEN_OUTPUT,
        application: MOCK_APPLICATION,
      });

      await service.generatePreScreen(APPLICATION_ID);

      const callArg = (aiService.generateTalentPreScreen as jest.Mock).mock.calls[0][0];
      expect(Array.isArray(callArg.markets)).toBe(true);
      expect(callArg.markets).toContain('EU');
    });

    it('throws NotFoundException when application does not exist', async () => {
      prisma.application.findUnique.mockResolvedValue(null);

      await expect(service.generatePreScreen(APPLICATION_ID)).rejects.toThrow(NotFoundException);
    });
  });

  // ── getPreScreenByApplicationId ────────────────────────────────────────────

  describe('getPreScreenByApplicationId', () => {
    it('returns a found pre-screen', async () => {
      const ps = { id: 'ps_001', applicationId: 'app_001' };
      prisma.talentPreScreen.findUnique.mockResolvedValue(ps);

      await expect(service.getPreScreenByApplicationId('app_001')).resolves.toEqual(ps);
    });

    it('throws NotFoundException when pre-screen does not exist', async () => {
      prisma.talentPreScreen.findUnique.mockResolvedValue(null);

      await expect(service.getPreScreenByApplicationId('missing')).rejects.toThrow(NotFoundException);
    });
  });

  // ── Output shape validation (mock mode) ───────────────────────────────────

  describe('mock output shape', () => {
    it('mock output has all required fields for a PASS recommendation', () => {
      const output = MOCK_PRESCREEN_OUTPUT;
      expect(['STRONG_PASS', 'PASS', 'CONDITIONAL', 'FAIL']).toContain(output.recommendation);
      expect(output.completenessScore).toBeGreaterThanOrEqual(0);
      expect(output.completenessScore).toBeLessThanOrEqual(100);
      expect(Array.isArray(output.redFlags)).toBe(true);
      expect(Array.isArray(output.suggestedProbeQuestions)).toBe(true);
      expect(output.linkedinVerification).toHaveProperty('verified');
      expect(output.linkedinVerification).toHaveProperty('confidence');
    });
  });
});
