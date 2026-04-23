/**
 * Integration test stubs — OpportunityBriefsService
 *
 * These tests run entirely against DUMMY_AI_MODE (no live OpenAI calls).
 * Set DUMMY_AI_MODE=true in your test environment (or .env.test) to ensure
 * the mock path is always used here.
 *
 * Run: cd backend && npm test -- --testPathPattern opportunity-briefs
 */
import { Test, TestingModule } from '@nestjs/testing';
import { OpportunityBriefsService } from './opportunity-briefs.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

// ── Shared mock factories ────────────────────────────────────────────────────

const MOCK_BRIEF_OUTPUT = {
  summary: 'Test opportunity summary.',
  keyResponsibilities: ['Responsibility 1', 'Responsibility 2'],
  successMetrics: ['Metric 1'],
  timeline: '30-day sprint',
  talentProfile: 'Experienced BD leader.',
  riskFactors: ['Market timing'],
  growthPotential: 'Could evolve into a retainer.',
};

function makeMockAiService(): jest.Mocked<Pick<AiService, 'generateOpportunityBrief' | 'getModelName' | 'isDummyMode'>> {
  return {
    generateOpportunityBrief: jest.fn().mockResolvedValue(MOCK_BRIEF_OUTPUT),
    getModelName: jest.fn().mockReturnValue('mock-model'),
    isDummyMode: true,
  };
}

function makeMockPrisma() {
  return {
    application: {
      findUnique: jest.fn(),
    },
    opportunityBrief: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
}

// ── Test suite ───────────────────────────────────────────────────────────────

describe('OpportunityBriefsService', () => {
  let service: OpportunityBriefsService;
  let prisma: ReturnType<typeof makeMockPrisma>;
  let aiService: ReturnType<typeof makeMockAiService>;

  beforeEach(async () => {
    prisma = makeMockPrisma();
    aiService = makeMockAiService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpportunityBriefsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AiService, useValue: aiService },
      ],
    }).compile();

    service = module.get<OpportunityBriefsService>(OpportunityBriefsService);
  });

  afterEach(() => jest.clearAllMocks());

  // ── generateBrief ──────────────────────────────────────────────────────────

  describe('generateBrief', () => {
    const APPLICATION_ID = 'app_test_001';

    const MOCK_APPLICATION = {
      id: APPLICATION_ID,
      companyName: 'Acme Corp',
      needArea: 'Sales',
      targetMarkets: 'EU',
      budgetRange: '$5,000–$10,000',
      urgency: 'High',
      needDiagnosis: {
        aiContent: {
          analysis: 'Strong product, weak pipeline.',
          recommendedRole: 'Fractional VP Sales',
          estimatedSprint: '30-day sprint',
          challenges: ['No pipeline'],
          opportunities: ['Expansion to EU'],
        },
      },
    };

    it('returns existing brief without re-generating', async () => {
      const existingBrief = { id: 'brief_001', applicationId: APPLICATION_ID };
      prisma.application.findUnique.mockResolvedValue(MOCK_APPLICATION);
      prisma.opportunityBrief.findUnique.mockResolvedValue(existingBrief);

      const result = await service.generateBrief(APPLICATION_ID);

      expect(result).toEqual(existingBrief);
      expect(aiService.generateOpportunityBrief).not.toHaveBeenCalled();
    });

    it('calls AiService.generateOpportunityBrief with the correct input shape', async () => {
      prisma.application.findUnique.mockResolvedValue(MOCK_APPLICATION);
      prisma.opportunityBrief.findUnique.mockResolvedValue(null);
      prisma.opportunityBrief.create.mockResolvedValue({
        id: 'brief_002',
        applicationId: APPLICATION_ID,
        internalContent: MOCK_BRIEF_OUTPUT,
        clientFacingContent: {},
        aiModel: 'mock-model',
        application: MOCK_APPLICATION,
      });

      await service.generateBrief(APPLICATION_ID);

      expect(aiService.generateOpportunityBrief).toHaveBeenCalledTimes(1);
      const callArg = (aiService.generateOpportunityBrief as jest.Mock).mock.calls[0][0];
      expect(callArg).toMatchObject({
        companyName: 'Acme Corp',
        needArea: 'Sales',
        budgetRange: '$5,000–$10,000',
      });
    });

    it('persists the brief with internalContent and clientFacingContent', async () => {
      prisma.application.findUnique.mockResolvedValue(MOCK_APPLICATION);
      prisma.opportunityBrief.findUnique.mockResolvedValue(null);
      prisma.opportunityBrief.create.mockResolvedValue({
        id: 'brief_003',
        applicationId: APPLICATION_ID,
        internalContent: MOCK_BRIEF_OUTPUT,
        clientFacingContent: {
          summary: MOCK_BRIEF_OUTPUT.summary,
          keyResponsibilities: MOCK_BRIEF_OUTPUT.keyResponsibilities.slice(0, 5),
          successMetrics: MOCK_BRIEF_OUTPUT.successMetrics,
          timeline: MOCK_BRIEF_OUTPUT.timeline,
        },
        aiModel: 'mock-model',
        application: MOCK_APPLICATION,
      });

      const result = await service.generateBrief(APPLICATION_ID);

      expect(prisma.opportunityBrief.create).toHaveBeenCalledTimes(1);
      const createCall = (prisma.opportunityBrief.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.applicationId).toBe(APPLICATION_ID);
      expect(createCall.data.internalContent).toMatchObject({
        summary: MOCK_BRIEF_OUTPUT.summary,
      });
      expect(createCall.data.clientFacingContent).toMatchObject({
        summary: MOCK_BRIEF_OUTPUT.summary,
      });
      expect(result).toBeDefined();
    });

    it('throws NotFoundException when application does not exist', async () => {
      prisma.application.findUnique.mockResolvedValue(null);

      await expect(service.generateBrief(APPLICATION_ID)).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when application has no diagnosis', async () => {
      prisma.application.findUnique.mockResolvedValue({
        ...MOCK_APPLICATION,
        needDiagnosis: null,
      });

      await expect(service.generateBrief(APPLICATION_ID)).rejects.toThrow(BadRequestException);
    });
  });

  // ── getBriefByApplicationId ────────────────────────────────────────────────

  describe('getBriefByApplicationId', () => {
    it('returns a found brief', async () => {
      const brief = { id: 'brief_001', applicationId: 'app_001' };
      prisma.opportunityBrief.findUnique.mockResolvedValue(brief);

      await expect(service.getBriefByApplicationId('app_001')).resolves.toEqual(brief);
    });

    it('throws NotFoundException when brief does not exist', async () => {
      prisma.opportunityBrief.findUnique.mockResolvedValue(null);

      await expect(service.getBriefByApplicationId('app_missing')).rejects.toThrow(NotFoundException);
    });
  });
});
